import { z } from 'zod';

import type { Product, Unit } from './contracts';
import { money } from './pricing';

export type Source = { tool: string; data: unknown };
export function pointer(value: unknown, path: string): unknown {
  if (path === '') return value;
  if (!path.startsWith('/')) throw new Error('Потрібен JSON Pointer');
  return path
    .slice(1)
    .split('/')
    .reduce<unknown>((v, part) => {
      const key = part.replace(/~1/g, '/').replace(/~0/g, '~');
      if (
        ['__proto__', 'constructor', 'prototype'].includes(key) ||
        !v ||
        typeof v !== 'object' ||
        !Object.hasOwn(v, key)
      )
        throw new Error('Джерело не містить поля');
      return (v as Record<string, unknown>)[key];
    }, value);
}
const path = z
  .string()
  .describe(
    'RFC6901 JSON Pointer relative to the product object; use the actual MCP response',
  );
export const productEvidenceSchema = z.object({
  sourceId: z.string(),
  objectPath: path,
  idPath: path,
  namePath: path,
  pricePath: path,
  priceCurrency: z
    .enum(['UAH', 'kop'])
    .describe(
      'Use kop only if the MCP schema explicitly identifies the field as kopecks',
    ),
  packagePath: path.describe(
    'A source string explicitly stating content, e.g. 500 г / 1 л / 10 шт. Can point to the product name',
  ),
  priceBasisPath: path.describe(
    'Source field identifying sale/price unit: шт, уп, кг etc. Never guess whether price is per pack or kg',
  ),
  availablePath: path.describe(
    'Boolean availability, stock count, or explicit in_stock status',
  ),
  urlPath: path.nullable(),
  imagePath: path.nullable(),
  minOrderPath: path
    .nullable()
    .describe('Required for weighted goods, in the source sale unit'),
  stepPath: path
    .nullable()
    .describe('Required for weighted goods, in the source sale unit'),
});
export function safeUrl(value: unknown, product = false): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port)
      return null;
    if (
      product &&
      url.hostname !== 'silpo.ua' &&
      !url.hostname.endsWith('.silpo.ua')
    )
      return null;
    if (!product && url.hostname !== 'images.silpo.ua') return null;
    return url.toString();
  } catch {
    return null;
  }
}
export function packageContent(label: string): { content: number; unit: Unit } {
  const matches = [
    ...label.matchAll(
      /(\d+(?:[.,]\d+)?)\s*(кг|kg|мл|ml|шт\.?|pcs|г|g|л|l)(?=\s|$|[,;)])/gi,
    ),
  ];
  if (matches.length !== 1) throw new Error('Фасування не однозначне');
  const unitMap: Record<string, Unit> = {
    кг: 'kg',
    kg: 'kg',
    г: 'g',
    g: 'g',
    мл: 'ml',
    ml: 'ml',
    л: 'l',
    l: 'l',
    шт: 'pcs',
    'шт.': 'pcs',
    pcs: 'pcs',
  };
  const content = Number(matches[0][1].replace(',', '.'));
  if (!Number.isFinite(content) || content <= 0)
    throw new Error('Немає розміру упаковки');
  return { content, unit: unitMap[matches[0][2].toLowerCase()] };
}
export function groundProduct(
  evidence: z.infer<typeof productEvidenceSchema>,
  sources: Map<string, Source>,
): Product {
  const source = sources.get(evidence.sourceId);
  if (
    !source ||
    ![
      'silpo_find_products_batch',
      'silpo_get_products',
      'silpo_get_product_details',
      'silpo_get_similar_products',
      'silpo_get_replacements',
    ].includes(source.tool)
  )
    throw new Error('Немає джерела товару');
  const object = pointer(source.data, evidence.objectPath);
  const read = (p: string | null) => (p === null ? null : pointer(object, p));
  const id = read(evidence.idPath),
    name = read(evidence.namePath),
    label = read(evidence.packagePath);
  if (
    (typeof id !== 'string' && typeof id !== 'number') ||
    typeof name !== 'string' ||
    typeof label !== 'string'
  )
    throw new Error('Немає назви, ідентифікатора або фасування');
  const available = read(evidence.availablePath);
  if (!(
    available === true ||
    (typeof available === 'number' && available > 0) ||
    (typeof available === 'string' &&
      ['in_stock', 'available', 'в наявності'].includes(
        available.toLowerCase(),
      ))
  ))
    throw new Error('Наявність не підтверджено');
  const rawPrice = read(evidence.pricePath);
  if (
    evidence.priceCurrency === 'kop' &&
    !/(?:kop|kopeck|коп|minor)/i.test(
      evidence.pricePath.split('/').at(-1) ?? '',
    )
  )
    throw new Error('Одиниця копійок не підтверджена назвою поля');
  const amount =
    typeof rawPrice === 'number'
      ? rawPrice
      : typeof rawPrice === 'string' && /^\d+([.,]\d{1,2})?$/.test(rawPrice)
        ? Number(rawPrice.replace(',', '.'))
        : NaN;
  const priceKop = evidence.priceCurrency === 'UAH' ? money(amount) : amount;
  if (!Number.isSafeInteger(priceKop) || priceKop <= 0)
    throw new Error('Ціна не підтверджена');
  const basis = String(read(evidence.priceBasisPath)).toLowerCase().trim();
  const packaged = [
    'шт',
    'шт.',
    'уп',
    'уп.',
    'pack',
    'piece',
    'pcs',
    'pc',
  ].includes(basis);
  const weighted = ['кг', 'kg', 'г', 'g'].includes(basis);
  if (!packaged && !weighted) throw new Error('Одиниця ціни не підтверджена');
  const size = packaged
    ? packageContent(label)
    : { content: 1, unit: (['кг', 'kg'].includes(basis) ? 'kg' : 'g') as Unit };
  const minOrder = packaged ? 1 : Number(read(evidence.minOrderPath));
  const orderStep = packaged ? 1 : Number(read(evidence.stepPath));
  if (
    !Number.isFinite(minOrder) ||
    minOrder <= 0 ||
    !Number.isFinite(orderStep) ||
    orderStep <= 0
  )
    throw new Error('Немає правил продажу вагового товару');
  return {
    id: String(id),
    name,
    packageLabel: label,
    priceKop,
    ...size,
    sale: packaged ? 'pack' : 'weight',
    minOrder,
    orderStep,
    url: safeUrl(read(evidence.urlPath), true),
    imageUrl: safeUrl(read(evidence.imagePath)),
  };
}
