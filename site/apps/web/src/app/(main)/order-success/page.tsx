import Link from "next/link";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mb-6 text-6xl">✅</div>
      <h1 className="mb-4 text-2xl font-bold">Тапсырыс қабылданды!</h1>
      <p className="mb-6 text-gray-600">
        Сіздің тапсырысыңыз сәтті жасалды. Жеткізу бойынша хабарласамыз.
      </p>
      {id && (
        <p className="mb-6 font-mono text-sm text-gray-500">
          Тапсырыс № {id}
        </p>
      )}
      <Link
        href="/catalog"
        className="inline-block rounded-lg bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700"
      >
        Каталогқа оралу
      </Link>
    </div>
  );
}
