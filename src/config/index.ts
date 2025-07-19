// Configuration for different environments
const config = {
  development: {
    apiBaseUrl: 'http://localhost:5000/api',
  },
  production: {
    // Railway backend URL
    apiBaseUrl: import.meta.env.VITE_API_URL || 'https://mezzzzhh-production.up.railway.app/api',
  },
};

// Get current environment
const environment = import.meta.env.MODE || 'development';

// Export the appropriate config
export const API_BASE_URL = config[environment as keyof typeof config].apiBaseUrl;

// Export other config values
export const APP_CONFIG = {
  name: 'Mesh',
  version: '1.0.0',
  environment,
  apiBaseUrl: API_BASE_URL,
}; 