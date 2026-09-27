import type { Product, Recipe, ShoppingLine, Unit } from '@/types';

const units: Record<Unit, { family: string; scale: number }> = {
  g: { family: 'mass', scale: 1 },
  kg: { family: 'mass', scale: 1000 },
  ml: { family: 'volume', scale: 1 },
  l: { family: 'volume', scale: 1000 },
  pcs: { family: 'count', scale: 1 },
};
export function convert(quantity: number, from: Unit, to: Unit) {
  if (
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    units[from].family !== units[to].family
  )
    throw new Error('Несумісні одиниці');
  return (quantity * units[from].scale) / units[to].scale;
}
export function money(value: number) {
  if (!Number.isFinite(value) || value < 0) throw new Error('Некоректна ціна');
  return Math.round((value + Number.EPSILON) * 100);
}
export function calculate(recipe: Recipe, selections: Map<string, Product>) {
  const grouped = new Map<
    string,
    { product: Product; needed: number; ids: string[] }
  >();
  const missing: string[] = [];
  for (const ingredient of recipe.ingredients) {
    const product = selections.get(ingredient.id);
    if (!product || !product.url) {
      missing.push(ingredient.name);
      continue;
    }
    try {
      if (
        product.content <= 0 ||
        product.orderStep <= 0 ||
        product.minOrder <= 0 ||
        !Number.isSafeInteger(product.priceKop) ||
        product.priceKop <= 0
      )
        throw new Error('Неповні дані');
      const amount = convert(
        ingredient.quantity,
        ingredient.unit,
        product.unit,
      );
      const group = grouped.get(product.id) ?? { product, needed: 0, ids: [] };
      group.needed += amount;
      group.ids.push(ingredient.id);
      grouped.set(product.id, group);
    } catch {
      missing.push(ingredient.name);
    }
  }
  const products: ShoppingLine[] = [...grouped.values()].flatMap(
    ({ product, needed, ids }) => {
      const raw = needed / product.content;
      const quantity =
        product.sale === 'pack'
          ? Math.ceil(
              Math.max(raw, product.minOrder) / product.orderStep - 1e-10,
            ) * product.orderStep
          : Number(
              (
                Math.ceil(
                  (Math.max(raw, product.minOrder) - 1e-10) / product.orderStep,
                ) * product.orderStep
              ).toFixed(6),
            );
      if (product.stock !== undefined && quantity > product.stock + 1e-9) {
        missing.push(
          ...recipe.ingredients
            .filter((i) => ids.includes(i.id))
            .map((i) => i.name),
        );
        return [];
      }
      return [
        {
          ...product,
          ingredientIds: ids,
          quantity,
          lineKop: Math.round(quantity * product.priceKop),
        },
      ];
    },
  );
  return {
    products,
    missing,
    totalKop: products.reduce((sum, p) => sum + p.lineKop, 0),
  };
}
