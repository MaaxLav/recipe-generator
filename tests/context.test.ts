import assert from 'node:assert/strict';
import { test } from 'node:test';

import { groundContext, isAvailableSlot } from '../src/lib/context-evidence';
import type { Source } from '../src/lib/evidence';

// Synthetic context examples, not a claimed Silpo schema.
const slot = { start: '2030-01-01T12:00:00Z', end: '2030-01-01T13:00:00Z' };
const sources = new Map<string, Source>([
  [
    'cart',
    {
      tool: 'silpo_get_shopping_cart_by_id',
      data: { branch: 'branch-a', delivery: 'SelfPickup', slot },
    },
  ],
  ['slots', { tool: 'silpo_get_time_slots', data: [slot] }],
]);
const evidence = {
  cartSource: 'cart',
  branchPath: '/branch',
  deliveryTypePath: '/delivery',
  startPath: '/slot/start',
  endPath: '/slot/end',
  storePath: null,
  slotsSource: 'slots',
  availableStartPath: '/0/start',
  availableEndPath: '/0/end',
};
test('valid cart context must match an available slot exactly', () => {
  assert.equal(
    groundContext(evidence, sources, Date.parse('2029-12-31')).branch,
    'branch-a',
  );
  assert.throws(() =>
    groundContext(
      evidence,
      new Map([
        ...sources,
        [
          'slots',
          {
            tool: 'silpo_get_time_slots',
            data: [{ ...slot, end: '2030-01-01T14:00:00Z' }],
          },
        ],
      ]),
      Date.parse('2029-12-31'),
    ),
  );
});
test('missing cart and expired slot cannot enable searches', () => {
  assert.throws(() =>
    groundContext(evidence, new Map(), Date.parse('2029-12-31')),
  );
  assert.throws(() =>
    groundContext(evidence, sources, Date.parse('2030-01-02')),
  );
});
test('native slot check rejects unavailable slots and wrong delivery type', () => {
  const now = Date.parse('2029-12-31');
  assert.equal(
    isAvailableSlot(
      slot,
      'SelfPickup',
      [{ ...slot, available: false, deliveryType: 'SelfPickup' }],
      now,
    ),
    false,
  );
  assert.equal(
    isAvailableSlot(
      slot,
      'SelfPickup',
      [{ ...slot, available: true, deliveryType: 'DeliveryHome' }],
      now,
    ),
    false,
  );
  assert.equal(
    isAvailableSlot(
      slot,
      'SelfPickup',
      [
        {
          start: '2030-01-01T12:00:00+00:00',
          end: '2030-01-01T13:00:00+00:00',
          available: true,
          deliveryType: 'SelfPickup',
        },
      ],
      now,
    ),
    true,
  );
});
