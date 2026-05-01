"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="mb-4 text-2xl font-bold text-slate-900">Себет бос</h1>
        <p className="mb-6 text-slate-600">Каталогтан гүлдерді таңдап себетке қосыңыз</p>
        <Link
          href="/catalog"
          className="inline-flex rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
        >
          Каталогқа өту
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Себет</h1>
      <div className="space-y-4">
        {items.map((item) => {
          const key = item.productVariantId ?? item.productId;
          return (
          <div
            key={key}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded bg-gray-100">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="flex-1">
              <Link
                href={item.slug ? `/product/${item.slug}` : "/catalog"}
                className="font-medium hover:underline"
              >
                {item.name}
              </Link>
              <div className="text-emerald-600">
                {item.price.toLocaleString("kk-KZ")} ₸
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(key, item.quantity - 1)}
                className="h-9 w-9 rounded-lg border border-slate-300 font-medium hover:bg-slate-50"
              >
                −
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(key, item.quantity + 1)}
                className="h-9 w-9 rounded-lg border border-slate-300 font-medium hover:bg-slate-50"
              >
                +
              </button>
            </div>
            <div className="font-medium">
              {(item.price * item.quantity).toLocaleString("kk-KZ")} ₸
            </div>
            <button
              onClick={() => removeItem(key)}
              className="text-red-600 hover:underline"
            >
              Жою
            </button>
          </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <span className="text-lg font-bold text-slate-900">Барлығы:</span>
        <span className="text-xl font-bold text-emerald-600">
          {total.toLocaleString("kk-KZ")} ₸
        </span>
      </div>
      <div className="mt-4 flex justify-end">
        <Link
          href="/checkout"
          className="rounded-xl bg-emerald-600 px-8 py-3 font-medium text-white hover:bg-emerald-700"
        >
          Тапсырыс беру
        </Link>
      </div>
    </div>
  );
}
