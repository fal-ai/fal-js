"use client";

import { fal } from "@fal-ai/client";
import { useState } from "react";

fal.config({
  proxyUrl: "/api/fal/proxy",
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
      className="mb-4 rounded bg-red-50 p-4 text-sm text-red-800 dark:bg-gray-800 dark:text-red-400"
      role="alert"
    >
      <span className="font-medium">Error</span> {props.error.message}
    </div>
  );
}

const DEFAULT_ENDPOINT_ID = "fal-ai/llavav15-13b";
const DEFAULT_INPUT = {
  prompt: "Do you know who drew this picture and what is the name of it?",
  image_url: "https://llava-vl.github.io/static/images/monalisa.jpg",
  max_new_tokens: 100,
  temperature: 0.2,
  top_p: 1,
};

export default function StreamingTest() {
  // Input state
  const [endpointId, setEndpointId] = useState<string>(DEFAULT_ENDPOINT_ID);
  const [input, setInput] = useState<string>(
    JSON.stringify(DEFAULT_INPUT, null, 2),
  );
  // Result state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const reset = () => {
    setLoading(false);
    setError(null);
    setEvents([]);
    setElapsedTime(0);
  };

  const run = async () => {
    reset();
    setLoading(true);
    const start = Date.now();
    try {
      const stream = await fal.stream(endpointId, {
        input: JSON.parse(input),
      });

      for await (const partial of stream) {
        setEvents((events) => [partial, ...events]);
      }

      const result = await stream.done();
      setEvents((events) => [result, ...events]);
    } catch (error: any) {
      setError(error);
    } finally {
      setLoading(false);
      setElapsedTime(Date.now() - start);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <main className="container flex w-full flex-1 flex-col items-center justify-center space-y-8 py-10 text-gray-900 dark:text-gray-50">
        <h1 className="mb-8 text-4xl font-bold">
          <code className="font-light text-pink-600">fal</code>
          <code>queue</code>
        </h1>
        <div className="w-full text-lg">
          <label htmlFor="prompt" className="mb-2 block text-current">
            Endpoint ID
          </label>
          <input
            className="w-full rounded border border-black/20 bg-black/10 p-2 text-base dark:border-white/10 dark:bg-white/5"
            id="endpointId"
            name="endpointId"
            autoComplete="off"
            placeholder="Endpoint ID"
            value={endpointId}
            spellCheck={false}
            onChange={(e) => setEndpointId(e.target.value)}
          />
        </div>
        <div className="w-full text-lg">
          <label htmlFor="prompt" className="mb-2 block text-current">
            JSON Input
          </label>
          <textarea
            className="w-full rounded border border-black/20 bg-black/10 p-2 font-mono text-sm dark:border-white/10 dark:bg-white/5"
            id="input"
            name="Input"
            placeholder="JSON"
            value={input}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
          ></textarea>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            run();
          }}
          className="focus:shadow-outline mx-auto rounded bg-indigo-600 py-3 px-6 text-lg font-bold text-white hover:bg-indigo-700 focus:outline-none"
          disabled={loading}
        >
          {loading ? "Running..." : "Run"}
        </button>

        <Error error={error} />

        <div className="flex w-full flex-col space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-light">JSON Result</h3>
            <p className="text-current/80 text-sm">
              {`Elapsed Time (seconds): ${(elapsedTime / 1000).toFixed(2)}`}
            </p>
            <div className="flex flex-col gap-4">
              {events.map((event, index) => (
                <pre
                  key={index}
                  className="w-full overflow-auto whitespace-pre rounded bg-black/80 font-mono text-sm text-white/90"
                >
                  {JSON.stringify(event, null, 2)}
                </pre>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
