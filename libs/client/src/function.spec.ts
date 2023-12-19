import uuid from 'uuid-random';
import { getConfig } from './config';
import { buildUrl } from './function';

describe('The function test suite', () => {
  it('should build the URL with a function UUIDv4', () => {
    const id = uuid();
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
