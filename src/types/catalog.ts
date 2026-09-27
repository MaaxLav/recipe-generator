import { z } from 'zod';

export type CatalogToolName =
  'silpo_find_products_batch' | 'silpo_get_products';

export type CatalogContext = {
  branch: string;
  delivery: string;
  start: string;
  end: string;
};

// Verified against authenticated tools/list and live catalog responses, 2026-09-27.
export const silpoProductSchema = z.object({
  id: z.string().min(1).max(128),
  name: z.string().min(1).max(300),
  slug: z.string().min(1).max(300),
  price: z.number().positive().max(100000),
  displayPrice: z.number().nonnegative().max(100000),
  available: z.boolean(),
  stock: z.number().nonnegative(),
  weighted: z.boolean(),
  step: z.number().positive(),
  displayRatio: z.string().max(100).nullable(),
  image: z.string().max(2048).nullable(),
  branchId: z.string().max(128).nullable(),
});

export const findProductsBatchSchema = z
  .object({
    products: z.array(z.string().trim().min(1).max(120)).min(1).max(30),
    limit: z.number().int().min(1).max(20),
  })
  .strict();

export const getProductsSchema = z
  .object({
    category: z.string().max(120).nullable(),
    limit: z.number().int().min(1).max(20),
    offset: z.number().int().min(0).max(200).nullable(),
    sortBy: z.enum(['popularity', 'price', 'title']).nullable(),
    sortDirection: z.enum(['asc', 'desc']).nullable(),
    fromPrice: z.number().min(0).max(100000).nullable(),
    toPrice: z.number().min(0).max(100000).nullable(),
  })
  .strict();

export const catalogProductsResponseSchema = z.object({
  products: z.unknown(),
});
