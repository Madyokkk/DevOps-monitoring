"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetcher } from "@/lib/api";

type Category = { id: string; nameKz: string; slug: string };
type Tag = { id: string; nameKz: string; slug: string };
type Color = { id: string; nameKz: string; slug: string };

export function CatalogFilters({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [colors, setColors] = useState<Color[]>([]);

  useEffect(() => {
    fetcher.get<Category[]>("/api/categories").then(setCategories).catch(() => {});
    fetcher.get<Tag[]>("/api/tags").then(setTags).catch(() => {});
    fetcher.get<Color[]>("/api/colors").then(setColors).catch(() => {});
  }, []);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`/catalog?${next}`);
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Категория</label>
        <select
          value={searchParams.category ?? ""}
          onChange={(e) => update("category", e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        >
          <option value="">Барлығы</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.nameKz}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Түс</label>
        <select
          value={searchParams.color ?? ""}
          onChange={(e) => update("color", e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        >
          <option value="">Барлығы</option>
          {colors.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.nameKz}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Тег</label>
        <select
          value={searchParams.tag ?? ""}
          onChange={(e) => update("tag", e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        >
          <option value="">Барлығы</option>
          {tags.map((t) => (
            <option key={t.id} value={t.slug}>
              {t.nameKz}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Сұрыптау</label>
        <select
          value={searchParams.sort ?? "price_asc"}
          onChange={(e) => update("sort", e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        >
          <option value="price_asc">Бағасы: өсу</option>
          <option value="price_desc">Бағасы: кему</option>
          <option value="name">Аты бойынша</option>
        </select>
      </div>
    </div>
  );
}
