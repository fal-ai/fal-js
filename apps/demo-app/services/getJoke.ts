import * as fal from '@fal-ai/serverless-client';

export type GetJokeInput = {
  language: string;
};

export type GetJokeOutput = {
  joke: string;
  language: string;
};

export function getJoke(
  input: GetJokeInput = { language: 'en' }
): Promise<GetJokeOutput> {
  return fal.run('319413-fal-fastapi-getjoke', {
    input,
  });
}
