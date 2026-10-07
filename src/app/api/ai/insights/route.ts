import { NextResponse } from 'next/server';
import { analyzeSpending } from '@/lib/genkit';
import { verifyRequestAuth } from '@/lib/auth';
import { durationMs, logger, requestIdFor, safeError } from '@/lib/logger';

export async function POST(req: Request) {
  const requestId = requestIdFor(req);
  const startedAt = performance.now();
  const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'X-Request-ID': requestId } });
  logger.info('ai', 'ai_request_started', requestId, { endpoint: 'insights' });
  try {
    await verifyRequestAuth(req);
  } catch {
    logger.warn('ai', 'authentication_failed', requestId, { endpoint: 'insights', authenticated: false });
    return reply({ error: 'Unauthorized: Authentication required to generate AI insights.' }, 401);
  }

  try {
    const body = await req.json();
    const result = await analyzeSpending(body.subscriptions ?? []);
    logger.info('ai', 'ai_request_completed', requestId, { endpoint: 'insights', authenticated: true, durationMs: durationMs(startedAt) });
    return reply({ insights: result.insights });
  } catch (error) {
    logger.error('ai', 'ai_request_failed', requestId, { endpoint: 'insights', authenticated: true, durationMs: durationMs(startedAt), ...safeError(error) });
    return reply({ error: 'Failed to generate insights' }, 500);
  }
}
