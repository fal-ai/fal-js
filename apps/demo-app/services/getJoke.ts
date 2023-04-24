import * as fal from '@fal-ai/serverless-client';

fal.config({
  host: 'gateway.alpha.fal.ai',
  credentials: {
    userId: '',
    keyId: '',
    keySecret: '',
  },
});

export function getJoke(): Promise<{ joke: string }> {
  return fal.run('944a4d1c-e4b2-4a38-8499-1e9a8a544854');
}
