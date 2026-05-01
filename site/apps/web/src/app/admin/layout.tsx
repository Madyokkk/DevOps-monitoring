"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const ADMIN_ROUTES = [
  { href: "/admin", label: "Тақта" },
  { href: "/admin/products", label: "Өнімдер" },
  { href: "/admin/orders", label: "Тапсырыстар" },
  { href: "/admin/users", label: "Қолданушылар" },
  { href: "/admin/analytics", label: "Аналитика" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoading) return;
    if (!isLoginPage && !isAdmin) {
      router.push("/admin/login");
    }
  }, [isLoading, isAdmin, isLoginPage, router]);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-600">Жүктелуде...</div>;
  if (!isLoginPage && !isAdmin) return null;

  if (isLoginPage) return children;

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <Link href="/admin" className="text-lg font-bold text-emerald-600 hover:text-emerald-700">
            Админ
          </Link>
        </div>
        <nav className="space-y-0.5 p-3">
          {ADMIN_ROUTES.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname === r.href
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {r.label}
            </Link>
          ))}
          <Link
            href="/"
            className="mt-2 block rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100"
          >
            Сайтқа →
          </Link>
        </nav>
      </aside>
      <main className="ml-56 min-h-screen bg-gray-50 p-6">{children}</main>
    </div>
  );
}
