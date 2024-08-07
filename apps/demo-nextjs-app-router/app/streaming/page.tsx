"use client";

import * as fal from "@fal-ai/serverless-client";
import { useState } from "react";

fal.config({
  proxyUrl: "/api/fal/proxy",
});

type LlavaInput = {
  prompt: string;
  image_url: string;
  max_new_tokens?: number;
  temperature?: number;
  top_p?: number;
};

type LlavaOutput = {
  output: string;
  partial: boolean;
  stats: {
    num_input_tokens: number;
    num_output_tokens: number;
  };
};

export default function StreamingDemo() {
  const [answer, setAnswer] = useState<string>("");
  const [streamStatus, setStreamStatus] = useState<string>("idle");

  const runInference = async () => {
    const stream = await fal.stream<LlavaInput, LlavaOutput>(
      "fal-ai/llavav15-13b",
      {
        input: {
          prompt:
            "Do you know who drew this picture and what is the name of it?",
          image_url: "https://llava-vl.github.io/static/images/monalisa.jpg",
          max_new_tokens: 100,
          temperature: 0.2,
          top_p: 1,
        },
      },
    );
    setStreamStatus("running");

    for await (const partial of stream) {
      setAnswer(partial.output);
    }

    const result = await stream.done();
    setStreamStatus("done");
    setAnswer(result.output);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <main className="container flex w-full flex-1 flex-col items-center justify-center space-y-8 py-10 text-gray-900 dark:text-gray-50">
        <h1 className="mb-8 text-4xl font-bold">
          Hello <code className="text-pink-600">fal</code> +{" "}
          <code className="text-indigo-500">streaming</code>
        </h1>

        <div className="flex flex-row space-x-2">
          <button
            onClick={runInference}
            className="focus:shadow-outline mx-auto rounded bg-indigo-600 py-3 px-6 text-lg font-bold text-white hover:bg-indigo-700 focus:outline-none disabled:opacity-70"
          >
            Run inference
          </button>
        </div>

        <div className="flex w-full flex-col space-y-4">
          <div className="flex flex-row items-center justify-between">
            <h2 className="text-2xl font-bold">Answer</h2>
            <span>
              streaming: <code className="font-semibold">{streamStatus}</code>
            </span>
          </div>
          <p className="min-h-[12rem] rounded border border-gray-300 bg-gray-200 p-4 text-lg dark:border-gray-700 dark:bg-gray-800">
            {answer}
          </p>
        </div>
      </main>
    </div>
  );
}
