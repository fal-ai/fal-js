/* eslint-disable @next/next/no-img-element */
"use client";

import * as fal from "@fal-ai/serverless-client";
import { MutableRefObject, useEffect, useRef, useState } from "react";

fal.config({
  proxyUrl: "/api/fal/proxy",
});

const EMPTY_IMG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjOHPmzH8ACDADZKt3GNsAAAAASUVORK5CYII=";

type WebcamOptions = {
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  previewRef: MutableRefObject<HTMLCanvasElement | null>;
  onFrameUpdate?: (data: Uint8Array) => void;
  width?: number;
  height?: number;
};
const useWebcam = ({
  videoRef,
  previewRef,
  onFrameUpdate,
  width = 512,
  height = 512,
}: WebcamOptions) => {
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current !== null) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      });
    }
  }, [videoRef]);

  const captureFrame = () => {
    const canvas = previewRef.current;
    const video = videoRef.current;
    if (canvas === null || video === null) {
      return;
    }

    // Calculate the aspect ratio and crop dimensions
    const aspectRatio = video.videoWidth / video.videoHeight;
    let sourceX, sourceY, sourceWidth, sourceHeight;

    if (aspectRatio > 1) {
      // If width is greater than height
      sourceWidth = video.videoHeight;
      sourceHeight = video.videoHeight;
      sourceX = (video.videoWidth - video.videoHeight) / 2;
      sourceY = 0;
    } else {
      // If height is greater than or equal to width
      sourceWidth = video.videoWidth;
      sourceHeight = video.videoWidth;
      sourceX = 0;
      sourceY = (video.videoHeight - video.videoWidth) / 2;
    }

    // Resize the canvas to the target dimensions
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (context === null) {
      return;
    }

    // Draw the image on the canvas (cropped and resized)
    context.drawImage(
      video,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      width,
      height,
    );

    // Callback with frame data
    if (onFrameUpdate) {
      canvas.toBlob(
        (blob) => {
          blob?.arrayBuffer().then((buffer) => {
            const frameData = new Uint8Array(buffer);
            onFrameUpdate(frameData);
          });
        },
        "image/jpeg",
        0.7,
      );
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      captureFrame();
    }, 16); // Adjust interval as needed

    return () => clearInterval(interval);
  });
};

type LCMInput = {
  prompt: string;
  image_bytes: Uint8Array;
  strength?: number;
  negative_prompt?: string;
  seed?: number | null;
  guidance_scale?: number;
  num_inference_steps?: number;
  enable_safety_checks?: boolean;
  request_id?: string;
  height?: number;
  width?: number;
};

type ImageOutput = {
  content: Uint8Array;
  width: number;
  height: number;
};

type LCMOutput = {
  images: ImageOutput[];
  timings: Record<string, number>;
  seed: number;
  num_inference_steps: number;
  request_id: string;
  nsfw_content_detected: boolean[];
};

export default function WebcamPage() {
  const [enabled, setEnabled] = useState(false);
  const processedImageRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewRef = useRef<HTMLCanvasElement | null>(null);

  const { send } = fal.realtime.connect<LCMInput, LCMOutput>(
    "fal-ai/fast-turbo-diffusion/image-to-image",
    {
      connectionKey: "camera-turbo-demo",
      // not throttling the client, handling throttling of the camera itself
      // and letting all requests through in real-time
      throttleInterval: 0,
      onResult(result) {
        if (processedImageRef.current && result.images && result.images[0]) {
          const blob = new Blob([result.images[0].content], {
            type: "image/jpeg",
          });
          const url = URL.createObjectURL(blob);
          processedImageRef.current.src = url;
        }
      },
    },
  );

  const onFrameUpdate = (data: Uint8Array) => {
    if (!enabled) {
      return;
    }
    send({
      prompt: "a picture of george clooney, elegant, in a suit, 8k, uhd",
      image_bytes: data,
      num_inference_steps: 3,
      strength: 0.6,
      guidance_scale: 1,
      seed: 6252023,
    });
  };

  useWebcam({
    videoRef,
    previewRef,
    onFrameUpdate,
  });

  return (
    <main className="mx-auto my-20 flex-col px-32">
      <h1 className="mb-8 text-center font-mono text-4xl text-current">
        fal<code className="font-light text-pink-600">camera</code>
      </h1>
      <video ref={videoRef} style={{ display: "none" }}></video>
      <div className="flex items-center justify-center py-12">
        <button
          className="rounded bg-indigo-700 py-3 px-4 text-lg text-white"
          onClick={() => {
            setEnabled(!enabled);
          }}
        >
          {enabled ? "Stop" : "Start"}
        </button>
      </div>
      <div className="flex flex-col justify-between space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
        <canvas ref={previewRef} width="512" height="512"></canvas>
        <img
          ref={processedImageRef}
          src={EMPTY_IMG}
          width={512}
          height={512}
          className="min-h-[512px] min-w-[512px]"
          alt="generated"
        />
      </div>
    </main>
  );
}
