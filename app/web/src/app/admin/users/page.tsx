"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetcher } from "@/lib/api";
import { Pagination } from "@/components/Pagination";

type User = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: { orders: number };
};

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [data, setData] = useState<{
    data: User[];
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
      .get<NonNullable<typeof data>>(`/api/admin/users?${params}`, token ?? undefined)
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

  const ROLE_KZ: Record<string, string> = {
    USER: "Қолданушы",
    MANAGER: "Менеджер",
    ADMIN: "Админ",
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Қолданушылар</h1>
      <div className="mb-4 flex gap-4">
        <input
          type="search"
          placeholder="Іздеу (email, аты)..."
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
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Рөл</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Тапсырыс</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.data.map((u) => (
              <tr key={u.id} className="bg-white hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{u.fullName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-sm">{ROLE_KZ[u.role] ?? u.role}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{u._count.orders}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${u.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700"}`}>
                    {u.isActive ? "Белсенді" : "Блок"}
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
