"use client";

import { FormEvent, useState } from "react";
import { fetcher } from "@/lib/api";

type AssistantResponse = {
  source: string;
  answer: string;
};

export default function AssistantPage() {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setAnswer(null);

      const res = await fetcher.post<AssistantResponse>("/api/ai/assistant", {
        message: message.trim(),
      });

      setAnswer(res.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Қате орын алды");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold text-slate-900">AI Көмекші</h1>
      <p className="mb-6 text-slate-600">
        Бұл бөлім N8N webhook арқылы OpenAI моделіне сұрау жібереді.
      </p>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">Сұрағыңыз</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="h-32 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
          placeholder="Мысалы: Алматыға бүгін жеткізу қанша тұрады?"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Жіберілуде..." : "Сұрау жіберу"}
        </button>
      </form>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}

      {answer && (
        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <h2 className="mb-2 text-lg font-semibold text-emerald-900">Жауап</h2>
          <p className="whitespace-pre-wrap text-emerald-950">{answer}</p>
        </div>
      )}
    </section>
  );
}
