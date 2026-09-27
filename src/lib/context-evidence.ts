import type { ContextEvidence, Slot, Source } from '@/types';

import { pointer } from './evidence';

export function isAvailableSlot(
  selected: Slot,
  delivery: string,
  slots: {
    start: string;
    end: string;
    available: boolean;
    deliveryType: string;
  }[],
  now = Date.now(),
) {
  return (
    Date.parse(selected.start) < Date.parse(selected.end) &&
    slots.some(
      (s) =>
        s.available &&
        s.deliveryType === delivery &&
        Date.parse(s.start) === Date.parse(selected.start) &&
        Date.parse(s.end) === Date.parse(selected.end) &&
        Date.parse(s.end) > now,
    )
  );
}
export function groundContext(
  args: ContextEvidence,
  sources: Map<string, Source>,
  now = Date.now(),
) {
  const cart = sources.get(args.cartSource),
    slots = sources.get(args.slotsSource);
  if (
    cart?.tool !== 'silpo_get_shopping_cart_by_id' ||
    slots?.tool !== 'silpo_get_time_slots'
  )
    throw new Error('Немає кошика або доступних слотів');
  const branch = pointer(cart.data, args.branchPath),
    delivery = pointer(cart.data, args.deliveryTypePath);
  const start = pointer(cart.data, args.startPath),
    end = pointer(cart.data, args.endPath);
  const availableStart = pointer(slots.data, args.availableStartPath),
    availableEnd = pointer(slots.data, args.availableEndPath);
  if (
    !branch ||
    typeof delivery !== 'string' ||
    typeof start !== 'string' ||
    typeof end !== 'string' ||
    !Number.isFinite(Date.parse(start)) ||
    !Number.isFinite(Date.parse(end)) ||
    Date.parse(end) <= now ||
    Date.parse(start) >= Date.parse(end) ||
    start !== availableStart ||
    end !== availableEnd
  )
    throw new Error('Слот кошика не підтверджено');
  const store = args.storePath ? pointer(cart.data, args.storePath) : null;
  return {
    branch: String(branch),
    delivery,
    store: typeof store === 'string' ? store : `Сільпо · магазин ${branch}`,
  };
}
