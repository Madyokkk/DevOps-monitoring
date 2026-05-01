"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { fetcher } from "@/lib/api";
import Link from "next/link";

const schema = z.object({
  receiverName: z.string().min(2, "Аты-жөні кемінде 2 таңба"),
  receiverPhone: z
    .string()
    .regex(/^\+7\s?7\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/, "Телефон: +7 7XX XXX XX XX"),
  cityId: z.string().min(1, "Қаланы таңдаңыз"),
  address: z.string().min(5, "Мекенжай кемінде 5 таңба"),
  deliveryTime: z.string().min(1, "Жеткізу уақытын таңдаңыз"),
  cardMessage: z.string().optional(),
  paymentMethod: z.enum(["CASH", "CARD_DEMO"]),
  promoCode: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type City = { id: string; nameKz: string; deliveryFee: number };

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { token } = useAuth();
  const [cities, setCities] = useState<City[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentMethod: "CASH",
      deliveryTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    },
  });

  const cityId = watch("cityId");

  useEffect(() => {
    fetcher.get<City[]>("/api/delivery/cities").then(setCities).catch(() => {});
  }, []);

  useEffect(() => {
    const city = cities.find((c) => c.id === cityId);
    setDeliveryFee(city?.deliveryFee ?? 0);
  }, [cityId, cities]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">Себет бос</h1>
        <Link href="/catalog" className="text-emerald-600 hover:underline">
          Каталогқа өту
        </Link>
      </div>
    );
  }

  const totalAmount = total + deliveryFee;

  const onSubmit = async (data: FormData) => {
    setError("");
    setSubmitting(true);
    try {
      const orderItems = items.map((i) => ({
        productId: i.productId,
        productVariantId: i.productVariantId,
        quantity: i.quantity,
      }));
      const order = await fetcher.post<{ id: string }>(
        "/api/orders",
        {
          ...data,
          deliveryTime: new Date(data.deliveryTime).toISOString(),
          items: orderItems,
        },
        token ?? undefined
      );
      clearCart();
      router.push(`/order-success?id=${order.id}`);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Тапсырыс беру</h1>
      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block font-medium">Алушы аты *</label>
          <input
            {...register("receiverName")}
            className="w-full rounded border px-3 py-2"
            placeholder="Айбек Қасымов"
          />
          {errors.receiverName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.receiverName.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block font-medium">Телефон *</label>
          <input
            {...register("receiverPhone")}
            className="w-full rounded border px-3 py-2"
            placeholder="+7 701 123 45 67"
          />
          {errors.receiverPhone && (
            <p className="mt-1 text-sm text-red-600">
              {errors.receiverPhone.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block font-medium">Қала *</label>
          <select
            {...register("cityId")}
            className="w-full rounded border px-3 py-2"
          >
            <option value="">Таңдаңыз</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameKz} (жеткізу: {c.deliveryFee.toLocaleString("kk-KZ")} ₸)
              </option>
            ))}
          </select>
          {errors.cityId && (
            <p className="mt-1 text-sm text-red-600">{errors.cityId.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block font-medium">Мекенжай *</label>
          <input
            {...register("address")}
            className="w-full rounded border px-3 py-2"
            placeholder="Абай даңғылы, 50, 12 пәтер"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">
              {errors.address.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block font-medium">Жеткізу уақыты *</label>
          <input
            type="datetime-local"
            {...register("deliveryTime")}
            className="w-full rounded border px-3 py-2"
          />
          {errors.deliveryTime && (
            <p className="mt-1 text-sm text-red-600">
              {errors.deliveryTime.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block font-medium">Ашықхат мәтіні</label>
          <textarea
            {...register("cardMessage")}
            className="w-full rounded border px-3 py-2"
            rows={3}
            placeholder="Сәлем! Сенімен болғаныма қуаныштымын!"
          />
        </div>
        <div>
          <label className="mb-1 block font-medium">Төлем әдісі *</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                {...register("paymentMethod")}
                value="CASH"
              />
              Қолма-қол
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                {...register("paymentMethod")}
                value="CARD_DEMO"
              />
              Картамен (демо)
            </label>
          </div>
        </div>
        <div>
          <label className="mb-1 block font-medium">Промокод</label>
          <input
            {...register("promoCode")}
            className="w-full rounded border px-3 py-2"
            placeholder="SUMMER10"
          />
        </div>

        <div className="rounded-lg border bg-gray-50 p-4">
          <div className="flex justify-between">
            <span>Тауарлар:</span>
            <span>{total.toLocaleString("kk-KZ")} ₸</span>
          </div>
          <div className="flex justify-between">
            <span>Жеткізу:</span>
            <span>{deliveryFee.toLocaleString("kk-KZ")} ₸</span>
          </div>
          <div className="mt-2 flex justify-between text-lg font-bold">
            <span>Барлығы:</span>
            <span>{totalAmount.toLocaleString("kk-KZ")} ₸</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? "Жіберілуде..." : "Тапсырысты растау"}
        </button>
      </form>
    </div>
  );
}
