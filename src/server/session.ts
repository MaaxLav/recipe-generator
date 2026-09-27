import 'server-only';

import { randomBytes } from 'node:crypto';

import type {
  OAuthClientProvider,
  OAuthDiscoveryState,
} from '@modelcontextprotocol/sdk/client/auth.js';
import type {
  OAuthClientInformationMixed,
  OAuthTokens,
} from '@modelcontextprotocol/sdk/shared/auth.js';
import { cookies } from 'next/headers';

import { AppError } from './errors';

export const COOKIE = 'smak_session';
export const origin = () => process.env.APP_ORIGIN || 'http://127.0.0.1:3000';
export type Session = {
  id: string;
  expires: number;
  tokens?: OAuthTokens;
  client?: OAuthClientInformationMixed;
  discovery?: OAuthDiscoveryState;
  verifier?: string;
  state?: string;
  authStarted?: number;
  redirect?: string;
  busy?: boolean;
};
const globalSessions = globalThis as typeof globalThis & {
  smakSessions?: Map<string, Session>;
};
const sessions = (globalSessions.smakSessions ??= new Map());
export function createSession() {
  for (const [id, session] of sessions)
    if (session.expires < Date.now()) sessions.delete(id);
  if (sessions.size >= 100)
    throw new AppError(
      'SESSION_LIMIT',
      'Забагато сесій. Перезапустіть локальний сервер.',
      503,
    );
  const session: Session = {
    id: randomBytes(32).toString('hex'),
    expires: Date.now() + 8 * 60 * 60 * 1000,
  };
  sessions.set(session.id, session);
  return session;
}
export async function getSession() {
  const id = (await cookies()).get(COOKIE)?.value;
  const session = id ? sessions.get(id) : undefined;
  if (session && session.expires > Date.now()) return session;
  if (id) sessions.delete(id);
  return undefined;
}
export function provider(session: Session): OAuthClientProvider {
  return {
    redirectUrl: `${origin()}/api/auth/callback`,
    clientMetadata: {
      client_name: 'СмакПлан',
      redirect_uris: [`${origin()}/api/auth/callback`],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    },
    state: () => (session.state ??= randomBytes(32).toString('hex')),
    clientInformation: () => session.client,
    saveClientInformation: (value) => {
      session.client = value;
    },
    tokens: () => session.tokens,
    saveTokens: (value) => {
      session.tokens = value;
    },
    redirectToAuthorization: (url) => {
      session.redirect = url.toString();
    },
    saveCodeVerifier: (value) => {
      session.verifier = value;
    },
    codeVerifier: () => {
      if (!session.verifier)
        throw new AppError('AUTH_REQUIRED', 'Підключіть Сільпо ще раз.', 401);
      return session.verifier;
    },
    discoveryState: () => session.discovery,
    saveDiscoveryState: (value) => {
      session.discovery = value;
    },
    invalidateCredentials: (scope) => {
      if (scope === 'all' || scope === 'tokens') session.tokens = undefined;
      if (scope === 'all' || scope === 'client') session.client = undefined;
      if (scope === 'all' || scope === 'verifier') session.verifier = undefined;
      if (scope === 'all' || scope === 'discovery')
        session.discovery = undefined;
    },
  };
}
