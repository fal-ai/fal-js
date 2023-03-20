import { run } from '@fal-ai/koldstart-client';
import { credentials } from '../../credentials';
interface GenerateImageInput {
  readonly prompt: string;
}
export function generateImage(
  input: GenerateImageInput,
  onData: (data: string) => void
) {
  return run(
    {
      host: 'api.alpha.fal.ai:443',
      credentials,
      environmentKind: 'virtualenv',
      requirements: ['requests'],
      definition:
        'gASVMwEAAAAAAACMCmRpbGwuX2RpbGyUjBBfY3JlYXRlX2Z1bmN0aW9ulJOUKGgAjAxfY3JlYXRlX2NvZGWUk5QoSwFLAEsASwFLAUpDAAABQwRkAVMAlE6MFGhlcmUgaXMgeW91ciBpbWFnZToglIaUKYwGcHJvbXB0lIWUjEEuLi9mYWwtaXNvbGF0ZS1jbG91ZC9wcm9qZWN0cy9rb2xkc3RhcnQvdG9vbHMvc3RhYmxlX2RpZmZ1c2lvbi5weZSMDmdlbmVyYXRlX2ltYWdllEsJQwIAA5QpKXSUUpR9lIwIX19uYW1lX1+UjBNzdGFibGVfZGlmZnVzaW9uLnB5lHNoC05OdJRSlH2UfZSMD19fYW5ub3RhdGlvbnNfX5R9lChoCIwDc3RylIwGcmV0dXJulGgYdXOGlGIu',
    },
    onData
  );
}
