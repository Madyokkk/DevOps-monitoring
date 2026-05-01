import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";

export const metadata: Metadata = {
  title: "Гүлдерді онлайн тапсырыс беру - Қазақстан",
  description: "Қазақстан бойынша гүлдерді онлайн тапсырыс беру қызметі",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kk">
      <body className="min-h-screen bg-slate-50 antialiased">
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
