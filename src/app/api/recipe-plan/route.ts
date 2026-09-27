import { NextRequest, NextResponse } from 'next/server';

import { createPlan } from '@/server/agent';
import { AppError, publicError } from '@/server/errors';
import { getSession, origin } from '@/server/session';
import { requestSchema } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 180;
export async function POST(request: NextRequest) {
  let session: Awaited<ReturnType<typeof getSession>>;
  let locked = false;
  try {
    if (request.headers.get('origin') !== origin())
      throw new AppError(
        'ORIGIN',
        'Відкрийте застосунок за його локальною адресою.',
        403,
      );
    if (!request.headers.get('content-type')?.includes('application/json'))
      throw new AppError('INPUT', 'Очікується JSON.', 415);
    const body = await request.text();
    if (body.length > 8000)
      throw new AppError('INPUT', 'Запит надто довгий.', 413);
    let json: unknown;
    try {
      json = JSON.parse(body);
    } catch {
      throw new AppError('INPUT', 'Некоректний запит.', 400);
    }
    const parsed = requestSchema.safeParse(json);
    if (!parsed.success)
      throw new AppError(
        'INPUT',
        'Вкажіть страву, від 1 до 30 людей і додатний бюджет до 100 000 грн (до двох знаків після коми).',
      );
    session = await getSession();
    if (!session?.tokens)
      throw new AppError(
        'AUTH_REQUIRED',
        'Спочатку підключіть свій акаунт Сільпо.',
        401,
      );
    if (session.busy)
      throw new AppError('BUSY', 'Попередній запит ще виконується.', 409);
    session.busy = true;
    locked = true;
    const signal = AbortSignal.any([
      request.signal,
      AbortSignal.timeout(180000),
    ]);
    const result = await createPlan(parsed.data, session, signal);
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    const { status, ...body } = publicError(error);
    return NextResponse.json(body, {
      status,
      headers: { 'Cache-Control': 'no-store' },
    });
  } finally {
    if (locked && session) session.busy = false;
  }
}
