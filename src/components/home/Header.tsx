import { CookingPot } from 'lucide-react';

export function Header({ connected }: { connected: boolean }) {
  return (
    <header className="shell flex h-24 items-center justify-between gap-4">
      <a
        href="#"
        aria-label="СмакПлан — головна"
        className="flex items-center gap-2.5 no-underline"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-orange text-white">
          <CookingPot size={25} />
        </span>
        <span className="text-2xl font-extrabold tracking-[-1px]">
          Смак<span className="text-orange">План</span>
        </span>
      </a>
      <nav className="hidden items-center gap-8 text-sm text-[#776c60] md:flex">
        <a href="#how">Як це працює</a>
        <a href="#planner">Скласти план</a>
      </nav>
      <span className="flex items-center gap-2 rounded-full border border-[#e7ddcd] px-4 py-2.5 text-xs font-semibold">
        <span
          className={`h-2 w-2 rounded-full ${connected ? 'bg-green-600' : 'bg-orange'}`}
        />
        {connected ? 'Сільпо підключено' : 'З продуктами із Сільпо'}
      </span>
    </header>
  );
}
