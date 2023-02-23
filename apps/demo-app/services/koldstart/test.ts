import { run } from '@fal-ai/koldstart-client';
import { credentials } from './credentials';

export type GenerateImageInput = {
  promp: string;
};

export function generateImage(
  input: GenerateImageInput,
  onData: (data: string) => void
) {
  run(
    {
      host: '',
      environmentKind: '',
      requirements: [''],
      credentials,
      definition: '',
    },
    onData
  );
}
