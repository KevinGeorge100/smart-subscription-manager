import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { healthStatus, readinessStatus } from '../src/lib/health';

describe('health checks', () => {
  it('always reports the process as healthy', () => {
    assert.deepEqual(healthStatus({}), { status: 'ok', service: 'subzero' });
  });

  it('adds optional deployment metadata without making it required', () => {
    assert.deepEqual(healthStatus({ APP_VERSION: '1.0.0', GIT_SHA: 'abc123' }), {
      status: 'ok', service: 'subzero', version: '1.0.0', revision: 'abc123',
    });
  });

  it('reports ready when core Firebase Admin configuration is present', () => {
    assert.deepEqual(readinessStatus({
      FIREBASE_PROJECT_ID: 'test-project',
      FIREBASE_CLIENT_EMAIL: 'test@example.invalid',
      FIREBASE_PRIVATE_KEY: 'fake-private-key',
    }), { status: 'ready', service: 'subzero' });
  });

  it('lists only missing core configuration names', () => {
    assert.deepEqual(readinessStatus({
      FIREBASE_PROJECT_ID: 'test-project',
      FIREBASE_CLIENT_EMAIL: '  ',
      GOOGLE_CLIENT_SECRET: 'optional-test-value',
    }), {
      status: 'unavailable',
      service: 'subzero',
      missing: ['FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'],
    });
  });
});
