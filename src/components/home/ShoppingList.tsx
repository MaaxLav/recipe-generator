import { ShoppingBasket } from 'lucide-react';

import type { PlanResult } from '@/types';

import { ProductImage } from './ProductImage';

const uah = (kop: number) =>
  new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 2,
  }).format(kop / 100);

export function ShoppingList({ result }: { result: PlanResult }) {
  return (
    <aside className="overflow-hidden rounded-[26px] border border-[#eee5d8] bg-white">
      <div className="p-7">
        <h3 className="flex items-center gap-2 text-xl font-bold">
          <ShoppingBasket size={22} className="text-orange" /> Список покупок
        </h3>
        <p className="mt-2 text-xs leading-5 text-[#938574]">
          {result.store} · Ціни перевірено{' '}
          {new Date(result.checkedAt).toLocaleString('uk-UA')}
        </p>
        <div className="mt-5 divide-y divide-[#f0e9df]">
          {result.products.map((p) => (
            <div className="flex gap-3 py-4" key={p.id}>
              <ProductImage src={p.imageUrl} />
              <div className="min-w-0 flex-1">
                {p.url ? (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold hover:text-orange"
                    href={p.url}
                  >
                    {p.name} ↗
                  </a>
                ) : (
                  <span className="text-sm font-semibold">{p.name}</span>
                )}
                <p className="mt-1 text-xs text-[#938574]">
                  {p.packageLabel} · {p.quantity}{' '}
                  {p.sale === 'pack' ? 'уп.' : 'кг'}
                </p>
                <p className="mt-1 text-xs text-[#938574]">
                  {uah(p.priceKop)} / {p.sale === 'pack' ? 'уп.' : 'кг'}
                </p>
              </div>
              <strong className="shrink-0 text-sm">{uah(p.lineKop)}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#fff1d9] p-7">
        <div className="flex items-center justify-between gap-4">
          <span className="font-bold">
            {result.status === 'incomplete'
              ? 'Підтверджена частина'
              : 'Разом до покупки'}
          </span>
          <strong className="text-2xl">{uah(result.totalKop)}</strong>
        </div>
        <p className="mt-3 text-sm text-[#94724b]">
          Бюджет: {uah(result.budgetKop)}
          {result.status !== 'incomplete' &&
            ` · ${result.differenceKop >= 0 ? 'Залишається' : 'Перевищення'}: ${uah(Math.abs(result.differenceKop))}`}
        </p>
        <p className="mt-2 text-xs leading-5 text-[#94724b]">
          Повні упаковки, без доставки. Ціни можуть змінитися до оформлення
          покупки.
        </p>
      </div>
      {result.missing.length > 0 && (
        <div className="px-7 py-5 text-sm leading-6 text-[#945c30]">
          Не підтверджено: {result.missing.join(', ')}. Повна вартість страви
          невідома.
        </div>
      )}
      {result.substitutions.length > 0 && (
        <div className="px-7 py-5">
          <h4 className="text-sm font-bold">Знайшли вигідніше</h4>
          <ul className="mt-2 space-y-2 text-xs leading-5 text-[#837566]">
            {result.substitutions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
