import Link from "next/link";
import { fetcher } from "@/lib/api";

export const dynamic = "force-dynamic";

async function getFeatured() {
  try {
    return await fetcher.get<{ id: string; nameKz: string; price: number; imageUrl?: string; slug: string }[]>(
      "/api/products/featured"
    );
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    return await fetcher.get<{ id: string; nameKz: string; slug: string }[]>(
      "/api/categories"
    );
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getFeatured(),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="mb-20 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Гүлдерді онлайн тапсырыс беру
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-600">
          Қазақстан бойынша жылдың кез келген мезгілінде сүйіктілеріңізге гүл жіберіңіз
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 hover:shadow-emerald-600/30"
        >
          Каталогты қарау
        </Link>
      </section>

      <section className="mb-20">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Категориялар</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/catalog?category=${c.slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
            >
              <span className="font-medium text-slate-800 group-hover:text-emerald-700">
                {c.nameKz}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Хит өнімдер</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {featured.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
            >
              <div className="aspect-square overflow-hidden bg-slate-100">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.nameKz}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">Гүл</div>
                )}
              </div>
              <div className="p-4">
                <div className="font-medium text-slate-900 group-hover:text-emerald-700 line-clamp-2">{p.nameKz}</div>
                <div className="mt-1 text-lg font-semibold text-emerald-600">
                  {p.price.toLocaleString("kk-KZ")} ₸
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Қалай тапсырыс беремін?</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <li className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">1</span>
            <div>
              <span className="font-medium text-slate-800">Таңдаңыз</span>
              <p className="text-sm text-slate-600">Каталогтан гүлдерді себетке қосыңыз</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">2</span>
            <div>
              <span className="font-medium text-slate-800">Толтырыңыз</span>
              <p className="text-sm text-slate-600">Тапсырыс мәліметін енгізіңіз</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">3</span>
            <div>
              <span className="font-medium text-slate-800">Мекенжай</span>
              <p className="text-sm text-slate-600">Жеткізу уақытын көрсетіңіз</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">4</span>
            <div>
              <span className="font-medium text-slate-800">Растаңыз</span>
              <p className="text-sm text-slate-600">Төлем әдісін таңдап тапсырыс беріңіз</p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
}
