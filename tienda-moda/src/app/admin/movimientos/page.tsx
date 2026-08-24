import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import Pagination from "../../pagination";

export default async function MovementsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/login");
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const pageSize = 20;
  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({ include: { variant: { include: { product: { select: { name: true } } } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.stockMovement.count(),
  ]);
  return <main className="min-h-screen bg-[var(--paper)]"><header className="border-b border-[var(--line)] px-5 py-6 lg:px-10"><div className="mx-auto flex max-w-[1100px] items-center justify-between"><Link href="/admin" className="display-font text-4xl">NOVA<span className="text-[var(--coral)]">.</span></Link><Link href="/admin" className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--coral)]">Volver al panel</Link></div></header><div className="mx-auto max-w-[1100px] px-5 py-12 lg:px-10"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">Auditoría</p><h1 className="display-font mt-2 text-7xl">Movimientos.</h1><div className="mt-10 space-y-2">{movements.map((movement) => <div key={movement.id} className="flex flex-col justify-between gap-2 border-b border-[var(--line)] py-4 text-sm sm:flex-row"><span className="font-bold">{movement.variant.product.name} / talle {movement.variant.size}</span><span className={movement.type === "PURCHASE" ? "text-green-700" : "text-[var(--coral)]"}>{movement.type === "PURCHASE" ? "+" : "-"}{movement.quantity} · {movement.type}</span><span className="text-xs text-[var(--muted)]">{movement.note ?? "Sin nota"} · {movement.createdAt.toLocaleDateString("es-AR")}</span></div>)}</div><Pagination page={page} pageSize={pageSize} total={total} basePath="/admin/movimientos" /></div></main>;
}
