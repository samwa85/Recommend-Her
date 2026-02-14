// ============================================================================
// Environment Variable Validation
// ============================================================================

export interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_APP_NAME: string;
  VITE_APP_VERSION: string;
  VITE_ENABLE_ANALYTICS: boolean;
}

function getEnvVar(key: string, required = true): string {
  const value = import.meta.env[key];
  
  if (required && !value) {
    console.error(`[ENV] Missing required environment variable: ${key}`);
    return '';
  }
  
  return value || '';
}

export const env: EnvConfig = {
  VITE_SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL'),
  VITE_SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  VITE_APP_NAME: getEnvVar('VITE_APP_NAME', false) || 'Recommend Her',
  VITE_APP_VERSION: getEnvVar('VITE_APP_VERSION', false) || '1.0.0',
  VITE_ENABLE_ANALYTICS: getEnvVar('VITE_ENABLE_ANALYTICS', false) === 'true',
};

// Validate required variables
export function validateEnv(): boolean {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error('[ENV] Missing required environment variables:', missing);
    return false;
  }
  
  return true;
}
