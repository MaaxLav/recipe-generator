import './globals.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'СмакПлан — від бажання до вечері',
  description: 'Рецепт, продукти із Сільпо та ваш бюджет — в одному плані.',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
