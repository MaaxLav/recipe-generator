import { NextResponse } from 'next/server';

import { getSession } from '@/server/session';
export const runtime = 'nodejs';
export async function GET() {
  const session = await getSession();
  return NextResponse.json(
    { connected: Boolean(session?.tokens?.access_token) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
