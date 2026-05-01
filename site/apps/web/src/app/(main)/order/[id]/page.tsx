"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { fetcher } from "@/lib/api";

const STATUS_KZ: Record<string, string> = {
  NEW: "Жаңа",
  PAID: "Төленді",
  PREPARING: "Дайындалып жатыр",
  DELIVERING: "Жолда",
  DELIVERED: "Жеткізілді",
  CANCELLED: "Болдырылмады",
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { token } = useAuth();
  const [order, setOrder] = useState<{
    id: string;
    receiverName: string;
    receiverPhone: string;
    address: string;
    deliveryTime: string;
    totalAmount: number;
    status: string;
    city: { nameKz: string };
    items: { product: { nameKz: string }; quantity: number; price: number }[];
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetcher
      .get<NonNullable<typeof order>>(`/api/orders/${id}`, token ?? undefined)
      .then(setOrder)
      .catch(() => setError("Тапсырыс табылмады"));
  }, [id, token]);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="mb-4 text-red-600">{error}</p>
        <Link href="/account" className="text-emerald-600">
          Аккаунтқа оралу
        </Link>
      </div>
    );
  }

  if (!order) return <div className="p-8 text-center">Жүктелуде...</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">
        Тапсырыс #{order.id.slice(0, 8)}
      </h1>
      <div className="mb-4 rounded-lg border bg-white p-4">
        <p className="font-medium">{order.receiverName}</p>
        <p>{order.receiverPhone}</p>
        <p className="text-gray-600">
          {order.city.nameKz}, {order.address}
        </p>
        <p className="text-gray-600">
          Жеткізу: {new Date(order.deliveryTime).toLocaleString("kk-KZ")}
        </p>
        <p className="mt-2 font-medium">
          Статус: {STATUS_KZ[order.status] ?? order.status}
        </p>
      </div>
      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-2 font-bold">Тауарлар</h2>
        {order.items.map((i) => (
          <div key={i.product.nameKz} className="flex justify-between">
            <span>
              {i.product.nameKz} x{i.quantity}
            </span>
            <span>
              {(i.price * i.quantity).toLocaleString("kk-KZ")} ₸
            </span>
          </div>
        ))}
        <div className="mt-2 border-t pt-2 font-bold">
          Барлығы: {order.totalAmount.toLocaleString("kk-KZ")} ₸
        </div>
      </div>
      <Link
        href="/account"
        className="mt-4 inline-block text-emerald-600 hover:underline"
      >
        ← Аккаунтқа оралу
      </Link>
    </div>
  );
}
