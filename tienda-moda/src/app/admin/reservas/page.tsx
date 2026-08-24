import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import Pagination from "../../pagination";
import ReservationFilters from "./reservation-filters";

const money = (value: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);

export default async function AdminReservationsPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; status?: string; payment?: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/login");
  const filters = await searchParams;
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = 10;
  const where = {
    ...(filters.status && { status: filters.status as "PENDING" | "CONFIRMED" | "READY_FOR_PICKUP" | "OUT_FOR_DELIVERY" | "COMPLETED" | "CANCELLED" | "EXPIRED" }),
    ...(filters.payment && { paymentMethod: filters.payment as "CASH" | "BANK_TRANSFER" }),
    ...(filters.search && { user: { OR: [{ name: { contains: filters.search, mode: "insensitive" as const } }, { email: { contains: filters.search, mode: "insensitive" as const } }] } }),
  };
  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, include: { user: { select: { name: true, email: true } }, items: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.order.count({ where }),
  ]);

  const filterQuery = new URLSearchParams();
  if (filters.search) filterQuery.set("search", filters.search);
  if (filters.status) filterQuery.set("status", filters.status);
  if (filters.payment) filterQuery.set("payment", filters.payment);
  const basePath = `/admin/reservas${filterQuery.toString() ? `?${filterQuery.toString()}` : ""}`;
  return <main className="min-h-screen bg-[var(--paper)]"><header className="border-b border-[var(--line)] px-5 py-6 lg:px-10"><div className="mx-auto flex max-w-[1000px] items-center justify-between"><Link href="/admin" className="display-font text-4xl tracking-[-0.06em]">NOVA<span className="text-[var(--coral)]">.</span></Link><Link href="/admin" className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--coral)]">Volver al panel</Link></div></header><div className="mx-auto max-w-[1000px] px-5 py-12 lg:px-10"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">Operación</p><h1 className="display-font mt-2 text-7xl leading-none tracking-[-0.06em]">Reservas.</h1><ReservationFilters /><div className="mt-10 space-y-3">{orders.length === 0 ? <p className="text-sm text-[var(--muted)]">No hay reservas que coincidan.</p> : orders.map((order) => <Link href={`/admin/reservas/${order.id}`} key={order.id} className="flex flex-col justify-between gap-3 border border-[var(--line)] p-5 transition hover:bg-[#d9e7da] sm:flex-row sm:items-center"><div><p className="font-bold">#{order.id.slice(-8)} · {order.user.name ?? order.user.email}</p><p className="mt-1 text-xs text-[var(--muted)]">{order.items.map((item) => `${item.productName} x${item.quantity}`).join(" · ")}</p></div><div className="flex items-center gap-5 text-xs uppercase tracking-[0.08em]"><span>{order.status}</span><strong>{money(order.total)}</strong><span className="text-[var(--coral)]">Ver detalle</span></div></Link>)}</div><Pagination page={page} pageSize={pageSize} total={total} basePath={basePath} /></div></main>;
}
