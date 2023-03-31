import { config, getConfig } from './config';

describe('The config test suite', () => {
  it('should set the config variables accordingly', () => {
    const newConfig = {
      host: 'some-other-host',
      credentials: {
        keyId: 'key-id',
        keySecret: 'key-secret',
        userId: 'user-id',
      },
    };
    config(newConfig);
    const currentConfig = getConfig();
    expect(currentConfig).toEqual(newConfig);
  });
});
