import { setTimeout as delay } from 'node:timers/promises';

import { READ_TOOLS } from '@/constants';

import { AppError } from '../server/errors';

export async function readWithRetry<T>(
  name: string,
  call: () => Promise<T>,
  signal: AbortSignal,
  baseDelay = 500,
): Promise<T> {
  if (!READ_TOOLS.has(name))
    throw new AppError('TOOL_FORBIDDEN', 'Ця дія недоступна.', 403);
  for (let attempt = 0; ; attempt++) {
    signal.throwIfAborted();
    try {
      return await call();
    } catch (error) {
      const status =
        error instanceof AppError
          ? error.status
          : (error as { code?: number }).code;
      if (
        status === 401 ||
        (error instanceof Error && error.name === 'UnauthorizedError')
      )
        throw new AppError(
          'AUTH_REQUIRED',
          'Доступ до Сільпо завершився. Підключіть акаунт повторно.',
          401,
        );
      if (status === 403)
        throw new AppError(
          'MCP_FORBIDDEN',
          'Сільпо не надав доступ до потрібного інструмента.',
          403,
        );
      const retryable =
        status === 429 ||
        (typeof status === 'number' && status >= 500 && status < 600) ||
        error instanceof TypeError;
      if (attempt >= 2 || !retryable) {
        if (status === 429)
          throw new AppError(
            'RATE_LIMIT',
            'Сільпо тимчасово обмежив кількість запитів. Спробуйте пізніше.',
            429,
          );
        throw error;
      }
      await delay(baseDelay * 2 ** attempt, undefined, { signal });
    }
  }
}
