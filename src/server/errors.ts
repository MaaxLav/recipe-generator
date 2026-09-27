export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function publicError(error: unknown) {
  if (error instanceof AppError)
    return { message: error.message, code: error.code, status: error.status };
  if (
    error instanceof Error &&
    /abort|timeout/i.test(error.name + error.message)
  )
    return {
      message: 'Пошук тривав надто довго. Спробуйте ще раз.',
      code: 'TIMEOUT',
      status: 504,
    };
  if ((error as { status?: number })?.status === 429)
    return {
      message:
        'AI-сервіс тимчасово обмежив запити або вичерпано API-квоту. Перевірте ліміти OpenAI та спробуйте пізніше.',
      code: 'AI_RATE_LIMIT',
      status: 429,
    };
  return {
    message:
      'Не вдалося завершити запит. Перевірте підключення та спробуйте ще раз.',
    code: 'UPSTREAM_ERROR',
    status: 502,
  };
}
