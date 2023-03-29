import { useState } from 'react';
import Image from 'next/image';
import Head from 'next/head';

import { generateImage } from '../services/generateImage';

const IMG_PLACEHOLDER = '/placeholder@2x.jpg';

export default function Diffusion() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState(IMG_PLACEHOLDER);

  const handleChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO replace this with direct serverless call once cors is solved
    // const response = await fetch('/api/generateImage', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ prompt }),
    // });
    // const data = await response.json();
    // setImageUrl(data.imageUrl);

    const result = await generateImage({ prompt });
    setImageUrl(result);
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-white bg-white text-black">
      <Head>
        <title>fal-serverless diffusion</title>
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 py-10">
        <h1 className="text-4xl font-semibold mb-10">
          fal-serverless diffusion
        </h1>
        <h3 className="text-2xl">Enter a prompt to generate the image</h3>
        <form onSubmit={handleSubmit} className="flex flex-col mt-8 w-full">
          <input
            type="text"
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="e.g. cute panda in the style of ghibli studio"
            value={prompt}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold text-xl py-4 px-8 mx-auto rounded focus:outline-none focus:shadow-outline"
          >
            Generate Image
          </button>
        </form>

        <div className="mt-10">
          <Image
            src={imageUrl}
            alt="Generated Image"
            width={1024}
            height={1024}
          />
        </div>
      </main>
    </div>
  );
}
