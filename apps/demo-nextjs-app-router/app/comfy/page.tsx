'use client';

import { useRouter } from 'next/navigation';

export default function Index() {
  const router = useRouter(); // Use correct router
  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-100">
      <main className="container mx-auto flex flex-col items-center justify-center w-full flex-1 py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold mb-8">
          Serverless Comfy Workflow Examples powered by{' '}
          <code className="font-light text-pink-600">fal</code>
        </h1>
        <p className="mt-2 text-lg text-gray-400 max-w-2xl">
          Learn how to use our fal-js to execute Comfy workflows.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-3">
          <button
            onClick={() => router.push('/comfy/text-to-image')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md transition-transform transform hover:-translate-y-1"
          >
            Text to Image
          </button>
          <button
            onClick={() => router.push('/comfy/image-to-image')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md transition-transform transform hover:-translate-y-1"
          >
            Image to Image
          </button>
          <button
            onClick={() => router.push('/comfy/image-to-video')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md transition-transform transform hover:-translate-y-1"
          >
            Image to Video
          </button>
        </div>
      </main>
    </div>
  );
}
