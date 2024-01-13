import uuid from 'uuid-random';
import { ensureAppIdFormat, isUUIDv4 } from './utils';

describe('The utils test suite', () => {
  it('should match a valid v4 uuid', () => {
    const id = uuid();
    expect(isUUIDv4(id)).toBe(true);
  });

  it('should not match invalid v4 id', () => {
    const id = 'e726b886-e2c2-11ed-b5ea-0242ac120002';
    expect(isUUIDv4(id)).toBe(false);
  });

  it('shoud match match a legacy appOwner-appId format', () => {
    const id = '12345-abcde-fgh';
    expect(ensureAppIdFormat(id)).toBe('12345/abcde-fgh');
  });

  it('shoud match a current appOwner/appId format', () => {
    const id = 'fal-ai/fast-sdxl';
    expect(ensureAppIdFormat(id)).toBe(id);
  });

  it('should throw on an invalid app id format', () => {
    const id = 'just-an-id';
    expect(() => ensureAppIdFormat(id)).toThrowError();
  });
});
