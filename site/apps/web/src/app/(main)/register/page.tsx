"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";

const schema = z.object({
  email: z.string().email("Электрондық пошта қате"),
  password: z.string().min(8, "Құпия сөз кемінде 8 таңба"),
  fullName: z.string().min(2, "Аты-жөні кемінде 2 таңба"),
  phone: z
    .string()
    .regex(/^\+7\s?7\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$|^$/, "Телефон: +7 7XX XXX XX XX")
    .optional()
    .or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone || undefined,
      });
      router.push("/account");
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Тіркелу</h1>
      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block font-medium">Аты-жөні</label>
          <input
            {...register("fullName")}
            className="w-full rounded border px-3 py-2"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.fullName.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block font-medium">Электрондық пошта</label>
          <input
            type="email"
            {...register("email")}
            className="w-full rounded border px-3 py-2"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block font-medium">Телефон</label>
          <input
            {...register("phone")}
            className="w-full rounded border px-3 py-2"
            placeholder="+7 701 123 45 67"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block font-medium">Құпия сөз</label>
          <input
            type="password"
            {...register("password")}
            className="w-full rounded border px-3 py-2"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-600 py-2 text-white hover:bg-emerald-700"
        >
          Тіркелу
        </button>
      </form>
      <p className="mt-4 text-center text-gray-600">
        Аккаунтыңыз бар ма?{" "}
        <Link href="/login" className="text-emerald-600 hover:underline">
          Кіру
        </Link>
      </p>
    </div>
  );
}
