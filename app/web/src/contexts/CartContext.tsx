'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type CartItem = {
  productId: string;
  productVariantId?: string;
  slug?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'gulder_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) setItems(JSON.parse(s));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const cartKey = (i: CartItem) => i.productVariantId ?? i.productId;

  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const q = item.quantity ?? 1;
    const key = item.productVariantId ?? item.productId;
    setItems((prev) => {
      const idx = prev.findIndex((i) => cartKey(i) === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].quantity += q;
        return next;
      }
      return [...prev, { ...item, quantity: q }];
    });
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => cartKey(i) !== key));
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(key);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (cartKey(i) === key ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
