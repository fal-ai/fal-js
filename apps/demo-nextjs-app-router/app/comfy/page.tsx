"use client";

import { useRouter } from "next/navigation";

export default function Index() {
  const router = useRouter(); // Use correct router
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <main className="container mx-auto flex w-full flex-1 flex-col items-center justify-center py-12 px-4 text-center sm:px-6 lg:px-8">
        <h1 className="mb-8 text-4xl font-bold">
          Serverless Comfy Workflow Examples powered by{" "}
          <code className="font-light text-pink-600">fal</code>
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-gray-400">
          Learn how to use our fal-js to execute Comfy workflows.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-3">
          <button
            onClick={() => router.push("/comfy/text-to-image")}
            className="transform rounded-lg bg-blue-600 px-6 py-3 text-white shadow-md transition-transform hover:-translate-y-1 hover:bg-blue-500"
          >
            Text to Image
          </button>
          <button
            onClick={() => router.push("/comfy/image-to-image")}
            className="transform rounded-lg bg-blue-600 px-6 py-3 text-white shadow-md transition-transform hover:-translate-y-1 hover:bg-blue-500"
          >
            Image to Image
          </button>
          <button
            onClick={() => router.push("/comfy/image-to-video")}
            className="transform rounded-lg bg-blue-600 px-6 py-3 text-white shadow-md transition-transform hover:-translate-y-1 hover:bg-blue-500"
          >
            Image to Video
          </button>
        </div>
      </main>
    </div>
  );
}
