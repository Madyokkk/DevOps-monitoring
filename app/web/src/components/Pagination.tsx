"use client";

type PaginationProps = {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, total, limit, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-gray-600">
        {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} / {total}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          ← Алдыңғы
        </button>
        <span className="flex items-center px-3 text-sm">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          Келесі →
        </button>
      </div>
    </div>
  );
}
