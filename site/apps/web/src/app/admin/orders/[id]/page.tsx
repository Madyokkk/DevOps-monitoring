"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
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

export default function AdminOrderDetailPage() {
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
    adminComment?: string;
    city: { nameKz: string };
    items: { product: { nameKz: string }; quantity: number; price: number }[];
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm<{
    status: string;
    adminComment?: string;
  }>();

  useEffect(() => {
    fetcher
      .get(`/api/admin/orders/${id}`, token ?? undefined)
      .then((o: unknown) => {
        const ord = o as NonNullable<typeof order>;
        setOrder(ord);
        setValue("status", ord.status);
        setValue("adminComment", ord.adminComment ?? "");
      })
      .catch(() => {});
  }, [id, token, setValue]);

  const onSubmit = async (data: { status: string; adminComment?: string }) => {
    setSaving(true);
    try {
      await fetcher.patch(
        `/api/admin/orders/${id}/status`,
        data,
        token ?? undefined
      );
      setOrder((prev) => (prev ? { ...prev, ...data } : null));
    } finally {
      setSaving(false);
    }
  };

  if (!order) return <div>Жүктелуде...</div>;

  return (
    <div>
      <Link href="/admin/orders" className="mb-4 inline-block text-emerald-600 hover:underline">
        ← Тапсырыстар
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Тапсырыс #{order.id.slice(0, 8)}</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-2 font-bold">Мәліметтер</h2>
          <p>{order.receiverName}</p>
          <p>{order.receiverPhone}</p>
          <p>{order.city.nameKz}, {order.address}</p>
          <p>Жеткізу: {new Date(order.deliveryTime).toLocaleString("kk-KZ")}</p>
          <p className="mt-2 font-bold">
            {order.totalAmount.toLocaleString("kk-KZ")} ₸
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-2 font-bold">Статус өзгерту</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block">Статус</label>
              <select {...register("status")} className="w-full rounded border px-3 py-2">
                {Object.entries(STATUS_KZ).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block">Админ комментарийі</label>
              <textarea
                {...register("adminComment")}
                className="w-full rounded border px-3 py-2"
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Сақталуда..." : "Сақтау"}
            </button>
          </form>
        </div>
      </div>
      <div className="mt-6 rounded-lg border bg-white p-4">
        <h2 className="mb-2 font-bold">Тауарлар</h2>
        {order.items.map((i) => (
          <div key={i.product.nameKz} className="flex justify-between">
            <span>{i.product.nameKz} x{i.quantity}</span>
            <span>{(i.price * i.quantity).toLocaleString("kk-KZ")} ₸</span>
          </div>
        ))}
      </div>
    </div>
  );
}
