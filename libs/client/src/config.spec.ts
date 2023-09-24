import { config, getConfig } from './config';

describe('The config test suite', () => {
  it('should set the config variables accordingly', () => {
    const newConfig = {
      host: 'some-other-host',
      credentials: 'key-id:key-secret',
    };
    config(newConfig);
    const currentConfig = getConfig();
    expect(currentConfig.host).toBe(newConfig.host);
    expect(currentConfig.credentials).toEqual(newConfig.credentials);
  });
});
