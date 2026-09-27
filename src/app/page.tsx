'use client';

import { useEffect, useState } from 'react';

import { Footer } from '@/components/home/Footer';
import { Header } from '@/components/home/Header';
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Planner } from '@/components/home/Planner';
import { RecipeResult } from '@/components/home/RecipeResult';
import type { PlanResult } from '@/types';

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(true);
  const [request, setRequest] = useState('');
  const [servings, setServings] = useState('4');
  const [budget, setBudget] = useState('600');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<PlanResult | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);

  async function checkConnection() {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      setConnected(data.connected === true);
    } catch {
      setError('Не вдалося перевірити підключення. Спробуйте ще раз.');
    } finally {
      setChecking(false);
    }
  }
  useEffect(() => {
    async function initializeConnection() {
      await checkConnection();
      if (new URLSearchParams(window.location.search).has('authError'))
        setError('Вхід у Сільпо не завершено. Спробуйте підключитися ще раз.');
    }
    void initializeConnection();
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setResult(null);
    setBusy(true);
    try {
      const response = await fetch('/api/recipe-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request,
          servings: Number(servings),
          budgetUah: Number(budget),
        }),
        signal: AbortSignal.timeout(185000),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.code === 'AUTH_REQUIRED') setConnected(false);
        throw new Error(data.message || 'Не вдалося скласти план.');
      }
      setResult(data);
      setTimeout(
        () =>
          document
            .getElementById('result')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        50,
      );
    } catch (e) {
      setError(
        e instanceof Error && e.name === 'TimeoutError'
          ? 'Пошук тривав надто довго. Спробуйте ще раз.'
          : e instanceof Error
            ? e.message
            : 'Сталася помилка. Спробуйте ще раз.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header connected={connected} />
      <main>
        <Hero
          photoFailed={photoFailed}
          onPhotoError={() => setPhotoFailed(true)}
        />
        <HowItWorks />
        <Planner
          busy={busy}
          error={error}
          budget={budget}
          request={request}
          checking={checking}
          servings={servings}
          connected={connected}
          onSubmit={submit}
          onBudgetChange={setBudget}
          onRequestChange={setRequest}
          onServingsChange={setServings}
          onCheckConnection={() => {
            setChecking(true);
            void checkConnection();
          }}
        />
        <RecipeResult result={result} />
      </main>
      <Footer />
    </>
  );
}
