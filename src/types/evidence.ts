import { z } from 'zod';

export type Source = { tool: string; data: unknown };

export const contextSchema = z.object({
  cartSource: z.string(),
  branchPath: z.string(),
  deliveryTypePath: z.string(),
  startPath: z.string(),
  endPath: z.string(),
  storePath: z.string().nullable(),
  slotsSource: z.string(),
  availableStartPath: z.string(),
  availableEndPath: z.string(),
});
export type ContextEvidence = z.infer<typeof contextSchema>;

const path = z
  .string()
  .describe(
    'RFC6901 JSON Pointer relative to the product object; use the actual MCP response',
  );
export const productEvidenceSchema = z.object({
  sourceId: z.string(),
  objectPath: path,
  idPath: path,
  namePath: path,
  pricePath: path,
  priceCurrency: z
    .enum(['UAH', 'kop'])
    .describe(
      'Use kop only if the MCP schema explicitly identifies the field as kopecks',
    ),
  packagePath: path.describe(
    'A source string explicitly stating content, e.g. 500 г / 1 л / 10 шт. Can point to the product name',
  ),
  priceBasisPath: path.describe(
    'Source field identifying sale/price unit: шт, уп, кг etc. Never guess whether price is per pack or kg',
  ),
  availablePath: path.describe(
    'Boolean availability, stock count, or explicit in_stock status',
  ),
  urlPath: path.nullable(),
  imagePath: path.nullable(),
  minOrderPath: path
    .nullable()
    .describe('Required for weighted goods, in the source sale unit'),
  stepPath: path
    .nullable()
    .describe('Required for weighted goods, in the source sale unit'),
});

export type ProductEvidence = z.infer<typeof productEvidenceSchema>;
