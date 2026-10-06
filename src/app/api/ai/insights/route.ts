import { NextResponse } from 'next/server';
import { analyzeSpending } from '@/lib/genkit';
import { verifyRequestAuth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await verifyRequestAuth(req);
  } catch {
    return NextResponse.json(
      { error: 'Unauthorized: Authentication required to generate AI insights.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const result = await analyzeSpending(body.subscriptions ?? []);
    return NextResponse.json({ insights: result.insights });
  } catch (error) {
    console.error('AI Insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
