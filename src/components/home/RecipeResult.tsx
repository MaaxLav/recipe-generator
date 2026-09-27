import { ChefHat, Clock3, Users } from 'lucide-react';

import type { PlanResult } from '@/types';

import { RecipeDetails } from './RecipeDetails';
import { ShoppingList } from './ShoppingList';

export function RecipeResult({ result }: { result: PlanResult | null }) {
  return (
    <section id="result" aria-live="polite" className="shell scroll-mt-8 pb-10">
      {!result ? (
        <div className="rounded-[28px] border border-dashed border-[#e7dac7] px-6 py-12 text-center">
          <ChefHat size={35} className="mx-auto text-[#c7b59a]" />
          <h2 className="mt-4 text-lg font-bold">
            Тут з’явиться ваш смачний план
          </h2>
          <p className="mt-2 text-sm text-[#978a79]">
            Рецепт, покрокові інструкції та продукти з посиланнями.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
            <div>
              <span className="text-xs font-bold tracking-[2px] text-orange">
                ВАШ ПЛАН ПРИГОТУВАННЯ
              </span>
              <h2 className="mt-3 text-4xl font-extrabold tracking-[-1px]">
                {result.recipe.title}
              </h2>
              <div className="mt-4 flex gap-5 text-sm text-[#837667]">
                <span className="flex items-center gap-2">
                  <Users size={17} /> {result.servings} порції
                </span>
                <span className="flex items-center gap-2">
                  <Clock3 size={17} /> ≈ {result.recipe.minutes} хв
                </span>
              </div>
            </div>
            <span
              className={`rounded-full px-4 py-2 text-sm font-bold ${result.status === 'within_budget' ? 'bg-[#e9f1dc] text-[#527134]' : 'bg-[#ffe8cb] text-[#9a571d]'}`}
            >
              {result.status === 'within_budget'
                ? 'У межах бюджету'
                : result.status === 'over_budget'
                  ? 'Бюджет перевищено'
                  : 'Потрібно уточнити товари'}
            </span>
          </div>
          <div className="grid items-start gap-7 lg:grid-cols-[1fr_1.05fr]">
            <RecipeDetails recipe={result.recipe} />
            <ShoppingList result={result} />
          </div>
        </>
      )}
    </section>
  );
}
