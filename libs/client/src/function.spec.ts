import { randomUUID } from 'crypto';
import { config, getConfig } from './config';
import { buildUrl } from './function';

config({
  host: 'gateway.alpha.fal.ai',
  credentials: {
    keyId: 'a91ff3ca-71bc-4c8c-b400-859f6cbe804d',
    keySecret: '0123456789abcdfeghijklmnopqrstuv',
  },
});

describe('The function test suite', () => {
  it('should build the URL with a function UUIDv4', () => {
    const id = randomUUID();
    const url = buildUrl(`12345/${id}`);
    expect(url).toMatch(`trigger/12345/${id}`);
  });

  it('should build the URL with a function alias', () => {
    const { host } = getConfig();
    const alias = '12345-some-alias';
    const url = buildUrl(alias);
    expect(url).toMatch(`${alias}.${host}`);
  });
});
