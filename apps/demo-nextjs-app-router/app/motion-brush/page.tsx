"use client";

import { createFalClient } from "@fal-ai/client";
import { useEffect, useRef, useState } from "react";

const fal = createFalClient({
  proxyUrl: "/api/fal/proxy",
});

type Coordinate = {
  x: number;
  y: number;
};

type DynamicMask = {
  mask: string | File;
  trajectories: Coordinate[];
  maskPreviewUrl?: string;
};

type VideoResult = {
  video?: {
    url: string;
  };
};

type ErrorProps = {
  error: any;
};

function ErrorDisplay(props: ErrorProps) {
  if (!props.error) {
    return null;
  }
  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <div>
          <h3 className="font-semibold">Error</h3>
          <p className="mt-1 text-sm">{props.error.message}</p>
        </div>
      </div>
    </div>
  );
}

function TrajectoryCanvas({
  maskImage,
  trajectories,
  onTrajectoriesChange,
}: {
  maskImage: string;
  trajectories: Coordinate[];
  onTrajectoriesChange: (trajectories: Coordinate[]) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !maskImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      setIsImageLoaded(true);
      drawCanvas(ctx, img, canvas.width, canvas.height);
    };
    img.src = maskImage;
  }, [maskImage]);

  useEffect(() => {
    if (!isImageLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      drawCanvas(ctx, img, canvas.width, canvas.height);
    };
    img.src = maskImage;
  }, [trajectories, isImageLoaded, maskImage]);

  const drawCanvas = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    width: number,
    height: number,
  ) => {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // Draw coordinate system overlay
    ctx.save();
    ctx.beginPath();
    ctx.arc(10, height - 10, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(59, 130, 246, 0.9)";
    ctx.fill();
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(15, height - 25, 60, 20);
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.font = "12px monospace";
    ctx.fillText("(0, 0)", 20, height - 11);
    ctx.restore();

    // Draw trajectory points and lines
    if (trajectories.length > 0) {
      ctx.strokeStyle = "rgba(239, 68, 68, 0.9)";
      ctx.fillStyle = "rgba(239, 68, 68, 0.9)";
      ctx.lineWidth = 3;
      ctx.setLineDash([]);

      trajectories.forEach((point, index) => {
        const canvasY = height - point.y;
        const canvasX = point.x;

        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 6, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(canvasX + 8, canvasY - 15, 25, 18);
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText(`${index + 1}`, canvasX + 12, canvasY - 3);
        ctx.fillStyle = "rgba(239, 68, 68, 0.9)";

        if (index < trajectories.length - 1) {
          const nextPoint = trajectories[index + 1];
          const nextCanvasY = height - nextPoint.y;
          const nextCanvasX = nextPoint.x;

          ctx.beginPath();
          ctx.moveTo(canvasX, canvasY);
          ctx.lineTo(nextCanvasX, nextCanvasY);
          ctx.stroke();

          const angle = Math.atan2(
            nextCanvasY - canvasY,
            nextCanvasX - canvasX,
          );
          const arrowLength = 10;
          ctx.beginPath();
          ctx.moveTo(nextCanvasX, nextCanvasY);
          ctx.lineTo(
            nextCanvasX - arrowLength * Math.cos(angle - Math.PI / 6),
            nextCanvasY - arrowLength * Math.sin(angle - Math.PI / 6),
          );
          ctx.moveTo(nextCanvasX, nextCanvasY);
          ctx.lineTo(
            nextCanvasX - arrowLength * Math.cos(angle + Math.PI / 6),
            nextCanvasY - arrowLength * Math.sin(angle + Math.PI / 6),
          );
          ctx.stroke();
        }
      });
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || trajectories.length >= 77) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    const x = Math.round(canvasX);
    const y = Math.round(canvas.height - canvasY);

    onTrajectoriesChange([...trajectories, { x, y }]);
  };

  const handleClearTrajectory = () => {
    onTrajectoriesChange([]);
  };

  const handleUndoLast = () => {
    if (trajectories.length > 0) {
      onTrajectoriesChange(trajectories.slice(0, -1));
    }
  };

  const isValid = trajectories.length >= 2 && trajectories.length <= 77;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={handleUndoLast}
          disabled={trajectories.length === 0}
          className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
          Undo
        </button>
        <button
          onClick={handleClearTrajectory}
          disabled={trajectories.length === 0}
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Clear
        </button>
        <div className="flex-1" />
        <div
          className={`rounded-lg px-3 py-2 text-sm font-semibold ${isValid ? "border border-green-200 bg-green-50 text-green-700" : "border border-gray-300 bg-gray-100 text-gray-600"}`}
        >
          {trajectories.length} / 77 points{" "}
          {trajectories.length > 0 && !isValid && (
            <span className="text-red-600">(min: 2)</span>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="mx-auto block max-w-full cursor-crosshair"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <p className="text-center text-xs font-medium text-white">
            Click on the image to add trajectory points • Blue dot shows origin
            (0,0)
          </p>
        </div>
      </div>

      {trajectories.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer select-none text-sm font-medium text-gray-700 hover:text-gray-900">
            View Coordinates
          </summary>
          <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-gray-900 p-3 font-mono text-xs text-green-400">
            {JSON.stringify(trajectories, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

export default function MotionBrushPage() {
  const DEFAULT_IMAGE_URL =
    "https://h2.inkwai.com/bs2/upload-ylab-stunt/se/ai_portal_queue_mmu_image_upscale_aiweb/3214b798-e1b4-4b00-b7af-72b5b0417420_raw_image_0.jpg";
  const DEFAULT_PROMPT = "The astronaut stood up and walked away";
  const DEFAULT_STATIC_MASK =
    "https://h2.inkwai.com/bs2/upload-ylab-stunt/ai_portal/1732888177/cOLNrShrSO/static_mask.png";
  const DEFAULT_DYNAMIC_MASK = {
    mask: "https://h2.inkwai.com/bs2/upload-ylab-stunt/ai_portal/1732888130/WU8spl23dA/dynamic_mask_1.png",
    trajectories: [
      { x: 279, y: 219 },
      { x: 417, y: 65 },
    ],
  };

  const [image, setImage] = useState<string | File>(DEFAULT_IMAGE_URL);
  const [imagePreviewUrl, setImagePreviewUrl] =
    useState<string>(DEFAULT_IMAGE_URL);
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  const [staticMask, setStaticMask] = useState<string | File>(
    DEFAULT_STATIC_MASK,
  );
  const [staticMaskPreviewUrl, setStaticMaskPreviewUrl] =
    useState<string>(DEFAULT_STATIC_MASK);
  const [dynamicMasks, setDynamicMasks] = useState<DynamicMask[]>([
    {
      mask: DEFAULT_DYNAMIC_MASK.mask,
      trajectories: DEFAULT_DYNAMIC_MASK.trajectories,
      maskPreviewUrl: DEFAULT_DYNAMIC_MASK.mask,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleStaticMaskChange = (file: File | null) => {
    if (file) {
      setStaticMask(file);
      setStaticMaskPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDynamicMaskChange = (index: number, file: File | null) => {
    if (file) {
      const newMasks = [...dynamicMasks];
      newMasks[index].mask = file;
      newMasks[index].maskPreviewUrl = URL.createObjectURL(file);
      setDynamicMasks(newMasks);
    }
  };

  const handleTrajectoriesChange = (
    index: number,
    trajectories: Coordinate[],
  ) => {
    const newMasks = [...dynamicMasks];
    newMasks[index].trajectories = trajectories;
    setDynamicMasks(newMasks);
  };

  const addDynamicMask = () => {
    setDynamicMasks([
      ...dynamicMasks,
      {
        mask: "",
        trajectories: [],
      },
    ]);
  };

  const removeDynamicMask = (index: number) => {
    setDynamicMasks(dynamicMasks.filter((_, i) => i !== index));
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setResult(null);
    setLogs([]);
    setElapsedTime(0);
  };

  const validateInputs = () => {
    if (!image) {
      throw new Error("Image is required");
    }
    if (!prompt.trim()) {
      throw new Error("Prompt is required");
    }
    if (!staticMask) {
      throw new Error("Static mask is required");
    }
    if (dynamicMasks.length === 0) {
      throw new Error("At least one dynamic mask is required");
    }
    for (let i = 0; i < dynamicMasks.length; i++) {
      const mask = dynamicMasks[i];
      if (!mask.mask) {
        throw new Error(`Dynamic mask ${i + 1} image is required`);
      }
      if (mask.trajectories.length < 2 || mask.trajectories.length > 77) {
        throw new Error(
          `Dynamic mask ${i + 1} must have between 2 and 77 trajectory points (current: ${mask.trajectories.length})`,
        );
      }
    }
  };

  const generateVideo = async () => {
    reset();
    setLoading(true);
    const start = Date.now();

    try {
      validateInputs();

      const formattedDynamicMasks = dynamicMasks.map((dm) => ({
        mask_url: dm.mask,
        trajectories: dm.trajectories,
      }));

      const input = {
        image_url: image,
        prompt: prompt,
        cfg_scale: 0.5,
        static_mask: staticMask,
        dynamic_masks: formattedDynamicMasks,
      };

      const result = await fal.subscribe(
        "fal-ai/kling-video/v1.5/pro/image-to-video",
        {
          input: input,
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

      setResult(result.data as VideoResult);
    } catch (error: any) {
      setError(error);
    } finally {
      setLoading(false);
      setElapsedTime(Date.now() - start);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <main className="container mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-5xl font-bold text-transparent">
            Motion Brush Video Generator
          </h1>
          <p className="text-lg text-gray-600">
            Create dynamic videos with motion-controlled brush strokes
          </p>
        </div>

        {/* Main Form */}
        <div className="space-y-6">
          {/* Source Image Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <label className="mb-3 block text-sm font-semibold text-gray-900">
              Source Image
            </label>
            <div className="flex items-center gap-4">
              <label className="group flex-1 cursor-pointer">
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/50">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 transition-colors group-hover:text-indigo-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageChange(e.target.files?.[0] ?? null)
                    }
                    className="hidden"
                  />
                </div>
              </label>
              {imagePreviewUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={imagePreviewUrl}
                    alt="Source preview"
                    className="h-32 w-32 rounded-lg border-2 border-gray-200 object-cover shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Prompt Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="prompt"
              className="mb-3 block text-sm font-semibold text-gray-900"
            >
              Motion Description
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the motion you want to see..."
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Static Mask Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-900">
                Static Mask
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Define regions that should remain stationary
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="group flex-1 cursor-pointer">
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/50">
                  <svg
                    className="mx-auto h-10 w-10 text-gray-400 transition-colors group-hover:text-indigo-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    Upload static mask
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleStaticMaskChange(e.target.files?.[0] ?? null)
                    }
                    className="hidden"
                  />
                </div>
              </label>
              {staticMaskPreviewUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={staticMaskPreviewUrl}
                    alt="Static mask"
                    className="h-32 w-32 rounded-lg border-2 border-gray-200 object-cover shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Masks Section */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Dynamic Masks
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Define motion regions and their trajectories
                </p>
              </div>
              <button
                onClick={addDynamicMask}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Mask
              </button>
            </div>

            <div className="space-y-6">
              {dynamicMasks.map((mask, index) => (
                <div
                  key={index}
                  className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">
                      Dynamic Mask #{index + 1}
                    </h3>
                    {dynamicMasks.length > 1 && (
                      <button
                        onClick={() => removeDynamicMask(index)}
                        className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="group flex-1 cursor-pointer">
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/50">
                          <svg
                            className="mx-auto h-8 w-8 text-gray-400 transition-colors group-hover:text-indigo-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="mt-1 text-xs text-gray-600">
                            Upload mask image
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleDynamicMaskChange(
                                index,
                                e.target.files?.[0] ?? null,
                              )
                            }
                            className="hidden"
                          />
                        </div>
                      </label>
                      {mask.maskPreviewUrl && (
                        <div className="flex-shrink-0">
                          <img
                            src={mask.maskPreviewUrl}
                            alt={`Dynamic mask ${index + 1}`}
                            className="h-24 w-24 rounded-lg border-2 border-gray-200 object-cover shadow-sm"
                          />
                        </div>
                      )}
                    </div>

                    {mask.maskPreviewUrl && (
                      <div>
                        <label className="mb-3 block text-sm font-medium text-gray-900">
                          Motion Trajectory
                        </label>
                        <TrajectoryCanvas
                          maskImage={mask.maskPreviewUrl}
                          trajectories={mask.trajectories}
                          onTrajectoriesChange={(trajectories) =>
                            handleTrajectoriesChange(index, trajectories)
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={generateVideo}
              disabled={loading}
              className="group relative rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating Video...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Generate Video
                </span>
              )}
            </button>
          </div>

          <ErrorDisplay error={error} />

          {/* Results */}
          {(result || loading) && (
            <div className="mt-8 space-y-6">
              {result?.video?.url && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Generated Video
                  </h3>
                  <video
                    src={result.video.url}
                    controls
                    className="w-full rounded-lg border border-gray-200 shadow-sm"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Result Data
                    </h3>
                    <span className="text-sm text-gray-500">
                      {(elapsedTime / 1000).toFixed(2)}s
                    </span>
                  </div>
                  <pre className="max-h-80 overflow-auto rounded-lg bg-gray-900 p-4 font-mono text-xs text-green-400">
                    {result
                      ? JSON.stringify(result, null, 2)
                      : "// generating..."}
                  </pre>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Generation Logs
                  </h3>
                  <pre className="max-h-80 overflow-auto rounded-lg bg-gray-900 p-4 font-mono text-xs text-blue-400">
                    {logs.filter(Boolean).join("\n") ||
                      "// waiting for logs..."}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
