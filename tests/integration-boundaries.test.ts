import assert from 'node:assert/strict';
import { test } from 'node:test';

import { readWithRetry } from '../src/lib/mcp-policy';
import { AppError, publicError } from '../src/server/errors';
import { validOAuthState } from '../src/server/oauth-state';

test('OAuth state rejects wrong, absent, expired and replayed state', () => {
  const now = 1000000;
  assert.equal(validOAuthState('abc', 'abc', now - 1, now), true);
  assert.equal(validOAuthState('abc', 'abd', now - 1, now), false);
  assert.equal(validOAuthState('abc', null, now - 1, now), false);
  assert.equal(validOAuthState('abc', 'abc', now - 600001, now), false);
  assert.equal(validOAuthState(undefined, 'abc', now - 1, now), false);
  assert.equal(validOAuthState('abc', 'a', now - 1, now), false);
});
test('no cart mutation tool can execute', async () => {
  let called = false;
  await assert.rejects(
    () =>
      readWithRetry(
        'silpo_add_or_update_cart_products',
        async () => {
          called = true;
        },
        new AbortController().signal,
      ),
    (e: unknown) => e instanceof AppError && e.code === 'TOOL_FORBIDDEN',
  );
  assert.equal(called, false);
});
test('temporary errors retry at most twice', async () => {
  let attempts = 0;
  await assert.rejects(
    () =>
      readWithRetry(
        'silpo_get_products',
        async () => {
          attempts++;
          throw { code: 429 };
        },
        new AbortController().signal,
        1,
      ),
    (e: unknown) => e instanceof AppError && e.code === 'RATE_LIMIT',
  );
  assert.equal(attempts, 3);
});
test('expired access does not retry product search', async () => {
  let attempts = 0;
  await assert.rejects(
    () =>
      readWithRetry(
        'silpo_get_products',
        async () => {
          attempts++;
          throw { code: 401 };
        },
        new AbortController().signal,
        1,
      ),
    (e: unknown) => e instanceof AppError && e.code === 'AUTH_REQUIRED',
  );
  assert.equal(attempts, 1);
});
test('deadline abort stops further calls', async () => {
  const controller = new AbortController();
  controller.abort();
  let called = false;
  await assert.rejects(() =>
    readWithRetry(
      'silpo_get_products',
      async () => {
        called = true;
      },
      controller.signal,
      1,
    ),
  );
  assert.equal(called, false);
});
test('unknown upstream errors never expose sensitive error text', () => {
  assert.equal(
    JSON.stringify(publicError(new Error('Bearer secret-value'))).includes(
      'secret-value',
    ),
    false,
  );
});
