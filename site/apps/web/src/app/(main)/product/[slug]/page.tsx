import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetcher } from "@/lib/api";
import { AddToCartButton } from "./AddToCartButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const p = await fetcher.get<{ nameKz: string }>(`/api/products/${slug}`);
    return { title: p.nameKz };
  } catch {
    return {};
  }
}

type Variant = {
  id: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  sizeKz?: string | null;
  color?: { nameKz: string; slug: string; hex?: string | null } | null;
};

async function getProduct(slug: string) {
  try {
    return await fetcher.get<{
      id: string;
      nameKz: string;
      description?: string | null;
      compositionKz?: string | null;
      priceFrom?: number;
      imageUrl?: string | null;
      inStock: boolean;
      slug: string;
      category: { nameKz: string; slug: string };
      tags: { tag: { nameKz: string } }[];
      variants: Variant[];
    }>(`/api/products/${slug}`);
  } catch {
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full md:w-1/2">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.nameKz}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                Сурет жоқ
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <Link
            href={`/catalog?category=${product.category.slug}`}
            className="text-sm text-emerald-600"
          >
            {product.category.nameKz}
          </Link>
          <h1 className="mt-2 text-3xl font-bold">{product.nameKz}</h1>
          <div className="mt-4 text-2xl font-bold text-emerald-600">
            {product.variants?.length > 1
              ? `${(product.priceFrom ?? 0).toLocaleString("kk-KZ")} - ${Math.max(...product.variants.map((v) => v.price)).toLocaleString("kk-KZ")} ₸`
              : `${(product.priceFrom ?? product.variants?.[0]?.price ?? 0).toLocaleString("kk-KZ")} ₸`}
          </div>
          {product.compositionKz && (
            <p className="mt-2 text-sm text-slate-500">{product.compositionKz}</p>
          )}
          {product.description && (
            <p className="mt-4 text-gray-600">{product.description}</p>
          )}
          {product.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <span
                  key={t.tag.nameKz}
                  className="rounded bg-gray-200 px-2 py-1 text-sm"
                >
                  {t.tag.nameKz}
                </span>
              ))}
            </div>
          )}
          <div className="mt-6">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
