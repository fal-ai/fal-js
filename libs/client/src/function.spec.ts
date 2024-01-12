import uuid from 'uuid-random';
import { getConfig } from './config';
import { buildUrl } from './function';

describe('The function test suite', () => {
  it('should build the URL with a function UUIDv4', () => {
    const id = uuid();
    const url = buildUrl(`12345/${id}`);
    expect(url).toMatch(`trigger/12345/${id}`);
  });

  it('should build the URL with a function user-id/app-alias', () => {
    const alias = '12345-some-alias';
    const url = buildUrl(alias);
    expect(url).toMatch(`${alias}.gateway.alpha.fal.ai`);
  });

  it('should build the URL with a function username/app-alias', () => {
    const alias = 'fal-ai/text-to-image';
    const url = buildUrl(alias);
    expect(url).toMatch(`fal.run/${alias}`);
  });
});
