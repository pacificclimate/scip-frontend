// Both local development and Docker load config.js before the app bundle.
const config = {
  REACT_APP_VERSION: process.env.REACT_APP_VERSION,
  PUBLIC_URL: ".",
  ...window.__SCIP_CONFIG__,
};

export default config;
