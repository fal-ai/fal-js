import * as fal from '@fal-ai/serverless-client';
import { useState } from 'react';
// import Image from 'next/image';
import Head from 'next/head';

const FAL_KEY_ID = '1d3f3c39-fa03-4673-ba60-dcf02f87008f';
const FAL_KEY_SECRET = '7f111862b8991e0072c28445d8144b4e';

fal.config({
  userId: 'github|319413',
  host: 'gateway.alpha.fal.ai',
  credentials: {
    keyId: FAL_KEY_ID,
    keySecret: FAL_KEY_SECRET,
  },
});

export default function Chat() {
  const [prompt, setPrompt] = useState('');
  // const [imageUrl, setImageUrl] = useState(IMG_PLACEHOLDER);

  const handleChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // const result: any = await fal.run("fal_chat_app", {
      //   path: "chat",
      //   input: {
      //     prompt,
      //     // input: { prompt }
      //   },
      // });

      const response = await fetch(
        `https://319413-fal_chat_app.gateway.alpha.fal.ai/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-fal-key-id': FAL_KEY_ID,
            'x-fal-key-secret': FAL_KEY_SECRET,
          },
          body: JSON.stringify({ prompt }),
        }
      );
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}: ${response.statusText}`
        );
      }

      const reader = response.body.getReader();

      // const stream = new ReadableStream({
      //   async start(controller) {
      //     console.log('-------- start');
      //     while (true) {
      //       const { done, value } = await reader.read();
      //       console.log('-------- done', done);
      //       // console.log('-------- value', value);

      //       // When no more data needs to be consumed, break the reading
      //       if (done) {
      //         break;
      //       }

      //       // Do your work: ¿¿ Checkout what value returns ¿¿
      //       console.log(value);

      //       // Optionally append the value if you need the full blob later.
      //       controller.enqueue(value);
      //     }

      //     // Close the stream
      //     controller.close();
      //     reader.releaseLock();
      //   },
      // });

      let isStreaming = true;
      const decoder = new TextDecoder();
      while (isStreaming) {
        console.log('-------- isStreaming', isStreaming);
        const { done, value } = await reader.read();
        console.log('-------- done', done);
        console.log('-------- value', value);

        isStreaming = !done;
        // Process the received chunk
        console.log(decoder.decode(value));
      }

      // console.log("-------- result", result);

      // const ws = new WebSocket(`wss://319413-fal_chat_app.gateway.alpha.fal.ai/chat/ws?fal_key_id=${FAL_KEY_ID}&fal_key_secret=${FAL_KEY_SECRET}`);
      // ws.addEventListener('message', (event) => {
      //   console.log('Message from server ', event.data);
      // });
      // ws.addEventListener('open', (event) => {
      //   console.log('Connection open ', event);
      //   ws.send(prompt);
      // });
      // ws.addEventListener('close', (event) => {
      //   console.log('Connection closed ', event);
      // });
      // ws.addEventListener('error', (event) => {
      //   console.log('Connection error ', event);
      // });
    } catch (error) {
      console.log('-------- error', error);
    }

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

    // const result = await generateImage({ prompt });
    // setImageUrl(result);
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
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="e.g. cute panda in the style of ghibli studio"
            value={prompt}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold text-xl py-4 px-8 mx-auto rounded focus:outline-none focus:shadow-outline"
          >
            Ask anything
          </button>
        </form>

        <div className="mt-10">
          <div></div>
        </div>
      </main>
    </div>
  );
}
