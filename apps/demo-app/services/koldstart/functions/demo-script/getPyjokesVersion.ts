import { run } from '@fal-ai/koldstart-client';
import { credentials } from '../../credentials';
interface GetPyjokesVersionInput {
  readonly arg: string;
}
export function getPyjokesVersion(
  input: GetPyjokesVersionInput,
  onData: (data: string) => void
) {
  return run(
    {
      host: 'localhost:6005',
      credentials,
      environmentKind: 'virtualenv',
      requirements: ['pyjokes==0.5.0'],
      definition:
        'gASVdgEAAAAAAACMCmRpbGwuX2RpbGyUjBBfY3JlYXRlX2Z1bmN0aW9ulJOUKGgAjAxfY3JlYXRlX2NvZGWUk5QoSwFLAEsASwJLAkpDAAABQxZkAWQAbAB9AXQBZAKDAQEAfAFqAlMAlE5LAIwDaGV5lIeUjAdweWpva2VzlIwFcHJpbnSUjAtfX3ZlcnNpb25fX5SHlIwDYXJnlGgIhpSMPC4uL2ZhbC1pc29sYXRlLWNsb3VkL3Byb2plY3RzL2tvbGRzdGFydC90b29scy9kZW1vX3NjcmlwdC5weZSME2dldF9weWpva2VzX3ZlcnNpb26USwtDBgACCAEIAZQpKXSUUpR9lIwIX19uYW1lX1+UjA5kZW1vX3NjcmlwdC5weZRzaA9OTnSUUpR9lH2UjA9fX2Fubm90YXRpb25zX1+UfZQoaAyMA3N0cpSMBnJldHVybpRoHHVzhpRiaBOMBXByaW50lIwIYnVpbHRpbnOUjAVwcmludJSTlHMwLg==',
    },
    onData
  );
}
