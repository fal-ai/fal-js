import { config, getConfig } from './config';

describe('The config test suite', () => {
  it('should set the config variables accordingly', () => {
    const newConfig = {
      host: 'some-other-host',
      userId: 'user-id',
      credentials: {
        keyId: 'key-id',
        keySecret: 'key-secret',
      },
    };
    config(newConfig);
    const currentConfig = getConfig();
    expect(currentConfig).toEqual(newConfig);
  });
});
