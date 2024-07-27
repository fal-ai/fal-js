'use client';

import * as fal from '@fal-ai/serverless-client';
import { useState } from 'react';

fal.config({
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

const DEFAULT_ENDPOINT_ID = 'fal-ai/fast-sdxl';
const DEFAULT_INPUT = `{
  "prompt": "A beautiful sunset over the ocean"
}`;

export default function Home() {
  // Input state
  const [endpointId, setEndpointId] = useState<string>(DEFAULT_ENDPOINT_ID);
  const [input, setInput] = useState<string>(DEFAULT_INPUT);
  // Result state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const reset = () => {
    setLoading(false);
    setError(null);
    setResult(null);
    setLogs([]);
    setElapsedTime(0);
  };

  const run = async () => {
    reset();
    setLoading(true);
    const start = Date.now();
    try {
      const result: any = await fal.subscribe(endpointId, {
        input: JSON.parse(input),
        logs: true,
        // mode: "streaming",
        mode: 'polling',
        pollInterval: 1000,
        onQueueUpdate(update) {
          console.log('queue update');
          console.log(update);
          setElapsedTime(Date.now() - start);
          if (
            update.status === 'IN_PROGRESS' ||
            update.status === 'COMPLETED'
          ) {
            if (update.logs && update.logs.length > logs.length) {
              setLogs((update.logs || []).map((log) => log.message));
            }
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
          <code className="font-light text-pink-600">fal</code>
          <code>queue</code>
        </h1>
        <div className="text-lg w-full">
          <label htmlFor="prompt" className="block mb-2 text-current">
            Endpoint ID
          </label>
          <input
            className="w-full text-base p-2 rounded bg-black/10 dark:bg-white/5 border border-black/20 dark:border-white/10"
            id="endpointId"
            name="endpointId"
            autoComplete="off"
            placeholder="Endpoint ID"
            value={endpointId}
            spellCheck={false}
            onChange={(e) => setEndpointId(e.target.value)}
          />
        </div>
        <div className="text-lg w-full">
          <label htmlFor="prompt" className="block mb-2 text-current">
            JSON Input
          </label>
          <textarea
            className="w-full text-sm p-2 rounded bg-black/10 dark:bg-white/5 border border-black/20 dark:border-white/10 font-mono"
            id="input"
            name="Input"
            placeholder="JSON"
            value={input}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
          ></textarea>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            run();
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-3 px-6 mx-auto rounded focus:outline-none focus:shadow-outline"
          disabled={loading}
        >
          {loading ? 'Running...' : 'Run'}
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
              {logs.join('\n')}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
