import { z } from 'zod';

export const requestSchema = z.object({
  request: z.string().trim().min(2).max(1500),
  servings: z.number().int().min(1).max(30),
  budgetUah: z.number().positive().max(100000).multipleOf(0.01),
});
export type PlanRequest = z.infer<typeof requestSchema>;
export const unitSchema = z.enum(['g', 'kg', 'ml', 'l', 'pcs']);
export type Unit = z.infer<typeof unitSchema>;
export const recipeSchema = z.object({
  title: z.string().trim().min(1).max(160),
  minutes: z.number().int().positive().max(10080),
  ingredients: z
    .array(
      z
        .object({
          id: z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/),
          name: z.string().trim().min(1).max(120),
          quantity: z.number().positive().max(100000),
          unit: unitSchema,
        })
        .strict(),
    )
    .min(1)
    .max(30),
  steps: z.array(z.string().trim().min(1).max(2000)).min(1).max(30),
});
export type Recipe = z.infer<typeof recipeSchema>;
export type Product = {
  id: string;
  name: string;
  url: string | null;
  imageUrl: string | null;
  packageLabel: string;
  priceKop: number;
  content: number;
  unit: Unit;
  sale: 'pack' | 'weight';
  minOrder: number;
  orderStep: number;
  stock?: number;
};
export type ShoppingLine = Product & {
  ingredientIds: string[];
  quantity: number;
  lineKop: number;
};
export type PlanResult = {
  recipe: Recipe;
  servings: number;
  products: ShoppingLine[];
  totalKop: number;
  budgetKop: number;
  differenceKop: number;
  status: 'within_budget' | 'over_budget' | 'incomplete';
  missing: string[];
  substitutions: string[];
  store: string;
  checkedAt: string;
};
