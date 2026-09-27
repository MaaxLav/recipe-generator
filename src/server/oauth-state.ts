import { timingSafeEqual } from 'node:crypto';

export function validOAuthState(
  expected: string | undefined,
  actual: string | null,
  started: number | undefined,
  now = Date.now(),
) {
  return Boolean(
    expected &&
    actual &&
    started &&
    now >= started &&
    now - started <= 10 * 60 * 1000 &&
    Buffer.byteLength(actual) === Buffer.byteLength(expected) &&
    timingSafeEqual(Buffer.from(actual), Buffer.from(expected)),
  );
}
