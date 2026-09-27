import { randomBytes } from 'node:crypto';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { NextResponse } from 'next/server';

import { makeTransport } from '@/server/mcp';
import { COOKIE, createSession, getSession, origin } from '@/server/session';

export const runtime = 'nodejs';
export async function GET() {
  const session = (await getSession()) ?? createSession();
  session.state = randomBytes(32).toString('hex');
  session.authStarted = Date.now();
  session.redirect = undefined;
  const client = new Client({ name: 'smak-plan', version: '0.1.0' });
  try {
    await client.connect(makeTransport(session, AbortSignal.timeout(45000)));
  } catch {
    /* The transport records the authorization URL on an OAuth challenge. */
  } finally {
    await client.close().catch(() => {});
  }
  const destination =
    session.redirect ??
    (session.tokens ? origin() : `${origin()}/?authError=1`);
  const response = NextResponse.redirect(destination);
  response.cookies.set(COOKIE, session.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: origin().startsWith('https:'),
    path: '/',
    maxAge: 8 * 60 * 60,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
