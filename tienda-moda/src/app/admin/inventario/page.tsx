import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import Pagination from "../../pagination";

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/login");
  const filters = await searchParams;
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = 20;
  const where = filters.search ? { OR: [{ size: { contains: filters.search, mode: "insensitive" as const } }, { sku: { contains: filters.search, mode: "insensitive" as const } }, { product: { name: { contains: filters.search, mode: "insensitive" as const } } }] } : undefined;
  const [variants, total] = await Promise.all([
    prisma.productVariant.findMany({ where, include: { product: { select: { name: true, category: true, availability: true, leadTimeDays: true } }, }, orderBy: [{ product: { name: "asc" } }, { size: "asc" }], skip: (page - 1) * pageSize, take: pageSize }),
    prisma.productVariant.count({ where }),
  ]);
  return <main className="min-h-screen bg-[var(--paper)]"><header className="border-b border-[var(--line)] px-5 py-6 lg:px-10"><div className="mx-auto flex max-w-[1100px] items-center justify-between"><Link href="/admin" className="display-font text-4xl">NOVA<span className="text-[var(--coral)]">.</span></Link><Link href="/admin" className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--coral)]">Volver al panel</Link></div></header><div className="mx-auto max-w-[1100px] px-5 py-12 lg:px-10"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">Administración</p><h1 className="display-font mt-2 text-7xl">Inventario.</h1><div className="mt-10 overflow-x-auto border border-[var(--line)]"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[var(--ink)] text-xs uppercase tracking-[0.1em] text-[var(--paper)]"><tr><th className="px-4 py-3">Producto</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3">Talle</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Modalidad</th></tr></thead><tbody>{variants.map((variant) => <tr key={variant.id} className="border-t border-[var(--line)]"><td className="px-4 py-3 font-bold">{variant.product.name}</td><td className="px-4 py-3 text-[var(--muted)]">{variant.product.category}</td><td className="px-4 py-3">{variant.size}</td><td className="px-4 py-3 text-xs text-[var(--muted)]">{variant.sku}</td><td className={`px-4 py-3 font-bold ${variant.stock <= 2 ? "text-[var(--coral)]" : ""}`}>{variant.stock}</td><td className="px-4 py-3 text-xs uppercase">{variant.product.availability === "PREORDER" ? `Encargo · ${variant.product.leadTimeDays} días` : "Inmediato"}</td></tr>)}</tbody></table></div><Pagination page={page} pageSize={pageSize} total={total} basePath="/admin/inventario" /></div></main>;
}
