import { Metadata } from "next";
import Link from "next/link";
import { CatalogFilters } from "./CatalogFilters";
import { fetcher } from "@/lib/api";

export const metadata: Metadata = {
  title: "Каталог - Гүлдер",
};

async function getProducts(searchParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  if (searchParams.page) params.set("page", searchParams.page);
  if (searchParams.limit) params.set("limit", searchParams.limit);
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.tag) params.set("tag", searchParams.tag);
  if (searchParams.minPrice) params.set("minPrice", searchParams.minPrice);
  if (searchParams.maxPrice) params.set("maxPrice", searchParams.maxPrice);
  if (searchParams.sort) params.set("sort", searchParams.sort);
  if (searchParams.search) params.set("search", searchParams.search);
  if (searchParams.color) params.set("color", searchParams.color);

  try {
    return await fetcher.get<{
      data: { id: string; nameKz: string; price: number; priceFrom?: number; imageUrl?: string; slug: string }[];
      total: number;
      page: number;
      limit: number;
    }>(`/api/products?${params}`);
  } catch {
    return { data: [], total: 0, page: 1, limit: 12 };
  }
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { data, total, page, limit } = await getProducts(params);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Каталог</h1>
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full lg:w-64">
          <CatalogFilters searchParams={params} />
        </aside>
        <div className="flex-1">
          <div className="mb-4 text-slate-600">
            Табылды: {total} өнім
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {data.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
              >
                <div className="aspect-square overflow-hidden bg-slate-100">
                  {p.imageUrl && (
<img
                    src={p.imageUrl}
                    alt={p.nameKz}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  )}
                </div>
<div className="p-4">
                <div className="font-medium text-slate-900 group-hover:text-emerald-700 line-clamp-2">{p.nameKz}</div>
                <div className="mt-1 font-semibold text-emerald-600">
                    {p.price.toLocaleString("kk-KZ")} ₸
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex gap-2">
              {page > 1 && (
                <Link
                  href={`/catalog?${new URLSearchParams({
                    ...params,
                    page: String(page - 1),
                  })}`}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium hover:bg-slate-50"
                >
                  Алдыңғы
                </Link>
              )}
              <span className="flex items-center px-4">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/catalog?${new URLSearchParams({
                    ...params,
                    page: String(page + 1),
                  })}`}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium hover:bg-slate-50"
                >
                  Келесі
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
