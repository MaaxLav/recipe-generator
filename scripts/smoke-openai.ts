import { Agent, Runner, tool } from '@openai/agents';
import { z } from 'zod';

// One bounded real SDK request sequence. No secrets or model content are logged.
let called = false;
const agent = new Agent({
  name: 'SDK connectivity check',
  ...(process.env.OPENAI_MODEL ? { model: process.env.OPENAI_MODEL } : {}),
  instructions:
    'Call check_arithmetic with 2 and 3, then return its numeric answer as value.',
  tools: [
    tool({
      name: 'check_arithmetic',
      description: 'Add two numbers in code.',
      parameters: z.object({ a: z.number(), b: z.number() }),
      execute: async ({ a, b }) => {
        called = true;
        return a + b;
      },
    }),
  ],
  outputType: z.object({ value: z.number() }),
});
try {
  if (!process.env.OPENAI_API_KEY) throw new Error('MISSING_KEY');
  const result = await new Runner({ tracingDisabled: true }).run(
    agent,
    'Run the connectivity check.',
    { maxTurns: 3, signal: AbortSignal.timeout(45000) },
  );
  if (!called || result.finalOutput?.value !== 5)
    throw new Error('CHECK_FAILED');
  console.log('PASS: OpenAI Agents SDK tool call and structured output.');
} catch (error) {
  const status = (error as { status?: number }).status;
  console.error(
    `FAIL: OpenAI connectivity check (${status ?? (error instanceof Error ? error.name : 'unknown')}).`,
  );
  process.exitCode = 1;
}
