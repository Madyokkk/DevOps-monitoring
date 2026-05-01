"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetcher } from "@/lib/api";

type Dashboard = {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  newOrdersToday: number;
  ordersByStatus: Record<string, number>;
};

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    fetcher
      .get<Dashboard>("/api/admin/dashboard", token ?? undefined)
      .then(setData)
      .catch(() => {});
  }, [token]);

  if (!data) return <div className="text-gray-600">Жүктелуде...</div>;

  const STATUS_KZ: Record<string, string> = {
    NEW: "Жаңа",
    PAID: "Төленді",
    PREPARING: "Дайындалып жатыр",
    DELIVERING: "Жолда",
    DELIVERED: "Жеткізілді",
    CANCELLED: "Болдырылмады",
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Басқару тақтасы</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Жалпы тапсырыс</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{data.totalOrders}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Жалпы табыс (₸)</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">
            {data.totalRevenue.toLocaleString("kk-KZ")}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Қолданушылар</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{data.totalUsers}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Бүгін жаңа</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{data.newOrdersToday}</div>
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold text-gray-900">Статус бойынша</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(data.ordersByStatus || {}).map(([status, count]) => (
            <span
              key={status}
              className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800"
            >
              {STATUS_KZ[status] ?? status}: {count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
