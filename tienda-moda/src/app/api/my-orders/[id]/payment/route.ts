import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";

const receiptSchema = z.object({ paymentReceiptUrl: z.string().url() });

export const PATCH = auth(async function attachPaymentReceipt(request, context) {
  if (!request.auth?.user?.id) return NextResponse.json({ error: "Debés iniciar sesión." }, { status: 401 });
  const parsed = receiptSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Comprobante inválido." }, { status: 400 });
  const { id } = await context.params;
  const order = await prisma.order.findFirst({ where: { id, userId: request.auth.user.id } });
  if (!order) return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
  if (order.paymentMethod !== "BANK_TRANSFER") return NextResponse.json({ error: "Esta reserva no requiere comprobante." }, { status: 400 });
  if (["CANCELLED", "EXPIRED", "COMPLETED"].includes(order.status)) return NextResponse.json({ error: "La reserva ya no admite comprobantes." }, { status: 409 });
  const updatedOrder = await prisma.order.update({ where: { id }, data: { paymentReceiptUrl: parsed.data.paymentReceiptUrl, paymentStatus: "PROOF_SUBMITTED" }, select: { id: true, paymentStatus: true, paymentReceiptUrl: true } });
  return NextResponse.json({ order: updatedOrder });
});
