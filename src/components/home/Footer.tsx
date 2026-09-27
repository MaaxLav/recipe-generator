export function Footer() {
  return (
    <footer className="shell flex flex-wrap items-center justify-between gap-4 border-t border-[#eadfce] py-7 text-xs text-[#9a8c79]">
      <span>СмакПлан · Менше планування, більше смаку.</span>
      <span>
        Незалежний демопроєкт · Фото:{' '}
        <a
          target="_blank"
          rel="noreferrer"
          className="underline"
          href="https://unsplash.com"
        >
          Unsplash
        </a>
      </span>
    </footer>
  );
}
