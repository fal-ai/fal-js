"use client";

/* eslint-disable @next/next/no-img-element */
import * as fal from "@fal-ai/serverless-client";
import { ChangeEvent, useRef, useState } from "react";
import { DrawingCanvas } from "../../components/drawing";

fal.config({
  proxyUrl: "/api/fal/proxy",
});

const PROMPT_EXPANDED =
  ", beautiful, colorful, highly detailed, best quality, uhd";

const PROMPT = "a moon in the night sky";

const defaults = {
  model_name: "runwayml/stable-diffusion-v1-5",
  image_size: "square",
  num_inference_steps: 4,
  seed: 6252023,
};

export default function RealtimePage() {
  const [prompt, setPrompt] = useState(PROMPT);

  const currentDrawing = useRef<Uint8Array | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const { send } = fal.realtime.connect(
    "fal-ai/fast-lcm-diffusion/image-to-image",
    {
      connectionKey: "realtime-demo",
      throttleInterval: 128,
      onResult(result) {
        if (result.images && result.images[0] && result.images[0].content) {
          const canvas = outputCanvasRef.current;
          const context = canvas?.getContext("2d");
          if (canvas && context) {
            const imageBytes: Uint8Array = result.images[0].content;
            const blob = new Blob([imageBytes], { type: "image/png" });
            createImageBitmap(blob)
              .then((bitmap) => {
                context.drawImage(bitmap, 0, 0);
              })
              .catch(console.error);
          }
        }
      },
    },
  );

  const handlePromptChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
    if (currentDrawing.current) {
      send({
        prompt: e.target.value.trim() + PROMPT_EXPANDED,
        image_bytes: currentDrawing.current,
        ...defaults,
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-50">
      <main className="container flex w-full flex-1 flex-col items-center justify-center space-y-8 py-10">
        <h1 className="mb-8 font-mono text-4xl text-neutral-50">
          fal<code className="font-light text-pink-600">realtime</code>
        </h1>
        <div className="w-full max-w-full text-neutral-400">
          <input
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xl italic"
            value={prompt}
            onChange={handlePromptChange}
          />
        </div>
        <div className="flex flex-col space-x-4 md:flex-row">
          <div className="flex-1">
            <DrawingCanvas
              onCanvasChange={({ imageData }) => {
                currentDrawing.current = imageData;
                send({
                  prompt: prompt + PROMPT_EXPANDED,
                  image_bytes: imageData,
                  ...defaults,
                });
              }}
            />
          </div>
          <div className="flex-1">
            <div>
              <canvas
                className="h-[512px] w-[512px]"
                width="512"
                height="512"
                ref={outputCanvasRef}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
