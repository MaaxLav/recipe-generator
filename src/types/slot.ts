import { z } from 'zod';

export const slotSchema = z.object({ start: z.string(), end: z.string() });
export type Slot = z.infer<typeof slotSchema>;
