"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { fetcher } from "@/lib/api";

type Order = {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  city: { nameKz: string };
};

const STATUS_KZ: Record<string, string> = {
  NEW: "Жаңа",
  PAID: "Төленді",
  PREPARING: "Дайындалып жатыр",
  DELIVERING: "Жолда",
  DELIVERED: "Жеткізілді",
  CANCELLED: "Болдырылмады",
};

export default function AccountPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [orders, setOrders] = useState<{ data: Order[] } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (token) {
      fetcher
        .get<{ data: Order[] }>("/api/users/orders", token)
        .then(setOrders)
        .catch(() => {});
    }
  }, [user, token, router]);

  if (isLoading || !user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Менің аккаунтым</h1>
      <div className="mb-8 rounded-lg border bg-white p-4">
        <p className="font-medium">{user.fullName}</p>
        <p className="text-gray-600">{user.email}</p>
        {user.phone && (
          <p className="text-gray-600">{user.phone}</p>
        )}
      </div>
      <h2 className="mb-4 text-xl font-bold">Тапсырыс тарихы</h2>
      {orders?.data?.length ? (
        <div className="space-y-4">
          {orders.data.map((o) => (
            <Link
              key={o.id}
              href={`/order/${o.id}`}
              className="block rounded-lg border bg-white p-4 transition hover:bg-gray-50"
            >
              <div className="flex justify-between">
                <span className="font-mono text-sm">#{o.id.slice(0, 8)}</span>
                <span>{STATUS_KZ[o.status] ?? o.status}</span>
              </div>
              <div className="mt-2 flex justify-between text-gray-600">
                <span>{o.city.nameKz}</span>
                <span>
                  {o.totalAmount.toLocaleString("kk-KZ")} ₸
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-400">
                {new Date(o.createdAt).toLocaleString("kk-KZ")}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">Тапсырыстар жоқ</p>
      )}
    </div>
  );
}
