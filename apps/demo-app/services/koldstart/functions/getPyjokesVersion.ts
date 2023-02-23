import { run } from '@fal-ai/koldstart-client';
import { credentials } from '../credentials';
export function getPyjokesVersion(onData: (data: string) => void) {
  return run(
    {
      host: 'localhost:6005',
      credentials,
      environmentKind: 'virtualenv',
      requirements: ['pyjokes==0.5.0'],
      definition:
        'gASVMgEAAAAAAACMCmRpbGwuX2RpbGyUjBBfY3JlYXRlX2Z1bmN0aW9ulJOUKGgAjAxfY3JlYXRlX2NvZGWUk5QoSwBLAEsASwFLAkpDAAABQw5kAWQAbAB9AHwAagFTAJROSwCGlIwHcHlqb2tlc5SMC19fdmVyc2lvbl9flIaUaAeFlIw8Li4vZmFsLWlzb2xhdGUtY2xvdWQvcHJvamVjdHMva29sZHN0YXJ0L3Rvb2xzL2RlbW9fc2NyaXB0LnB5lIwTZ2V0X3B5am9rZXNfdmVyc2lvbpRLC0MEAAIIApQpKXSUUpR9lIwIX19uYW1lX1+UjA5kZW1vX3NjcmlwdC5weZRzaAxOTnSUUpR9lH2UjA9fX2Fubm90YXRpb25zX1+UfZSMBnJldHVybpSMA3N0cpRzc4aUYi4=',
    },
    onData
  );
}
