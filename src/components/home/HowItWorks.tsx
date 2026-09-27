export function HowItWorks() {
  return (
    <section id="how" className="border-y border-[#eee4d5] bg-[#fffaf2] py-8">
      <div className="shell grid gap-7 md:grid-cols-3">
        {[
          {
            n: '01',
            title: 'Розкажіть, чого хочеться',
            text: 'Страва, кількість людей та комфортний бюджет.',
          },
          {
            n: '02',
            title: 'Довірте пошук помічнику',
            text: 'AI підбере рецепт і знайде потрібні продукти.',
          },
          {
            n: '03',
            title: 'Готуйте із задоволенням',
            text: 'Покроковий план і список покупок уже готові.',
          },
        ].map((item) => (
          <div className="flex gap-4" key={item.n}>
            <span className="mt-0.5 text-xl font-extrabold text-[#eab16d]">
              {item.n}
            </span>
            <div>
              <h2 className="text-sm font-bold">{item.title}</h2>
              <p className="mt-2 text-xs leading-5 text-[#897c6d]">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
