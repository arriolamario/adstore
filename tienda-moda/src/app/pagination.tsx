import Link from "next/link";

type Props = { page: number; pageSize: number; total: number; basePath: string };

export default function Pagination({ page, pageSize, total, basePath }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  const href = (nextPage: number) => `${basePath}${basePath.includes("?") ? "&" : "?"}page=${nextPage}`;
  return <nav aria-label="Paginación" className="mt-8 flex items-center justify-between border-t border-[var(--line)] pt-4 text-xs font-bold uppercase tracking-[0.1em]"><span className="text-[var(--muted)]">Página {page} de {totalPages}</span><div className="flex gap-3">{page > 1 ? <Link href={href(page - 1)} className="border border-[var(--ink)] px-3 py-2">Anterior</Link> : <span className="border border-[var(--line)] px-3 py-2 text-[var(--muted)]">Anterior</span>}{page < totalPages ? <Link href={href(page + 1)} className="bg-[var(--ink)] px-3 py-2 text-[var(--paper)]">Siguiente</Link> : <span className="border border-[var(--line)] px-3 py-2 text-[var(--muted)]">Siguiente</span>}</div></nav>;
}
