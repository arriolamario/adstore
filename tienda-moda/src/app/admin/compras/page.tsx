import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import Pagination from "../../pagination";

const money = (value: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
export default async function PurchasesPage({ searchParams }: { searchParams: Promise<{ page?: string; supplier?: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/login");
  const filters = await searchParams;
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = 20;
  const where = filters.supplier ? { supplier: { contains: filters.supplier, mode: "insensitive" as const } } : undefined;
  const [purchases, total] = await Promise.all([
    prisma.purchase.findMany({ where, include: { items: true, purchasedBy: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.purchase.count({ where }),
  ]);
  return <main className="min-h-screen bg-[var(--paper)]"><header className="border-b border-[var(--line)] px-5 py-6 lg:px-10"><div className="mx-auto flex max-w-[1100px] items-center justify-between"><Link href="/admin" className="display-font text-4xl">NOVA<span className="text-[var(--coral)]">.</span></Link><Link href="/admin" className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--coral)]">Volver al panel</Link></div></header><div className="mx-auto max-w-[1100px] px-5 py-12 lg:px-10"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">Abastecimiento</p><h1 className="display-font mt-2 text-7xl">Compras.</h1><div className="mt-10 space-y-3">{purchases.map((purchase) => <article key={purchase.id} className="flex flex-col justify-between gap-3 border-b border-[var(--line)] py-4 sm:flex-row sm:items-center"><div><p className="font-bold">#{purchase.id.slice(-8)} · {purchase.supplier ?? "Sin proveedor"}</p><p className="text-xs text-[var(--muted)]">{purchase.items.map((item) => `${item.productName} x${item.quantity}`).join(" · ")} · {purchase.purchasedBy.name ?? purchase.purchasedBy.email}</p></div><strong>{purchase.total ? money(purchase.total) : "Costo no informado"}</strong></article>)}</div><Pagination page={page} pageSize={pageSize} total={total} basePath="/admin/compras" /></div></main>;
}
