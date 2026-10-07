import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatLog, requestIdFor, safeError } from '../src/lib/logger';

describe('structured logger', () => {
  it('emits the standard schema and safe metrics', () => {
    const record = formatLog('info', 'gmail', 'gmail_sync_completed', 'request-1', { durationMs: 42, emailsScanned: 3 });
    assert.equal(record.level, 'info');
    assert.equal(record.service, 'subzero');
    assert.equal(record.component, 'gmail');
    assert.equal(record.event, 'gmail_sync_completed');
    assert.equal(record.requestId, 'request-1');
    assert.equal(record.durationMs, 42);
    assert.equal(record.emailsScanned, 3);
    assert.ok(!Number.isNaN(Date.parse(record.timestamp)));
  });

  it('drops sensitive or arbitrary metadata', () => {
    const record = formatLog('error', 'ai', 'ai_request_failed', undefined, {
      authorization: 'Bearer private', token: 'private', password: 'private',
      secret: 'private', apiKey: 'private', privateKey: 'private',
      prompt: 'private', body: 'private', status: 'failed',
    });
    assert.equal(record.status, 'failed');
    for (const value of ['private', 'Bearer private']) {
      assert.ok(!JSON.stringify(record).includes(value));
    }
  });

  it('normalizes untrusted errors without copying their messages', () => {
    assert.deepEqual(safeError(new Error('refresh_token=private')), {
      errorName: 'Error', errorMessage: 'Operation failed',
    });
    assert.deepEqual(safeError({ authorization: 'Bearer private' }), {
      errorName: 'UnknownError', errorMessage: 'Operation failed',
    });
  });

  it('preserves valid request IDs and replaces missing or unsafe IDs', () => {
    assert.equal(requestIdFor(new Request('https://example.invalid', { headers: { 'x-request-id': 'trace-123' } })), 'trace-123');
    const generated = requestIdFor(new Request('https://example.invalid'));
    assert.match(generated, /^[0-9a-f-]{36}$/);
    assert.notEqual(requestIdFor(new Request('https://example.invalid', { headers: { 'x-request-id': 'Bearer private' } })), 'Bearer private');
  });
});
