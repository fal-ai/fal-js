"use client";

import * as fal from "@fal-ai/serverless-client";
import { useMemo, useState } from "react";

// @snippet:start(client.config)
fal.config({
  proxyUrl: "/api/fal/proxy", // the built-int nextjs proxy
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
      className="mb-4 rounded bg-red-50 p-4 text-sm text-red-800 dark:bg-gray-800 dark:text-red-400"
      role="alert"
    >
      <span className="font-medium">Error</span> {props.error.message}
    </div>
  );
}

export default function ComfyImageToVideoPage() {
  // @snippet:start("client.ui.state")
  // Input state
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
    return result.outputs[10].images[0];
  };

  const generateVideo = async () => {
    reset();
    // @snippet:start("client.queue.subscribe")
    setLoading(true);
    const start = Date.now();
    try {
      const result: Result = await fal.subscribe(
        "comfy/fal-ai/image-to-video",
        {
          input: {
            loadimage_1: imageFile,
          },
          logs: true,
          onQueueUpdate(update) {
            setElapsedTime(Date.now() - start);
            if (
              update.status === "IN_PROGRESS" ||
              update.status === "COMPLETED"
            ) {
              setLogs((update.logs || []).map((log) => log.message));
            }
          },
        },
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <main className="container flex w-full flex-1 flex-col items-center justify-center space-y-8 py-10 text-gray-900 dark:text-gray-50">
        <h1 className="mb-8 text-4xl font-bold">Comfy SVD - Image to Video</h1>
        <div className="w-full text-lg">
          <label htmlFor="image" className="mb-2 block text-current">
            Image
          </label>
          <div className="flex w-full flex-col space-y-4">
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
              className="w-full rounded border border-black/20 bg-black/10 p-2 text-sm dark:border-white/10 dark:bg-white/5"
              id="image_url"
              name="image_url"
              type="file"
              placeholder="Choose a file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            generateVideo();
          }}
          className="focus:shadow-outline mx-auto rounded bg-indigo-600 py-3 px-6 text-lg font-bold text-white hover:bg-indigo-700 focus:outline-none"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Video"}
        </button>

        <Error error={error} />

        <div className="flex w-full flex-col space-y-4">
          <div className="mx-auto">
            {video && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={video.url} alt="" />
            )}
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-light">JSON Result</h3>
            <p className="text-current/80 text-sm">
              {`Elapsed Time (seconds): ${(elapsedTime / 1000).toFixed(2)}`}
            </p>
            <pre className="h-60 w-full overflow-auto whitespace-pre rounded bg-black/70 font-mono text-sm text-white/80">
              {result
                ? JSON.stringify(result, null, 2)
                : "// result pending..."}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-light">Logs</h3>
            <pre className="h-60 w-full overflow-auto whitespace-pre rounded bg-black/70 font-mono text-sm text-white/80">
              {logs.filter(Boolean).join("\n")}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
