import 'server-only';

import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { z } from 'zod';

import { isAvailableSlot } from '@/lib/context-evidence';

import { AppError } from './errors';
import { callReadTool } from './mcp';

const slotSchema = z.object({ start: z.string(), end: z.string() });
export async function loadCartContext(client: Client, signal: AbortSignal) {
  const missing = () =>
    new AppError(
      'CART_CONTEXT',
      'Відкрийте silpo.ua, налаштуйте магазин або адресу та актуальний слот у своєму кошику. Потім поверніться й повторіть запит. Товари додавати не потрібно.',
      409,
    );
  const current = z
    .object({ exists: z.boolean(), shoppingCartId: z.string().nullable() })
    .parse(
      await callReadTool(client, 'silpo_get_my_shopping_cart', {}, signal),
    );
  if (!current.exists || !current.shoppingCartId) throw missing();
  const { cart } = z
    .object({
      cart: z.object({
        shipments: z.array(z.object({ branchId: z.string() })),
        deliveryType: z.string(),
        timeslot: slotSchema.nullable(),
      }),
    })
    .parse(
      await callReadTool(
        client,
        'silpo_get_shopping_cart_by_id',
        { shoppingCartId: current.shoppingCartId },
        signal,
      ),
    );
  if (!cart.shipments[0]?.branchId || !cart.timeslot) throw missing();
  const branch = cart.shipments[0].branchId;
  const delivery =
    cart.deliveryType === 'DeliveryExpressByPromise'
      ? 'DeliveryHome'
      : cart.deliveryType;
  const response = z
    .object({
      slots: z.array(
        slotSchema.extend({ available: z.boolean(), deliveryType: z.string() }),
      ),
    })
    .parse(
      await callReadTool(
        client,
        'silpo_get_time_slots',
        {
          branchId: branch,
          deliveryTypes: [delivery],
          start: cart.timeslot.start,
          end: cart.timeslot.end,
          limit: 100,
        },
        signal,
      ),
    );
  const selected = cart.timeslot;
  const valid = isAvailableSlot(selected, delivery, response.slots);
  if (!valid) throw missing();
  return {
    branch,
    delivery,
    start: selected.start,
    end: selected.end,
    store: 'Сільпо · магазин із вашого кошика',
  };
}
