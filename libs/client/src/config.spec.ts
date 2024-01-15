import { config, getConfig } from './config';

describe('The config test suite', () => {
  it('should set the config variables accordingly', () => {
    const newConfig = {
      credentials: 'key-id:key-secret',
    };
    config(newConfig);
    const currentConfig = getConfig();
    expect(currentConfig.credentials).toEqual(newConfig.credentials);
  });
});
