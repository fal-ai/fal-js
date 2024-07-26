'use client';

import * as fal from '@fal-ai/serverless-client';
import { useRef, useState } from 'react';

fal.config({
  proxyUrl: '/api/fal/proxy',
});

type PlayHTInput = {
  text: string;
};

const DEFAULT_PROMPT =
  "As she sat watching the world go by, something caught her eye. It wasn't so much its color or shape, but the way it was moving. She squinted to see if she could better understand what it was and where it was going, but it didn't help. As she continued to stare into the distance, she didn't understand why this uneasiness was building inside her body.";

export default function AudioStreamingDemo() {
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  const [streamStatus, setStreamStatus] = useState<string>('idle');
  const [timeToFirstChunk, setTimeToFirstChunk] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);

  const setupMediaSource = () => {
    if (!audioRef.current) {
      console.warn('Audio element not found or not ready');
      return null;
    }
    const mediaSource = new MediaSource();
    mediaSourceRef.current = mediaSource;
    const url = URL.createObjectURL(mediaSource);
    audioRef.current.src = url;
    mediaSource.addEventListener('sourceopen', () => {
      const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
      sourceBufferRef.current = sourceBuffer;
    });
    return url;
  };

  const runInference = async () => {
    setupMediaSource();
    setTimeToFirstChunk(null);
    const startedAt = Date.now();
    const stream = await fal.stream<PlayHTInput, Uint8Array>(
      'fal-ai/playht-tts',
      {
        input: {
          text: prompt,
        },
        connectionMode: 'server',
      }
    );
    setStreamStatus('running');
    let firstChunk = true;

    stream.on('data', (data: Uint8Array) => {
      if (audioRef.current?.paused) {
        audioRef.current?.play();
      }
      if (firstChunk) {
        setTimeToFirstChunk(Date.now() - startedAt);
        firstChunk = false;
      }
      const sourceBuffer = sourceBufferRef.current;

      if (sourceBuffer) {
        sourceBuffer.appendBuffer(data);
      } else {
        console.warn('Source buffer not found or not ready');
      }
    });

    await stream.done();
    setStreamStatus('done');
    sourceBufferRef.current?.addEventListener('updateend', () => {
      mediaSourceRef.current?.endOfStream();
    });
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-100">
      <main className="container dark:text-gray-50 text-gray-900 flex flex-col items-center justify-center w-full flex-1 py-10 space-y-8">
        <h1 className="text-2xl font-bold mb-8">
          Hello <code className="text-pink-600">fal</code> +{' '}
          <code className="text-indigo-500">streaming</code>
        </h1>

        <div className="flex flex-col space-y-2 flex-1 w-full">
          <textarea
            className="flex-1 p-2 rounded bg-black/10 dark:bg-white/5 border border-black/20 dark:border-white/10 text-sm"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Prompt"
            rows={4}
          ></textarea>
          <button
            onClick={runInference}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 mx-auto rounded focus:outline-none focus:shadow-outline disabled:opacity-70"
            disabled={streamStatus === 'running'}
          >
            Run inference
          </button>
        </div>

        <div className="w-full flex flex-col space-y-4">
          <div className="flex flex-row items-center justify-between">
            <h2 className="text-2xl font-bold">Result</h2>
            <div className="space-x-4">
              <span>
                time to first chunk:{' '}
                <code className="font-semibold">
                  {timeToFirstChunk ? `${timeToFirstChunk}ms` : 'n/a'}
                </code>
              </span>
              <span>
                streaming: <code className="font-semibold">{streamStatus}</code>
              </span>
            </div>
          </div>
          <audio controls className="w-full" ref={audioRef} />
        </div>
      </main>
    </div>
  );
}
