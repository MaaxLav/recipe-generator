import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { Recipe } from '../src/lib/contracts';
import { calculate } from '../src/lib/pricing';
import { normalizeSilpoProduct } from '../src/lib/silpo-product';

// Field layout and kg/display-price relationship verified with live MCP.
// Identifiers below are synthetic; these fixtures contain no account data.
const product = {
  id: 'beef',
  name: 'Фарш яловичий',
  slug: 'beef-fixture',
  price: 323.4,
  displayPrice: 32.34,
  available: true,
  stock: 2.5,
  weighted: true,
  step: 0.5,
  displayRatio: '100г',
  image: null,
  branchId: 'branch-test',
};
const details = {
  id: 'beef',
  slug: 'beef-fixture',
  url: 'https://silpo.ua/product/beef-fixture',
  hasOfferAtBranch: true,
  branchId: 'branch-test',
};
test('Silpo weighted price is per kg, never per displayRatio of 100g', () => {
  const p = normalizeSilpoProduct(product, details, 'branch-test');
  const r: Recipe = {
    title: 'Соус',
    minutes: 20,
    ingredients: [{ id: 'beef', name: 'Фарш', quantity: 500, unit: 'g' }],
    steps: ['Приготувати'],
  };
  const b = calculate(r, new Map([['beef', p]]));
  assert.equal(p.priceKop, 32340);
  assert.equal(p.unit, 'kg');
  assert.equal(b.products[0].quantity, 0.5);
  assert.equal(b.totalKop, 16170);
});
test('Silpo unit-counted products use displayRatio for full packs', () => {
  const p = normalizeSilpoProduct(
    {
      ...product,
      weighted: false,
      price: 100,
      displayPrice: 100,
      step: 1,
      displayRatio: '180г',
    },
    details,
    'branch-test',
  );
  assert.equal(p.content, 180);
  assert.equal(p.unit, 'g');
  assert.equal(p.sale, 'pack');
});
test('wrong branch, identity or missing offer cannot enter the basket', () => {
  assert.throws(() =>
    normalizeSilpoProduct(
      product,
      { ...details, id: 'different' },
      'branch-test',
    ),
  );
  assert.throws(() =>
    normalizeSilpoProduct(
      product,
      { ...details, hasOfferAtBranch: false },
      'branch-test',
    ),
  );
  assert.throws(() => normalizeSilpoProduct(product, details, 'other-branch'));
});
test('unknown price units and insufficient stock cannot claim a complete plan', () => {
  assert.throws(() =>
    normalizeSilpoProduct({ ...product, price: 32.34 }, details, 'branch-test'),
  );
  const p = normalizeSilpoProduct(
    { ...product, stock: 0.3 },
    details,
    'branch-test',
  );
  const r: Recipe = {
    title: 'Соус',
    minutes: 20,
    ingredients: [{ id: 'beef', name: 'Фарш', quantity: 500, unit: 'g' }],
    steps: ['Приготувати'],
  };
  assert.deepEqual(calculate(r, new Map([['beef', p]])).missing, ['Фарш']);
});
