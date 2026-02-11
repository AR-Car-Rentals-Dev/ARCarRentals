/**
 * Environment configuration helper
 * Provides type-safe access to environment variables
 */
export const config = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'AR Car Rental Services',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
  },
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    debugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  },
  contact: {
    phone: import.meta.env.VITE_CONTACT_PHONE || '+63 956 662 5224',
    email: import.meta.env.VITE_CONTACT_EMAIL || 'info@arcarrentalscebu.com',
    businessHours: import.meta.env.VITE_BUSINESS_HOURS || 'Monday - Sunday | Open 24 Hours',
    location: import.meta.env.VITE_BUSINESS_LOCATION || 'Cebu City, Philippines',
  },
} as const;

export default config;
