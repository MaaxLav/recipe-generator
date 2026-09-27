import {
  ArrowRight,
  CookingPot,
  ExternalLink,
  LoaderCircle,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import type { FormEventHandler } from 'react';

type PlannerProps = {
  connected: boolean;
  checking: boolean;
  busy: boolean;
  request: string;
  servings: string;
  budget: string;
  error: string;
  onCheckConnection: () => void;
  onRequestChange: (value: string) => void;
  onServingsChange: (value: string) => void;
  onBudgetChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function Planner({
  connected,
  checking,
  busy,
  request,
  servings,
  budget,
  error,
  onCheckConnection,
  onRequestChange,
  onServingsChange,
  onBudgetChange,
  onSubmit,
}: PlannerProps) {
  return (
    <section id="planner" className="shell scroll-mt-8 py-18">
      <div className="mb-8 text-center">
        <span className="text-xs font-bold tracking-[2px] text-orange">
          ТРОХИ МАГІЇ НА ВАШІЙ КУХНІ
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-1px] sm:text-4xl">
          Що приготуємо сьогодні?
        </h2>
        <p className="mt-3 text-sm text-[#897c6d]">
          Лише три деталі — і ми почнемо шукати найсмачніше рішення.
        </p>
      </div>
      <div className="card-shadow mx-auto max-w-[910px] overflow-hidden rounded-[28px] border border-[#eee5d8] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e9df] bg-[#fffdfa] px-7 py-4">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`h-2 w-2 rounded-full ${connected ? 'bg-green-600' : 'bg-[#d8ae6e]'}`}
            />
            {checking
              ? 'Перевіряємо підключення…'
              : connected
                ? 'Ваш акаунт Сільпо підключено'
                : 'Підключіть Сільпо для актуальних цін'}
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-xs text-[#817465] underline"
              disabled={checking || busy}
              onClick={onCheckConnection}
            >
              Перевірити
            </button>
            <a
              href="/api/auth/start"
              className="flex items-center gap-2 text-xs font-bold text-[#ca6509]"
            >
              {connected ? 'Перепідключити' : 'Підключити Сільпо'}{' '}
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
        <form className="p-7 sm:p-9" onSubmit={onSubmit}>
          <label
            htmlFor="request"
            className="mb-2.5 flex items-center gap-2 text-sm font-bold"
          >
            <CookingPot size={17} className="text-orange" /> Що хочете
            приготувати?
          </label>
          <textarea
            required
            id="request"
            minLength={2}
            maxLength={1500}
            className="field min-h-[100px] resize-y text-sm"
            placeholder="Наприклад, лазанью або щось легке на вечерю…"
            value={request}
            onChange={(e) => onRequestChange(e.target.value)}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#998d7e]">Спробуйте:</span>
            {['Лазанья', 'Крем-суп із грибів', 'Паста з куркою'].map((text) => (
              <button
                type="button"
                className="rounded-full bg-[#f8f4ed] px-3 py-1.5 text-[#827360] hover:bg-[#ffecd3]"
                key={text}
                onClick={() => onRequestChange(text)}
              >
                {text}
              </button>
            ))}
          </div>
          <div className="mt-7 grid grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label
                htmlFor="servings"
                className="mb-2.5 flex items-center gap-2 text-sm font-bold"
              >
                <Users size={17} className="text-orange" /> Кількість людей
              </label>
              <input
                min={1}
                max={30}
                step={1}
                required
                id="servings"
                type="number"
                className="field"
                value={servings}
                onChange={(e) => onServingsChange(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="budget"
                className="mb-2.5 flex items-center gap-2 text-sm font-bold"
              >
                <Wallet size={17} className="text-orange" /> Бюджет, грн
              </label>
              <input
                required
                min={0.01}
                id="budget"
                step={0.01}
                max={100000}
                type="number"
                className="field"
                value={budget}
                onChange={(e) => onBudgetChange(e.target.value)}
              />
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#9b8e7f]">
            Вартість повних упаковок усіх інгредієнтів, без доставки.
          </p>
          <button
            className="orange-button mt-7 flex w-full items-center justify-center gap-3 px-6 py-4 text-sm"
            disabled={busy || checking || !connected}
          >
            {busy ? (
              <>
                <LoaderCircle size={19} className="spin" /> Шукаємо продукти й
                рахуємо бюджет…
              </>
            ) : (
              <>
                <Sparkles size={18} /> Скласти план <ArrowRight size={17} />
              </>
            )}
          </button>
          <p
            aria-live="polite"
            className="mt-3 text-center text-xs leading-5 text-[#9b8e7f]"
          >
            {busy
              ? 'Це може зайняти до 3 хвилин. Шукаємо також дешевші варіанти.'
              : 'Рецепт і покупки за один запит. Товари не додаються до кошика.'}
          </p>
        </form>
      </div>
      {error && (
        <div
          role="alert"
          className="mx-auto mt-5 max-w-[910px] rounded-2xl border border-[#f4c5a8] bg-[#fff0e6] p-5 text-sm leading-6"
        >
          <p>{error}</p>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://silpo.ua"
            className="mt-2 inline-flex items-center gap-1 font-semibold underline"
          >
            Відкрити Сільпо <ExternalLink size={13} />
          </a>
        </div>
      )}
    </section>
  );
}
