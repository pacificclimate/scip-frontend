import { readFileSync } from 'fs';
import { join } from 'path';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  delete window.__SCIP_CONFIG__;
  jest.resetModules();
});

test('loads service URLs from the shared public config file', () => {
  const script = readFileSync(join(__dirname, '../public/config.js'), 'utf8');
  window.eval(script);

  const config = require('./config').default;
  expect(config.REACT_APP_PCEX_API_URL).toBe(window.__SCIP_CONFIG__.REACT_APP_PCEX_API_URL);
  expect(config.REACT_APP_SCIP_API_URL).toBe(window.__SCIP_CONFIG__.REACT_APP_SCIP_API_URL);
  expect(config.REACT_APP_NCWMS_URL).toBe(window.__SCIP_CONFIG__.REACT_APP_NCWMS_URL);
  expect(config.REACT_APP_NCWMS_URL).toMatch(/^https?:\/\//);
});

test('uses file settings including explicit empty strings instead of environment settings', () => {
  process.env.REACT_APP_SCIP_API_URL = 'https://environment.example';
  process.env.REACT_APP_PCEX_API_URL = 'https://environment.example';
  process.env.PUBLIC_URL = '/environment';
  window.__SCIP_CONFIG__ = {
    REACT_APP_SCIP_API_URL: 'https://file.example',
    PUBLIC_URL: '',
  };

  const config = require('./config').default;
  expect(config.REACT_APP_SCIP_API_URL).toBe('https://file.example');
  expect(config.REACT_APP_PCEX_API_URL).toBeUndefined();
  expect(config.PUBLIC_URL).toBe('');
});

test('preserves build version metadata and allows the config file to override it', () => {
  process.env.REACT_APP_VERSION = 'build-version';
  expect(require('./config').default.REACT_APP_VERSION).toBe('build-version');

  jest.resetModules();
  window.__SCIP_CONFIG__ = { REACT_APP_VERSION: 'configured-version' };
  expect(require('./config').default.REACT_APP_VERSION).toBe('configured-version');
});
