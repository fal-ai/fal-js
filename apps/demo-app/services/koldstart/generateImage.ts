import { config, koldstart } from '@fal-ai/koldstart-core';

export type GenerateImageInput = {
  prompt: string;
};

type ImageType = 'gif' | 'png' | 'jpg' | 'jpeg';
type ImageDataUri = `data:image/${ImageType};base64,${string}`;

config({
  credentials: {
    userId: '',
    keyId: '',
    keySecret: '',
  },
});

export async function generateImage(
  input: GenerateImageInput
): Promise<ImageDataUri> {
  const result = await koldstart(
    '552b4eab-7774-497d-926d-1d5b77c7c818/generate'
  ).run({
    input,
  });
  const data = result['raw_data'];
  return `data:image/jpg;base64,${data}`;
}
