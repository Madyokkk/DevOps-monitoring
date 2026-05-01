"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetcher } from "@/lib/api";
import { Pagination } from "@/components/Pagination";

type Product = {
  id: string;
  nameKz: string;
  isActive: boolean;
  category: { nameKz: string };
  variants: { price: number; stock: number }[];
};

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<{
    data: Product[];
    total: number;
    page: number;
    limit: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "25");
    if (search) params.set("search", search);
    fetcher
      .get<NonNullable<typeof data>>(`/api/admin/products?${params}`, token ?? undefined)
      .then(setData)
      .catch((e) => setError((e as Error).message));
  }, [token, page, search]);

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        <p className="font-medium">Қате: {error}</p>
      </div>
    );
  }
  if (!data) return <div className="text-gray-600">Жүктелуде...</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Өнімдер</h1>
      <div className="mb-4 flex gap-4">
        <input
          type="search"
          placeholder="Іздеу..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Аты</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Категория</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Баға</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Қойма</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.data.map((p) => (
              <tr key={p.id} className="bg-white hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{p.nameKz}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.category.nameKz}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {p.variants?.length
                    ? `${Math.min(...p.variants.map((v) => v.price)).toLocaleString("kk-KZ")} - ${Math.max(...p.variants.map((v) => v.price)).toLocaleString("kk-KZ")} ₸`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {p.variants?.reduce((s, v) => s + v.stock, 0) ?? 0}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${p.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700"}`}>
                    {p.isActive ? "Белсенді" : "Өшірілген"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={data.page}
        total={data.total}
        limit={data.limit}
        onPageChange={setPage}
      />
    </div>
  );
}
