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

type RecorderOptions = {
  maxDuration?: number;
};

function useMediaRecorder({ maxDuration = 10000 }: RecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  const record = useCallback(async () => {
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioChunks: BlobPart[] = [];
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);
    return new Promise<File>((resolve, reject) => {
      try {
        recorder.addEventListener('dataavailable', (event) => {
          audioChunks.push(event.data);
        });
        recorder.addEventListener('stop', async () => {
          const fileOptions = { type: 'audio/wav' };
          const audioBlob = new Blob(audioChunks, fileOptions);
          const audioFile = new File(
            [audioBlob],
            `recording_${Date.now()}.wav`,
            fileOptions
          );
          setIsRecording(false);
          resolve(audioFile);
        });
        setTimeout(() => {
          recorder.stop();
          recorder.stream.getTracks().forEach((track) => track.stop());
        }, maxDuration);
        recorder.start();
      } catch (error) {
        reject(error);
      }
    });
  }, [maxDuration]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    mediaRecorder?.stop();
    mediaRecorder?.stream.getTracks().forEach((track) => track.stop());
  }, [mediaRecorder]);

  return { record, stopRecording, isRecording };
}

export default function WhisperDemo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const { record, stopRecording, isRecording } = useMediaRecorder();

  const reset = () => {
    setLoading(false);
    setError(null);
    setLogs([]);
    setElapsedTime(0);
    setResult(null);
  };

  const audioFileLocalUrl = useMemo(() => {
    if (!audioFile) {
      return null;
    }
    return URL.createObjectURL(audioFile);
  }, [audioFile]);

  const transcribeAudio = async (audioFile: File) => {
    reset();
    setLoading(true);
    const start = Date.now();
    try {
      const result = await fal.subscribe('fal-ai/whisper', {
        input: {
          file_name: 'recording.wav',
          audio_url: audioFile,
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
          Hello <code className="text-pink-600">fal</code> and{' '}
          <code className="text-indigo-500">whisper</code>
        </h1>

        <div className="flex flex-row space-x-2">
          <button
            onClick={async (e) => {
              e.preventDefault();
              try {
                if (isRecording) {
                  stopRecording();
                } else {
                  const recordedAudio = await record();
                  setAudioFile(recordedAudio);
                }
              } catch (e: any) {
                setError(e);
              }
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-3 px-6 mx-auto rounded focus:outline-none focus:shadow-outline disabled:opacity-70"
            disabled={loading}
          >
            {isRecording ? 'Stop Recording' : 'Record'}
          </button>
          <button
            onClick={async (e) => {
              e.preventDefault();
              if (audioFile) {
                try {
                  await transcribeAudio(audioFile);
                } catch (e: any) {
                  setError(e);
                }
              }
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-3 px-6 mx-auto rounded focus:outline-none focus:shadow-outline disabled:opacity-70"
            disabled={loading || !audioFile}
          >
            {loading ? 'Transcribing...' : 'Transcribe'}
          </button>
        </div>

        {audioFileLocalUrl && (
          <div className="text-lg w-full my-2">
            <audio className="mx-auto" controls src={audioFileLocalUrl} />
          </div>
        )}

        <Error error={error} />

        <div className="w-full flex flex-col space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-light">JSON Result</h3>
            <p className="text-sm text-current/80">
              {`Elapsed Time (seconds): ${(elapsedTime / 1000).toFixed(2)}`}
            </p>
            <pre className="text-sm bg-black/70 text-white/80 font-mono h-96 rounded whitespace-pre overflow-auto w-full">
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
