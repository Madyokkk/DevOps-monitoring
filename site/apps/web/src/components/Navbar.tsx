"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-emerald-600 hover:text-emerald-700">
          Гүлдер Онлайн
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/catalog" className="text-slate-600 hover:text-slate-900 font-medium">
            Каталог
          </Link>
          <Link href="/assistant" className="text-slate-600 hover:text-slate-900 font-medium">
            AI көмекші
          </Link>
          <Link href="/cart" className="relative text-slate-600 hover:text-slate-900 font-medium">
            Себет
            {count > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-xs font-medium text-white">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              {(user.role === "ADMIN" || user.role === "MANAGER") && (
                <Link
                  href="/admin"
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  Админ
                </Link>
              )}
              <Link
                href="/account"
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                {user.fullName}
              </Link>
              <button
                onClick={logout}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Шығу
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium">
                Кіру
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
              >
                Тіркелу
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
