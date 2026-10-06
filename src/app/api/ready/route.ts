import { NextResponse } from 'next/server';
import { readinessStatus } from '@/lib/health';

export const dynamic = 'force-dynamic';

export function GET() {
  const result = readinessStatus();
  return NextResponse.json(result, {
    status: result.status === 'ready' ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
