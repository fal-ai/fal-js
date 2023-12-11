import { createProxy } from '@fal-ai/serverless-proxy/remix';
import { json } from '@remix-run/node';

export const { action, loader } = createProxy({ json });
