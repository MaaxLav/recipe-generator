import type { OAuthDiscoveryState } from '@modelcontextprotocol/sdk/client/auth.js';
import type {
  OAuthClientInformationMixed,
  OAuthTokens,
} from '@modelcontextprotocol/sdk/shared/auth.js';

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
