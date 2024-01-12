import uuid from 'uuid-random';
import { isUUIDv4 } from './utils';

describe('The utils test suite', () => {
  it('should match a valid v4 uuid', () => {
    const id = uuid();
    expect(isUUIDv4(id)).toBe(true);
  });

  it('should not match invalid v4 id', () => {
    const id = 'e726b886-e2c2-11ed-b5ea-0242ac120002';
    expect(isUUIDv4(id)).toBe(false);
  });
});
