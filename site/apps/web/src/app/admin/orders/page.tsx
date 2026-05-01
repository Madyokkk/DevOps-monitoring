"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { fetcher } from "@/lib/api";
import { Pagination } from "@/components/Pagination";

const STATUS_KZ: Record<string, string> = {
  NEW: "Жаңа",
  PAID: "Төленді",
  PREPARING: "Дайындалып жатыр",
  DELIVERING: "Жолда",
  DELIVERED: "Жеткізілді",
  CANCELLED: "Болдырылмады",
};

type Order = {
  id: string;
  receiverName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  city: { nameKz: string };
};

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [data, setData] = useState<{
    data: Order[];
    total: number;
    page: number;
    limit: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "25");
    if (statusFilter) params.set("status", statusFilter);
    fetcher
      .get<NonNullable<typeof data>>(`/api/admin/orders?${params}`, token ?? undefined)
      .then(setData)
      .catch((e) => setError((e as Error).message));
  }, [token, page, statusFilter]);

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        <p className="font-medium">Қате: {error}</p>
        <p className="mt-1 text-sm">Кіруді тексеріңіз: admin@example.kz / Admin123!</p>
      </div>
    );
  }
  if (!data) return <div className="text-gray-600">Жүктелуде...</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Тапсырыстар</h1>
      <div className="mb-4 flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="">Барлық статустар</option>
          {Object.entries(STATUS_KZ).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">№</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Алушы</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Қала</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Сома</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Статус</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Күні</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.data.map((o) => (
              <tr key={o.id} className="bg-white hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    #{o.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{o.receiverName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{o.city.nameKz}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {o.totalAmount.toLocaleString("kk-KZ")} ₸
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800">
                    {STATUS_KZ[o.status] ?? o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(o.createdAt).toLocaleString("kk-KZ")}
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
