import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculate, convert, money } from '../src/lib/pricing';
import type { Product, Recipe } from '../src/types';
import { requestSchema } from '../src/types';

const product: Product = {
  id: 'milk',
  name: 'Молоко 1 л',
  url: 'https://silpo.ua/product/milk',
  imageUrl: null,
  packageLabel: '1 л',
  priceKop: 4999,
  content: 1,
  unit: 'l',
  sale: 'pack',
  minOrder: 1,
  orderStep: 1,
};
const recipe: Recipe = {
  title: 'Соус',
  minutes: 10,
  ingredients: [{ id: 'milk', name: 'Молоко', quantity: 1200, unit: 'ml' }],
  steps: ['Змішати'],
};
test('buys full packs instead of costing only consumed amount', () => {
  const result = calculate(recipe, new Map([['milk', product]]));
  assert.equal(result.products[0].quantity, 2);
  assert.equal(result.totalKop, 9998);
  assert.deepEqual(result.missing, []);
});
test('aggregates same product across recipe components before rounding', () => {
  const r: Recipe = {
    ...recipe,
    ingredients: [
      { id: 'a', name: 'Молоко для соусу', quantity: 400, unit: 'ml' },
      { id: 'b', name: 'Молоко для тіста', quantity: 500, unit: 'ml' },
    ],
  };
  const result = calculate(
    r,
    new Map([
      ['a', product],
      ['b', product],
    ]),
  );
  assert.equal(result.products.length, 1);
  assert.equal(result.totalKop, 4999);
});
test('weighted purchase honors minimum and increment', () => {
  const r: Recipe = {
    ...recipe,
    ingredients: [{ id: 'a', name: 'Морква', quantity: 230, unit: 'g' }],
  };
  const p: Product = {
    ...product,
    id: 'carrot',
    content: 1,
    unit: 'kg',
    sale: 'weight',
    priceKop: 4000,
    minOrder: 0.3,
    orderStep: 0.1,
  };
  const result = calculate(r, new Map([['a', p]]));
  assert.equal(result.products[0].quantity, 0.3);
  assert.equal(result.totalKop, 1200);
});
test('missing or incompatible evidence cannot claim complete basket', () => {
  assert.deepEqual(calculate(recipe, new Map()).missing, ['Молоко']);
  assert.deepEqual(
    calculate(recipe, new Map([['milk', { ...product, unit: 'g' }]])).missing,
    ['Молоко'],
  );
  assert.deepEqual(
    calculate(recipe, new Map([['milk', { ...product, url: null }]])).missing,
    ['Молоко'],
  );
});
test('unit conversions and cents are deterministic', () => {
  assert.equal(convert(1.5, 'kg', 'g'), 1500);
  assert.equal(convert(250, 'ml', 'l'), 0.25);
  assert.equal(money(19.99), 1999);
  assert.throws(() => convert(1, 'kg', 'l'));
  assert.throws(() => money(NaN));
});
test('form validation rejects invalid amounts and fractional people', () => {
  for (const input of [
    { request: '', servings: 4, budgetUah: 600 },
    { request: 'Паста', servings: 1.5, budgetUah: 600 },
    { request: 'Паста', servings: 4, budgetUah: -1 },
  ])
    assert.equal(requestSchema.safeParse(input).success, false);
  assert.equal(
    requestSchema.safeParse({ request: 'Лазанья', servings: 4, budgetUah: 600 })
      .success,
    true,
  );
});
