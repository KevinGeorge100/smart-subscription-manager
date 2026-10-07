import { randomUUID } from 'node:crypto';

type Level = 'info' | 'warn' | 'error';
type Metadata = Record<string, unknown>;
interface LogRecord extends Metadata {
  timestamp: string;
  level: Level;
  service: string;
  component: string;
  event: string;
  requestId?: string;
}

const allowedMetadata = new Set([
  'durationMs', 'count', 'accountsProcessed', 'emailsScanned',
  'subscriptionsDetected', 'emailsSent', 'usersProcessed',
  'status', 'operation', 'endpoint', 'authenticated',
]);

/** Error messages from external SDKs can contain request data, so never emit them verbatim. */
export function safeError(error: unknown) {
  const name = error instanceof Error && /^[A-Za-z][A-Za-z0-9]{0,63}$/.test(error.name)
    ? error.name
    : 'UnknownError';
  return { errorName: name, errorMessage: 'Operation failed' };
}

export function requestIdFor(request: Request): string {
  const incoming = request.headers.get('x-request-id');
  return incoming && /^[A-Za-z0-9._-]{1,128}$/.test(incoming) ? incoming : randomUUID();
}

export function newRequestId(): string {
  return randomUUID();
}

export function durationMs(startedAt: number): number {
  return Math.round(performance.now() - startedAt);
}

export function formatLog(level: Level, component: string, event: string, requestId?: string, metadata: Metadata = {}): LogRecord {
  const safeMetadata: Metadata = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (key === 'errorName' && typeof value === 'string' && /^[A-Za-z][A-Za-z0-9]{0,63}$/.test(value)) {
      safeMetadata[key] = value;
      continue;
    }
    if (key === 'errorMessage' && value === 'Operation failed') {
      safeMetadata[key] = value;
      continue;
    }
    if (!allowedMetadata.has(key)) continue;
    if (typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) {
      safeMetadata[key] = value;
    } else if (typeof value === 'string' && /^(?:[a-z0-9_/-]{1,64})$/.test(value)) {
      safeMetadata[key] = value;
    }
  }
  return {
    timestamp: new Date().toISOString(), level, service: 'subzero',
    component, event, ...(requestId ? { requestId } : {}), ...safeMetadata,
  };
}

function write(level: Level, component: string, event: string, requestId?: string, metadata?: Metadata) {
  const line = JSON.stringify(formatLog(level, component, event, requestId, metadata));
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}

export const logger = {
  info: (component: string, event: string, requestId?: string, metadata?: Metadata) => write('info', component, event, requestId, metadata),
  warn: (component: string, event: string, requestId?: string, metadata?: Metadata) => write('warn', component, event, requestId, metadata),
  error: (component: string, event: string, requestId?: string, metadata?: Metadata) => write('error', component, event, requestId, metadata),
};
