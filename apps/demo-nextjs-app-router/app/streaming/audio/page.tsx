'use client';

import * as fal from '@fal-ai/serverless-client';
import { useEffect, useRef, useState } from 'react';

fal.config({
  proxyUrl: '/api/fal/proxy',
});

type PlayHTInput = {
  text: string;
};

export default function AudioStreamingDemo() {
  const [streamStatus, setStreamStatus] = useState<string>('idle');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      console.warn('Audio element not found or not ready');
      return;
    }
    const mimeCodec = 'audio/mpeg';

    let sourceUrl: string | null = null;
    if ('MediaSource' in window && MediaSource.isTypeSupported(mimeCodec)) {
      const mediaSource = new MediaSource();
      mediaSourceRef.current = mediaSource;
      sourceUrl = URL.createObjectURL(mediaSource);
      console.log('sourceUrl', sourceUrl);
      audioRef.current.src = sourceUrl;

      mediaSource.addEventListener('sourceopen', () => {
        console.log('MediaSource ready - adding source buffer');
        const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
        // sourceBuffer.addEventListener('updateend', () => {
        //   mediaSource.endOfStream();
        // });
        sourceBufferRef.current = sourceBuffer;
      });
    } else {
      console.error(
        'Unsupported MIME type or MediaSource API is not available'
      );
    }

    return () => {
      if (sourceUrl) {
        URL.revokeObjectURL(sourceUrl);
      }
    };
  }, []);

  const runInference = async () => {
    const stream = await fal.stream<PlayHTInput, Uint8Array>(
      'fal-ai/playht-tts',
      {
        input: {
          text: 'Do you know who drew this picture and what is the name of it?',
        },
      }
    );
    setStreamStatus('running');

    stream.on('data', (data: Uint8Array) => {
      const sourceBuffer = sourceBufferRef.current;

      audioRef.current?.play();

      if (sourceBuffer) {
        console.log('Appending buffer...');
        // sourceBuffer.appendBuffer(data);
        // console.log('sourceBuffer', sourceBuffer);
      } else {
        console.warn('Source buffer not found or not ready');
      }
    });

    const result = await stream.done();
    console.log('result', result);
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

        <div className="flex flex-row space-x-2">
          <button
            onClick={runInference}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-3 px-6 mx-auto rounded focus:outline-none focus:shadow-outline disabled:opacity-70"
          >
            Run inference
          </button>
        </div>

        <div className="w-full flex flex-col space-y-4">
          <div className="flex flex-row items-center justify-between">
            <h2 className="text-2xl font-bold">Answer</h2>
            <span>
              streaming: <code className="font-semibold">{streamStatus}</code>
            </span>
          </div>
          <audio controls className="w-full" ref={audioRef} />
        </div>
      </main>
    </div>
  );
}
