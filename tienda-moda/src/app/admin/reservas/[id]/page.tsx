import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import OrderStatus from "../../order-status";
import PaymentStatus from "../../payment-status";

const money = (value: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
const paymentLabels: Record<string, string> = { CASH: "Efectivo", BANK_TRANSFER: "Transferencia" };
const deliveryLabels: Record<string, string> = { PICKUP: "Retiro en local", UBER_MOTO: "Uber Moto" };

export default async function ReservationDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/login");
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { user: { select: { name: true, email: true, phone: true } }, items: { include: { variant: true } } } });
  if (!order) notFound();

  return <main className="min-h-screen bg-[var(--paper)]"><header className="border-b border-[var(--line)] px-5 py-6 lg:px-10"><div className="mx-auto flex max-w-[900px] items-center justify-between"><Link href="/admin" className="display-font text-4xl tracking-[-0.06em]">NOVA<span className="text-[var(--coral)]">.</span></Link><Link href="/admin/reservas" className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--coral)]">Volver a reservas</Link></div></header><div className="mx-auto max-w-[900px] px-5 py-12 lg:px-10"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">Detalle de reserva</p><div className="mt-2 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><h1 className="display-font text-7xl leading-none tracking-[-0.06em]">#{order.id.slice(-8)}</h1><OrderStatus orderId={order.id} initialStatus={order.status} /></div><div className="mt-10 grid gap-5 sm:grid-cols-2"><section className="border border-[var(--line)] bg-[#d9e7da] p-6"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--coral)]">Cliente</p><p className="mt-4 font-bold">{order.user.name ?? "Sin nombre"}</p><p className="mt-1 text-sm">{order.user.email}</p><p className="mt-1 text-sm">{order.user.phone ?? "Sin teléfono"}</p></section><section className="border border-[var(--line)] bg-[var(--lime)] p-6"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--coral)]">Entrega y pago</p><p className="mt-4 font-bold">{deliveryLabels[order.deliveryMethod]}</p><p className="mt-1 text-sm">{order.deliveryAddress ?? "Retiro en el local"}</p><p className="mt-3 text-sm">Pago: {paymentLabels[order.paymentMethod]}</p><PaymentStatus orderId={order.id} initialStatus={order.paymentStatus} />{order.paymentReceiptUrl && <a href={order.paymentReceiptUrl} target="_blank" rel="noreferrer" className="mt-4 block text-xs font-bold uppercase underline">Ver comprobante</a>}</section></div><section className="mt-5 border border-[var(--line)] p-6"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--coral)]">Productos</p><div className="mt-5 space-y-4">{order.items.map((item) => <div key={item.id} className="flex justify-between gap-4 border-b border-[var(--line)] pb-4"><div><p className="font-bold">{item.productName}</p><p className="text-xs text-[var(--muted)]">SKU {item.variant.sku} · Cantidad {item.quantity}{item.preorder ? ` · Encargo ${item.leadTimeDays} días hábiles` : ""}</p></div><strong>{money(item.unitPrice * item.quantity)}</strong></div>)}</div><div className="mt-5 flex justify-between text-lg font-bold"><span>Total</span><span>{money(order.total)}</span></div>{order.notes && <p className="mt-6 border-t border-[var(--line)] pt-4 text-sm">Nota: {order.notes}</p>}</section></div></main>;
}
