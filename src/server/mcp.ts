import 'server-only';

import { UnauthorizedError } from '@modelcontextprotocol/sdk/client/auth.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

import { MCP_URL, READ_TOOLS } from '@/constants';
import { readWithRetry } from '@/lib/mcp-policy';
import type { Session } from '@/types';

import { AppError } from './errors';
import { provider } from './session';

export function makeTransport(session: Session, signal: AbortSignal) {
  return new StreamableHTTPClientTransport(new URL(MCP_URL), {
    authProvider: provider(session),
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        signal: AbortSignal.any([
          signal,
          ...(init?.signal ? [init.signal] : []),
          AbortSignal.timeout(30000),
        ]),
      }),
  });
}
export async function connectMcp(session: Session, signal: AbortSignal) {
  const client = new Client({ name: 'smak-plan', version: '0.1.0' });
  const transport = makeTransport(session, signal);
  try {
    await client.connect(transport);
  } catch (error) {
    await client.close().catch(() => {});
    if (error instanceof UnauthorizedError)
      throw new AppError(
        'AUTH_REQUIRED',
        'Підключіть свій акаунт Сільпо.',
        401,
      );
    throw error;
  }
  try {
    const tools = [];
    let cursor: string | undefined;
    do {
      const page = await client.listTools({ cursor }, { signal });
      tools.push(...page.tools.filter((t) => READ_TOOLS.has(t.name)));
      cursor = page.nextCursor;
    } while (cursor);
    for (const name of [
      'silpo_get_my_shopping_cart',
      'silpo_get_shopping_cart_by_id',
      'silpo_get_time_slots',
      'silpo_find_products_batch',
    ]) {
      if (!tools.some((t) => t.name === name))
        throw new AppError(
          'MCP_SCHEMA',
          'MCP не надав потрібні інструменти. Перевірте доступ до Сільпо.',
          502,
        );
    }
    return { client, tools };
  } catch (error) {
    await client.close().catch(() => {});
    throw error;
  }
}
export async function callReadTool(
  client: Client,
  name: string,
  args: Record<string, unknown>,
  signal: AbortSignal,
) {
  return readWithRetry(
    name,
    async () => {
      const result = await client.callTool(
        { name, arguments: args },
        undefined,
        { signal, timeout: 30000 },
      );
      if (result.isError) {
        const text = JSON.stringify(result.content);
        if (/invalid_token|\b401\b/i.test(text))
          throw new AppError(
            'AUTH_REQUIRED',
            'Підключіть Сільпо повторно.',
            401,
          );
        if (/\b429\b|rate.?limit/i.test(text))
          throw new AppError('RATE_LIMIT', 'Забагато запитів.', 429);
        throw new AppError(
          'MCP_TOOL',
          'Сільпо не вдалося виконати пошук. Перевірте кошик і слот доставки.',
          422,
        );
      }
      const blocks = Array.isArray(result.content) ? result.content : [];
      const parsed = blocks
        .filter((b) => b.type === 'text')
        .map((b) => {
          try {
            return JSON.parse(b.text as string);
          } catch {
            return { text: b.text };
          }
        });
      const data =
        result.structuredContent ?? (parsed.length === 1 ? parsed[0] : parsed);
      return data;
    },
    signal,
  );
}
