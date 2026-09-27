import {
  ArrowDown,
  Check,
  ChefHat,
  CookingPot,
  Leaf,
  Sparkles,
} from 'lucide-react';

type HeroProps = {
  photoFailed: boolean;
  onPhotoError: () => void;
};

export function Hero({ photoFailed, onPhotoError }: HeroProps) {
  return (
    <section className="shell grid items-center gap-12 pb-9 pt-6 lg:grid-cols-[1.08fr_1fr] lg:gap-16 lg:pb-12 lg:pt-8">
      <div>
        <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#fff0d3] px-4 py-2 text-xs font-bold tracking-wide text-[#99541a]">
          <Sparkles size={14} /> ВАШ КУЛІНАРНИЙ AI-ПОМІЧНИК
        </span>
        <h1 className="max-w-[650px] text-[44px] leading-[1.08] font-extrabold tracking-[-2px] sm:text-[60px] lg:text-[66px]">
          Ви обираєте страву.
          <br />
          <span className="text-orange">
            Ми плануємо
            <br className="hidden lg:block" /> решту.
          </span>
        </h1>
        <p className="mt-6 max-w-[450px] text-[17px] leading-7 text-[#786c5f]">
          Від «а що на вечерю?» до готового рецепта й списку покупок. Знайдемо
          продукти у Сільпо та допоможемо вкластися у ваш бюджет.
        </p>
        <a
          href="#planner"
          className="orange-button mt-8 inline-flex items-center gap-4 px-7 py-4 text-sm no-underline"
        >
          Спланувати смачне <ArrowDown size={18} />
        </a>
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#877c70]">
          <span className="flex items-center gap-1.5">
            <Check size={14} className="text-[#78944c]" /> Реальні товари
          </span>
          <span className="flex items-center gap-1.5">
            <Check size={14} className="text-[#78944c]" /> Прозорий бюджет
          </span>
          <span className="flex items-center gap-1.5">
            <Check size={14} className="text-[#78944c]" /> Менше клопоту
          </span>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-[520px] pb-8 pr-3">
        <div className="hero-photo relative aspect-[1.06] overflow-hidden rounded-[36px]">
          {!photoFailed ? (
            <img
              fetchPriority="high"
              alt="Апетитна паста з томатним соусом і зеленню"
              src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1100&q=85"
              onError={onPhotoError}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#f6dec0]">
              <CookingPot size={130} className="text-orange" />
            </div>
          )}
          <span className="absolute top-5 left-5 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-xs font-bold">
            <Leaf size={15} className="text-[#66853e]" /> Смачне починається з
            плану
          </span>
        </div>
        <div className="card-shadow absolute right-0 bottom-0 left-7 flex items-center gap-4 rounded-2xl border border-[#f0e6d7] bg-white p-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff0d8] text-orange">
            <ChefHat size={27} />
          </span>
          <div>
            <p className="text-sm font-bold">Ваш рецепт. Ваш бюджет.</p>
            <p className="mt-1 text-xs leading-5 text-[#897e72]">
              Інгредієнти, кроки та покупки — усе разом.
            </p>
          </div>
          <Sparkles size={21} className="ml-auto shrink-0 text-orange" />
        </div>
      </div>
    </section>
  );
}
