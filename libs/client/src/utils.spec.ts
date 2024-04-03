import uuid from 'uuid-random';
import { ensureAppIdFormat, isUUIDv4, parseAppId } from './utils';

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

  it('shoud match a current appOwner/appId/path format', () => {
    const id = 'fal-ai/fast-sdxl/image-to-image';
    expect(ensureAppIdFormat(id)).toBe(id);
  });

  it('should throw on an invalid app id format', () => {
    const id = 'just-an-id';
    expect(() => ensureAppIdFormat(id)).toThrowError();
  });

  it('should parse a legacy app id', () => {
    const id = '12345-abcde-fgh';
    const parsed = parseAppId(id);
    expect(parsed).toEqual({
      owner: '12345',
      alias: 'abcde-fgh',
    });
  });

  it('should parse a current app id', () => {
    const id = 'fal-ai/fast-sdxl';
    const parsed = parseAppId(id);
    expect(parsed).toEqual({
      owner: 'fal-ai',
      alias: 'fast-sdxl',
    });
  });

  it('should parse a current app id with path', () => {
    const id = 'fal-ai/fast-sdxl/image-to-image';
    const parsed = parseAppId(id);
    expect(parsed).toEqual({
      owner: 'fal-ai',
      alias: 'fast-sdxl',
      path: 'image-to-image',
    });
  });

  it('should parse a current app id with namespace', () => {
    const id = 'workflows/fal-ai/fast-sdxl';
    const parsed = parseAppId(id);
    expect(parsed).toEqual({
      owner: 'fal-ai',
      alias: 'fast-sdxl',
      namespace: 'workflows',
    });
  });
});
