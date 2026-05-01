"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetcher } from "@/lib/api";

export default function AdminAnalyticsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<{
    orders: { totalOrders: number; totalRevenue: number; avgOrder: number };
    topProducts: { product: { nameKz: string } | null; quantity: number }[];
    byCity: { city: { nameKz: string } | null; count: number; revenue: number }[];
    byStatus: { status: string; _count: number }[];
  } | null>(null);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    fetcher
      .get<NonNullable<typeof data>>(`/api/analytics?period=${period}`, token ?? undefined)
      .then(setData)
      .catch(() => {});
  }, [token, period]);

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
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Аналитика</h1>
      <div className="mb-4">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        >
          <option value="day">Күн</option>
          <option value="week">Апта</option>
          <option value="month">Ай</option>
        </select>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 font-bold">Тапсырыстар</h3>
          <p className="text-2xl">{data.orders.totalOrders}</p>
          <p className="text-gray-600">
            Табыс: {data.orders.totalRevenue.toLocaleString("kk-KZ")} ₸
          </p>
          <p className="text-gray-600">
            Орташа чек: {data.orders.avgOrder.toLocaleString("kk-KZ")} ₸
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-bold">Үздік өнімдер</h3>
          <ul className="space-y-2">
            {data.topProducts.map((tp, i) => (
              <li key={i} className="flex justify-between">
                <span>{tp.product?.nameKz ?? "-"}</span>
                <span>{tp.quantity} дана</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-bold">Қала бойынша</h3>
          <ul className="space-y-2">
            {data.byCity.map((bc, i) => (
              <li key={i} className="flex justify-between">
                <span>{bc.city?.nameKz ?? "-"}</span>
                <span>
                  {bc.count} тапс. / {bc.revenue.toLocaleString("kk-KZ")} ₸
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-bold text-gray-900">Статус бойынша</h3>
        <div className="flex flex-wrap gap-2">
          {data.byStatus.map((s) => (
            <span
              key={s.status}
              className="rounded bg-gray-100 px-3 py-1"
            >
              {STATUS_KZ[s.status] ?? s.status}: {s._count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
