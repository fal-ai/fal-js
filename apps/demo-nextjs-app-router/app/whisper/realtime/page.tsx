'use client';

import * as fal from '@fal-ai/serverless-client';
import { useCallback, useMemo, useRef, useState } from 'react';

fal.config({
  // credentials: 'FAL_KEY_ID:FAL_KEY_SECRET',
  proxyUrl: '/api/fal/proxy',
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
  onChunk?: (chunk: Blob) => void;
  sendInterval?: number;
};

function useMediaRecorder({
  maxDuration = 600000,
  onChunk,
  sendInterval = 1000,
}: RecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const accumulatedChunks = useRef<BlobPart[]>([]); // Use a ref to accumulate chunks

  const sendAccumulatedData = useCallback(() => {
    // Convert accumulated chunks to a single blob
    const audioBlob = new Blob(accumulatedChunks.current, {
      type: 'audio/wav',
    });
    console.log('Sending data chunk of size:', audioBlob.size);
    if (onChunk) {
      onChunk(audioBlob);
    }
    // Clear the accumulated chunks after sending
    accumulatedChunks.current = [];
  }, [onChunk]);

  const record = useCallback((): Promise<File> => {
    setIsRecording(true);
    accumulatedChunks.current = []; // Reset accumulated chunks
    return new Promise<File>(async (resolve, reject) => {
      // Explicitly type the Promise here
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);

        recorder.addEventListener('dataavailable', (event) => {
          accumulatedChunks.current.push(event.data);
        });

        recorder.addEventListener('stop', () => {
          const audioBlob = new Blob(accumulatedChunks.current, {
            type: 'audio/wav',
          });
          const audioFile = new File(
            [audioBlob],
            `recording_${Date.now()}.wav`,
            { type: 'audio/wav' }
          );

          sendAccumulatedData(); // Ensure final data is sent
          setIsRecording(false);
          resolve(audioFile); // Resolve the promise with the audio file
        });

        recorder.start(sendInterval); // Configure how often you get 'dataavailable' events

        // Periodically send accumulated data
        const intervalId = setInterval(() => {
          sendAccumulatedData();
        }, sendInterval);

        setTimeout(() => {
          clearInterval(intervalId); // Stop the interval when recording stops
          recorder.stop();
          recorder.stream.getTracks().forEach((track) => track.stop());
        }, maxDuration);
      } catch (error) {
        reject(error);
      }
    });
  }, [maxDuration, sendAccumulatedData, sendInterval]);

  // Stop recording logic remains the same
  const stopRecording = useCallback(() => {
    setIsRecording(false);
    mediaRecorder?.stop();
    mediaRecorder?.stream.getTracks().forEach((track) => track.stop());
  }, [mediaRecorder]);

  return { record, stopRecording, isRecording };
}

interface RealTimeOutput {
  // The structure of your real-time output
  message: string;
}

export default function WhisperDemo() {
  const [realTimeOutputs, setRealTimeOutputs] = useState<RealTimeOutput[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const { send } = fal.realtime.connect('fal-ai/fast-whisper', {
    connectionKey: 'realtime-demo',
    throttleInterval: 128,
    onResult(result) {
      console.log('result', result);
      handleNewOutput({ message: result.output });
    },
  });
  const accumulatedChunksRef = useRef(new Uint8Array()); // To store accumulated chunks

  const { record, stopRecording, isRecording } = useMediaRecorder({
    onChunk: async (chunk) => {
      const buffer = await chunk.arrayBuffer();
      const newChunk = new Uint8Array(buffer);

      // Accumulate chunks
      const accumulatedChunks = new Uint8Array(
        accumulatedChunksRef.current.length + newChunk.length
      );
      accumulatedChunks.set(accumulatedChunksRef.current, 0);
      accumulatedChunks.set(newChunk, accumulatedChunksRef.current.length);
      accumulatedChunksRef.current = accumulatedChunks;

      // Send the accumulated chunks using your `send` method
      // Ensure that the content is sent as a byte type
      send({ content: accumulatedChunksRef.current }); // Send the Uint8Array directly
    },
  });

  const handleNewOutput = (newOutput: RealTimeOutput) => {
    // Set only the latest output, replacing any previous ones
    setRealTimeOutputs([newOutput]);
  };

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
                  const recordedAudioFile = await record();
                  setAudioFile(recordedAudioFile);
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

        {/* Real-Time Outputs Section */}
        <div className="real-time-output-section">
          <h2 className="text-2xl font-semibold my-4">Real-Time Outputs</h2>
          <div className="output-container bg-gray-50 p-4 rounded-lg shadow">
            {realTimeOutputs.map((output, index) => (
              <p key={index}>{output.message}</p> // Ensure 'message' is the correct property
            ))}
          </div>
        </div>

        {/* JSON Result Section */}
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
