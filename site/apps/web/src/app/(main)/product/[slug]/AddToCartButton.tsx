"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

type Variant = {
  id: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  sizeKz?: string | null;
  color?: { nameKz: string; slug: string; hex?: string | null } | null;
};

type Product = {
  id: string;
  slug: string;
  nameKz: string;
  imageUrl?: string | null;
  variants: Variant[];
};

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants?.[0] ?? null
  );

  const v = selectedVariant ?? product.variants?.[0];
  const disabled = !v || v.stock < 1;

  const handleAdd = () => {
    if (!v) return;
    addItem({
      productId: product.id,
      productVariantId: v.id,
      slug: product.slug,
      name: product.nameKz,
      price: v.price,
      imageUrl: (v.imageUrl ?? product.imageUrl) ?? undefined,
    });
  };

  if (!product.variants?.length) return null;

  return (
    <div className="space-y-4">
      {product.variants.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Вариант таңдаңыз</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              const inStock = variant.stock > 0;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariant(variant)}
                  disabled={!inStock}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : inStock
                        ? "border-slate-300 hover:border-emerald-400"
                        : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                >
                  {variant.color?.nameKz}
                  {variant.sizeKz ? ` · ${variant.sizeKz}` : ""}
                  {variant.sizeKz || variant.color ? " — " : ""}
                  {variant.price.toLocaleString("kk-KZ")} ₸
                  {!inStock && " (жоқ)"}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={handleAdd}
          disabled={disabled}
          className="rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? "Қоймада жоқ" : "Себетке қосу"}
        </button>
        {v && v.stock > 0 && v.stock < 20 && (
          <span className="text-sm text-amber-600">Аз қалды ({v.stock} дана)</span>
        )}
      </div>
    </div>
  );
}
