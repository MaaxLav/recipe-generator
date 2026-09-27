import { z } from 'zod';

import { type Product, silpoProductSchema } from '@/types';

import { packageContent, safeUrl } from './evidence';
import { convert, money } from './pricing';

export function normalizeSilpoProduct(
  value: unknown,
  detailValue: unknown,
  branch: string,
): Product {
  const p = silpoProductSchema.parse(value);
  const details = z
    .object({
      id: z.string(),
      slug: z.string(),
      url: z.string(),
      hasOfferAtBranch: z.boolean(),
      branchId: z.string().nullable(),
    })
    .parse(detailValue);
  if (
    !p.available ||
    p.stock <= 0 ||
    p.branchId !== branch ||
    !details.hasOfferAtBranch ||
    details.branchId !== branch ||
    details.id !== p.id ||
    details.slug !== p.slug
  )
    throw new Error('Товар не підтверджений у вибраному магазині');
  const url = safeUrl(details.url, true);
  if (!url) throw new Error('Відсутнє підтверджене посилання на товар');
  if (!p.displayRatio) throw new Error('Каталог не вказав фасування');
  const pack = packageContent(p.displayRatio);
  if (p.weighted) {
    // MCP documents price/quantity/step in kg even when displayRatio is 100 г.
    const displayKg = convert(pack.content, pack.unit, 'kg');
    if (Math.abs(money(p.price * displayKg) - money(p.displayPrice)) > 1)
      throw new Error('Ціна за кілограм не узгоджується з показаною ціною');
  } else if (
    !Number.isInteger(p.step) ||
    Math.abs(money(p.price) - money(p.displayPrice)) > 1
  )
    throw new Error('Одиниця продажу упаковки не підтверджена');
  return {
    id: p.id,
    name: p.name,
    url,
    imageUrl: safeUrl(p.image),
    packageLabel: p.weighted ? `Ваговий · крок ${p.step} кг` : p.displayRatio,
    priceKop: money(p.price),
    content: p.weighted ? 1 : pack.content,
    unit: p.weighted ? 'kg' : pack.unit,
    sale: p.weighted ? 'weight' : 'pack',
    minOrder: p.step,
    orderStep: p.step,
    stock: p.stock,
  };
}
