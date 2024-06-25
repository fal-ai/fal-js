'use client';

import * as fal from '@fal-ai/serverless-client';
import { useMemo, useState } from 'react';

// @snippet:start(client.config)
fal.config({
  proxyUrl: '/api/fal/proxy', // the built-int nextjs proxy
  // proxyUrl: 'http://localhost:3333/api/fal/proxy', // or your own external proxy
});
// @snippet:end

// @snippet:start(client.result.type)
type Image = {
  filename: string;
  subfolder: string;
  type: string;
  url: string;
};

type Result = {
  url: string;
  outputs: Record<string, any>[];
  images: Image[];
};
// @snippet:end

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

const DEFAULT_PROMPT =
  'photograph of victorian woman with wings, sky clouds, meadow grass';

export default function ComfyImageToImagePage() {
  // @snippet:start("client.ui.state")
  // Input state
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  const [imageFile, setImageFile] = useState<File | null>(null);
  // Result state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  // @snippet:end
  const video = useMemo(() => {
    if (!result) {
      return null;
    }
    return result;
  }, [result]);

  const reset = () => {
    setLoading(false);
    setError(null);
    setResult(null);
    setLogs([]);
    setElapsedTime(0);
  };

  const getImageURL = (result: Result) => {
    return result.outputs[9].images[0];
  };

  const generateVideo = async () => {
    reset();
    // @snippet:start("client.queue.subscribe")
    setLoading(true);
    const start = Date.now();
    try {
      const result: Result = await fal.subscribe(
        'comfy/fal-ai/image-to-image',
        {
          input: {
            prompt: prompt,
            loadimage_1: imageFile,
          },
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
        }
      );
      setResult(getImageURL(result));
    } catch (error: any) {
      setError(error);
    } finally {
      setLoading(false);
      setElapsedTime(Date.now() - start);
    }
    // @snippet:end
  };
  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-100">
      <main className="container dark:text-gray-50 text-gray-900 flex flex-col items-center justify-center w-full flex-1 py-10 space-y-8">
        <h1 className="text-4xl font-bold mb-8">
          Comfy SD1.5 - Image to Image
        </h1>
        <div className="text-lg w-full">
          <label htmlFor="image" className="block mb-2 text-current">
            Image
          </label>
          <div className="w-full flex flex-col space-y-4">
            <div className="mx-auto flex">
              {imageFile && (
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt=""
                  className="mx-auto w-1/2"
                />
              )}
            </div>

            <input
              className="w-full text-sm p-2 rounded bg-black/10 dark:bg-white/5 border border-black/20 dark:border-white/10"
              id="image_url"
              name="image_url"
              type="file"
              placeholder="Choose a file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <div className="text-lg w-full">
          <label htmlFor="prompt" className="block mb-2 text-current">
            Prompt
          </label>
          <input
            className="w-full text-lg p-2 rounded bg-black/10 dark:bg-white/5 border border-black/20 dark:border-white/10"
            id="prompt"
            name="prompt"
            placeholder="Imagine..."
            value={prompt}
            autoComplete="off"
            onChange={(e) => setPrompt(e.target.value)}
            onBlur={(e) => setPrompt(e.target.value.trim())}
          />
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            generateVideo();
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-3 px-6 mx-auto rounded focus:outline-none focus:shadow-outline"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>

        <Error error={error} />

        <div className="w-full flex flex-col space-y-4">
          <div className="mx-auto">
            {video && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={video.url} alt="" />
            )}
          </div>
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
