import { randomUUID } from 'crypto';
import { config, getConfig } from './config';
import { buildUrl } from './function';

config({
  host: 'gateway.alpha.fal.ai',
  credentials: {
    userId: 'github|123456',
    keyId: 'a91ff3ca-71bc-4c8c-b400-859f6cbe804d',
    keySecret: '0123456789abcdfeghijklmnopqrstuv',
  },
});

describe('The function test suite', () => {
  it('should build the URL with a function UUIDv4', () => {
    const { credentials } = getConfig();
    const id = randomUUID();
    const url = buildUrl(id);
    expect(url).toMatch(`trigger/${credentials.userId}/${id}`);
  });

  it('should build the URL with a function alias', () => {
    const { host } = getConfig();
    const alias = 'some-alias';
    const url = buildUrl(alias);
    expect(url).toMatch(`${alias}.${host}`);
  });
});
