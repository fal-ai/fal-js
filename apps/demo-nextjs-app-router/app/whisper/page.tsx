'use client';

import * as fal from '@fal-ai/serverless-client';
import { useCallback, useMemo, useState } from 'react';

fal.config({
  // credentials: 'FAL_KEY_ID:FAL_KEY_SECRET',
  requestMiddleware: fal.withProxy({
    targetUrl: '/api/fal/proxy',
  }),
});

type ErrorProps = {
  error: any;
};

function Error(props: ErrorProps) {
  if (!props.error) {
    return null;
  }
  return (
    <div
      className="p-4 mb-4 text-sm text-red-800 rounded bg-red-50 dark:bg-gray-800 dark:text-red-400"
      role="alert"
    >
      <span className="font-medium">Error</span> {props.error.message}
    </div>
  );
}

async function record(stream: any): Promise<File> {
  const audioChunks: any = [];
  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (e) => {
    audioChunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    mediaRecorder.addEventListener('stop', async () => {
      console.log('sending request to fal');
      // Create a blob from the audio chunks
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], 'recording.webm', {
        type: 'audio/webm',
      });
      resolve(audioFile);
    });
    setTimeout(() => {
      console.log('stopped');
      mediaRecorder.stop();
    }, 10000);
    mediaRecorder.start();
  });
}

export default function WhisperDemo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const reset = () => {
    setLoading(false);
    setError(null);
    setLogs([]);
    setElapsedTime(0);
    setResult(null);
  };

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return record(stream);
  }, []);

  const transcribeAudio = async (audioFile: File) => {
    reset();
    setLoading(true);
    const start = Date.now();
    try {
      const result = await fal.subscribe('110602490-whisper', {
        input: {
          file_name: 'recording.wav',
          url: audioFile,
        },
        pollInterval: 1000,
        logs: true,
        onQueueUpdate(update) {
          setElapsedTime(Date.now() - start);
          if (
            update.status === 'IN_PROGRESS' ||
            update.status === 'COMPLETED'
          ) {
            setLogs((update.logs || []).map((log) => log.message));
          }
        },
      });
      setResult(result);
      console.log(result);
    } catch (error: any) {
      setError(error);
    } finally {
      setLoading(false);
      setElapsedTime(Date.now() - start);
    }
  };
  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-100">
      <main className="container dark:text-gray-50 text-gray-900 flex flex-col items-center justify-center w-full flex-1 py-10 space-y-8">
        <h1 className="text-4xl font-bold mb-8">
          Hello <code className="font-light text-pink-600">fal</code> and <code className='text-indigo-500'>Whisper</code>
        </h1>

        <button
          onClick={async (e) => {
            e.preventDefault();
            const audioFile = await startRecording();
            transcribeAudio(audioFile);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-3 px-6 mx-auto rounded focus:outline-none focus:shadow-outline"
          disabled={loading}
        >
          {loading ? 'Transcribing...' : 'Transcribe'}
        </button>

        <Error error={error} />

        <div className="w-full flex flex-col space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-light">JSON Result</h3>
            <p className="text-sm text-current/80">
              {`Elapsed Time (seconds): ${(elapsedTime / 1000).toFixed(2)}`}
            </p>
            <pre className="text-sm bg-black/70 text-white/80 font-mono h-60 rounded whitespace-pre overflow-auto w-full">
              {result
                ? JSON.stringify(result, null, 2)
                : '// result pending...'}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-light">Logs</h3>
            <pre className="text-sm bg-black/70 text-white/80 font-mono h-60 rounded whitespace-pre overflow-auto w-full">
              {logs.filter(Boolean).join('\n')}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
