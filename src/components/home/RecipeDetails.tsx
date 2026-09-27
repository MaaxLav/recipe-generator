import type { Recipe } from '@/lib/contracts';

const unitLabel = { g: 'г', kg: 'кг', ml: 'мл', l: 'л', pcs: 'шт.' };

export function RecipeDetails({ recipe }: { recipe: Recipe }) {
  return (
    <article className="rounded-[26px] border border-[#eee5d8] bg-white p-7">
      <h3 className="text-xl font-bold">Інгредієнти</h3>
      <ul className="mt-4 divide-y divide-[#f3ede5]">
        {recipe.ingredients.map((i) => (
          <li className="flex justify-between gap-3 py-3 text-sm" key={i.id}>
            <span>{i.name}</span>
            <span className="shrink-0 text-[#8a7c6c]">
              {i.quantity} {unitLabel[i.unit]}
            </span>
          </li>
        ))}
      </ul>
      <h3 className="mt-8 text-xl font-bold">Готуємо крок за кроком</h3>
      <ol className="mt-5 space-y-5">
        {recipe.steps.map((step, index) => (
          <li className="flex gap-4" key={index}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff0dc] text-xs font-bold text-orange">
              {index + 1}
            </span>
            <p className="text-sm leading-6 text-[#736657]">{step}</p>
          </li>
        ))}
      </ol>
    </article>
  );
}
