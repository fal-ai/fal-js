import * as fal from '@fal-ai/serverless-client';

fal.config({
  host: 'gateway.alpha.fal.ai',
  credentials: {
    userId: process.env.FAL_USER_ID || '',
    keyId: process.env.FAL_KEY_ID || '',
    keySecret: process.env.FAL_KEY_SECRET || '',
  },
});

export type GetJokeInput = {
  language?: string;
};

export function getJoke(input?: GetJokeInput): Promise<{ joke: string }> {
  return fal.run('fastapi_get_joke', { input });
}
