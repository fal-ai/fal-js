import { run } from '@fal-ai/koldstart-client';
import { credentials } from '../credentials';
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
        'gASVMQEAAAAAAACMCmRpbGwuX2RpbGyUjBBfY3JlYXRlX2Z1bmN0aW9ulJOUKGgAjAxfY3JlYXRlX2NvZGWUk5QoSwFLAEsASwFLAUpDAAABQwRkAVMAlE6MFGhlcmUgaXMgeW91ciBpbWFnZToglIaUKYwGcHJvbXB0lIWUjEAuLi9mYWwtaXNvbGF0ZS1jbG91ZC9wcm9qZWN0cy9rb2xkc3RhcnQvdG9vbHMvc3RhYmxlZGlmZnVzaW9uLnB5lIwOZ2VuZXJhdGVfaW1hZ2WUSwlDAgADlCkpdJRSlH2UjAhfX25hbWVfX5SMEnN0YWJsZWRpZmZ1c2lvbi5weZRzaAtOTnSUUpR9lH2UjA9fX2Fubm90YXRpb25zX1+UfZQoaAiMA3N0cpSMBnJldHVybpRoGHVzhpRiLg==',
    },
    onData
  );
}
