import { getUserAgent, isBrowser } from './runtime';

describe('the runtime test suite', () => {
  it('should return false when calling isBrowser() on a test', () => {
    expect(isBrowser()).toBe(false);
  });

  it('should return true when calling isBrowser() and window is present', () => {
    global.window = {
      document: {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    expect(isBrowser()).toBe(true);
  });

  it('should create the correct user agent identifier', () => {
    expect(getUserAgent()).toMatch(/@fal-ai\/serverless-client/);
  });
});
