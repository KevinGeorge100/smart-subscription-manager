const service = 'subzero';

const requiredRuntimeConfig = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
] as const;

export function healthStatus(env: Record<string, string | undefined> = process.env) {
  return {
    status: 'ok', service,
    ...(env.APP_VERSION ? { version: env.APP_VERSION } : {}),
    ...(env.GIT_SHA ? { revision: env.GIT_SHA } : {}),
  } as const;
}

export function readinessStatus(env: Record<string, string | undefined> = process.env) {
  const missing = requiredRuntimeConfig.filter((name) => !env[name]?.trim());

  if (missing.length) {
    return { status: 'unavailable', service, missing } as const;
  }

  return { status: 'ready', service } as const;
}
