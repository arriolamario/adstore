import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { prisma } from "@/lib/prisma";
import PaymentReceipt from "../payment-receipt";
import Pagination from "../pagination";

const money = (value: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
const labels: Record<string, string> = { PENDING: "Pendiente de confirmación", CONFIRMED: "Confirmada", READY_FOR_PICKUP: "Lista para retirar", OUT_FOR_DELIVERY: "En reparto", COMPLETED: "Completada", CANCELLED: "Cancelada", EXPIRED: "Expirada" };
const paymentLabels: Record<string, string> = { CASH: "Efectivo", BANK_TRANSFER: "Transferencia" };
const deliveryLabels: Record<string, string> = { PICKUP: "Retiro en local", UBER_MOTO: "Uber Moto" };

export default async function MyOrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const pageSize = 10;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where: { userId: session.user.id }, include: { items: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.order.count({ where: { userId: session.user.id } }),
  ]);

  return <main className="min-h-screen bg-[var(--paper)]"><header className="border-b border-[var(--line)] px-5 py-6 lg:px-10"><div className="mx-auto flex max-w-[1000px] items-center justify-between"><Link href="/" className="display-font text-4xl tracking-[-0.06em]">NOVA<span className="text-[var(--coral)]">.</span></Link><Link href="/" className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--coral)]">Volver a la tienda</Link></div></header><div className="mx-auto max-w-[1000px] px-5 py-12 lg:px-10"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">Tu cuenta</p><h1 className="display-font mt-2 text-7xl leading-none tracking-[-0.06em]">Mis reservas.</h1><p className="mt-4 text-sm text-[var(--muted)]">Seguimiento de tus pedidos y productos por encargo.</p><div className="mt-12 space-y-5">{orders.length === 0 ? <div className="border border-[var(--line)] bg-[#d9e7da] p-8"><p className="display-font text-4xl">Todavía no hay reservas.</p><Link href="/#shop" className="mt-6 inline-block border-b border-[var(--ink)] pb-1 text-xs font-bold uppercase tracking-[0.12em]">Explorar productos</Link></div> : orders.map((order) => <article key={order.id} className="border border-[var(--line)] bg-white/30 p-6 sm:p-8"><div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Reserva #{order.id.slice(-8)}</p><p className="mt-2 text-sm text-[var(--muted)]">{order.createdAt.toLocaleDateString("es-AR")}</p></div><span className="self-start bg-[var(--lime)] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em]">{labels[order.status]}</span></div><div className="space-y-3 py-5">{order.items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><div><p className="font-bold">{item.productName}</p><p className="text-xs text-[var(--muted)]">{item.preorder ? `Por encargo · ${item.leadTimeDays} días hábiles` : "Stock disponible"} · Cantidad {item.quantity}</p></div><strong>{money(item.unitPrice * item.quantity)}</strong></div>)}</div><div className="flex flex-col justify-between gap-3 border-t border-[var(--line)] pt-5 text-xs uppercase tracking-[0.08em] sm:flex-row"><span>{paymentLabels[order.paymentMethod]} · {deliveryLabels[order.deliveryMethod]}{order.deliveryAddress ? ` · ${order.deliveryAddress}` : ""}</span><strong>Total {money(order.total)}</strong></div><PaymentReceipt orderId={order.id} paymentMethod={order.paymentMethod} paymentStatus={order.paymentStatus} receiptUrl={order.paymentReceiptUrl} /></article>)}</div><Pagination page={page} pageSize={pageSize} total={total} basePath="/mis-reservas" /></div></main>;
}
