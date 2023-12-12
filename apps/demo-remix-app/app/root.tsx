import * as fal from '@fal-ai/serverless-client';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import { useMemo, useState } from 'react';

fal.config({
  proxyUrl: '/fal/proxy',
});

const DEFAULT_PROMPT =
  'a city landscape of a cyberpunk metropolis, raining, purple, pink and teal neon lights, highly detailed, uhd';

export default function App() {
  // Input state
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  // Result state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const image = useMemo(() => {
    if (!result) {
      return null;
    }
    return result.images[0];
  }, [result]);

  const reset = () => {
    setLoading(false);
    setResult(null);
  };

  const generateImage = async () => {
    reset();
    setLoading(true);
    try {
      const result = await fal.subscribe('110602490-lora', {
        input: {
          prompt,
          model_name: 'stabilityai/stable-diffusion-xl-base-1.0',
          image_size: 'square_hd',
        },
        pollInterval: 1000, // Default is 1000 (every 1s)
        logs: true,
        onQueueUpdate(update) {
          console.log(update);
        },
      });
      setResult(result);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />

        <div>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button onClick={generateImage}>Generate</button>
        </div>
        <div>
          {loading && <div>Loading...</div>}
          {image && (
            <div>
              <img src={image.url} alt="" />
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
