import { config, koldstart } from '@fal/serverless-client';

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
    'github|38204337/a51c0ca0-9011-4ff0-8dc1-2ac0b42a9fd0/generate'
  ).run({
    input,
  });
  const data = result['raw_data'];
  return `data:image/jpg;base64,${data}`;
}
