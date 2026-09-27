import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  groundProduct,
  packageContent,
  pointer,
  safeUrl,
  type Source,
} from '../src/lib/evidence';

// Synthetic fixtures exercise grounding mechanics, NOT an asserted Silpo wire format.
const sources = new Map<string, Source>([
  [
    's1',
    {
      tool: 'silpo_get_product_details',
      data: {
        item: {
          id: 'one',
          title: 'Молоко',
          pack: '1 л',
          price: 48.9,
          unit: 'шт',
          available: true,
          url: 'https://silpo.ua/product/example',
        },
      },
    },
  ],
]);
const evidence = {
  sourceId: 's1',
  objectPath: '/item',
  idPath: '/id',
  namePath: '/title',
  pricePath: '/price',
  priceCurrency: 'UAH' as const,
  packagePath: '/pack',
  priceBasisPath: '/unit',
  availablePath: '/available',
  urlPath: '/url',
  imagePath: null,
  minOrderPath: null,
  stepPath: null,
};
test('reads exact values from one MCP object', () => {
  const p = groundProduct(evidence, sources);
  assert.equal(p.name, 'Молоко');
  assert.equal(p.priceKop, 4890);
  assert.equal(p.content, 1);
  assert.equal(p.imageUrl, null);
});
test('rejects fabricated fields, missing source and cart as product source', () => {
  assert.throws(() =>
    groundProduct({ ...evidence, pricePath: '/madeUp' }, sources),
  );
  assert.throws(() =>
    groundProduct({ ...evidence, sourceId: 'not-real' }, sources),
  );
  assert.throws(() =>
    groundProduct(
      evidence,
      new Map([
        [
          's1',
          { ...sources.get('s1')!, tool: 'silpo_get_shopping_cart_by_id' },
        ],
      ]),
    ),
  );
});
test('rejects ambiguous packaging, unsafe links, and prototype traversal', () => {
  assert.throws(() => packageContent('500 г + 100 г'));
  assert.deepEqual(packageContent('Паста 500 г'), { content: 500, unit: 'g' });
  assert.equal(safeUrl('javascript:alert(1)'), null);
  assert.equal(safeUrl('https://evil.test/product', true), null);
  assert.equal(safeUrl('https://silpo.ua.evil.test/product', true), null);
  assert.throws(() => pointer({}, '/__proto__'));
});
test('weighted goods without minimum and increments stay unconfirmed', () => {
  const data = {
    item: { ...(sources.get('s1')!.data as { item: object }).item, unit: 'кг' },
  };
  assert.throws(() =>
    groundProduct(
      evidence,
      new Map([['s1', { tool: 'silpo_get_product_details', data }]]),
    ),
  );
});
