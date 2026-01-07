/**
 * Application configuration
 * All environment variables are loaded from .env file
 */

// API base URL - reads from VITE_API_URL environment variable
export const API_URL = import.meta.env.VITE_API_URL;

// Ensure API_URL is set
if (!API_URL) {
  console.warn('VITE_API_URL is not set in environment variables. Please create a .env file with VITE_API_URL.');
}

export default {
  API_URL,
};
