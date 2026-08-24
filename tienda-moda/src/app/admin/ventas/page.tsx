import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import Pagination from "../../pagination";

const money = (value: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
export default async function SalesPage({ searchParams }: { searchParams: Promise<{ page?: string; payment?: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/login");
  const filters = await searchParams;
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = 20;
  const where = filters.payment ? { paymentMethod: filters.payment as "CASH" | "BANK_TRANSFER" } : undefined;
  const [sales, total] = await Promise.all([
    prisma.posSale.findMany({ where, include: { items: true, soldBy: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.posSale.count({ where }),
  ]);
  return <main className="min-h-screen bg-[var(--paper)]"><header className="border-b border-[var(--line)] px-5 py-6 lg:px-10"><div className="mx-auto flex max-w-[1100px] items-center justify-between"><Link href="/admin" className="display-font text-4xl">NOVA<span className="text-[var(--coral)]">.</span></Link><Link href="/admin" className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--coral)]">Volver al panel</Link></div></header><div className="mx-auto max-w-[1100px] px-5 py-12 lg:px-10"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">Caja</p><h1 className="display-font mt-2 text-7xl">Ventas.</h1><div className="mt-10 space-y-3">{sales.map((sale) => <article key={sale.id} className="flex flex-col justify-between gap-3 border-b border-[var(--line)] py-4 sm:flex-row sm:items-center"><div><p className="font-bold">#{sale.id.slice(-8)} · {sale.soldBy.name ?? sale.soldBy.email}</p><p className="text-xs text-[var(--muted)]">{sale.items.map((item) => `${item.productName} x${item.quantity}`).join(" · ")} · {sale.createdAt.toLocaleDateString("es-AR")}</p></div><div className="flex gap-5 text-xs uppercase"><span>{sale.paymentMethod === "CASH" ? "Efectivo" : "Transferencia"}</span><strong>{money(sale.total)}</strong></div></article>)}</div><Pagination page={page} pageSize={pageSize} total={total} basePath="/admin/ventas" /></div></main>;
}
