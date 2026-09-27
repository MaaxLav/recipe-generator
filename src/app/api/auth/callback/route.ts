import { NextRequest, NextResponse } from 'next/server';

import { makeTransport } from '@/server/mcp';
import { validOAuthState } from '@/server/oauth-state';
import { getSession, origin } from '@/server/session';

export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  const session = await getSession();
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  if (
    !session ||
    !code ||
    !validOAuthState(session.state, state, session.authStarted)
  )
    return NextResponse.redirect(`${origin()}/?authError=1`);
  session.state = undefined;
  session.authStarted = undefined;
  try {
    await makeTransport(session, AbortSignal.timeout(30000)).finishAuth(code);
    session.verifier = undefined;
    session.redirect = undefined;
    return NextResponse.redirect(`${origin()}/#planner`);
  } catch {
    return NextResponse.redirect(`${origin()}/?authError=1`);
  }
}
