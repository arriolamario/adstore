import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";

const statusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED", "EXPIRED"]).optional(),
  paymentStatus: z.enum(["NOT_REQUIRED", "PENDING", "PROOF_SUBMITTED", "VERIFIED", "REJECTED"]).optional(),
});

export const GET = auth(async function getAdminOrder(request, context) {
  if (request.auth?.user.role !== "ADMIN") return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const { id } = await context.params;
  const order = await prisma.order.findUnique({ where: { id }, include: { user: { select: { name: true, email: true, phone: true } }, items: { include: { variant: true } } } });
  return order ? NextResponse.json(order) : NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
});

export const PATCH = auth(async function updateOrder(request, context) {
  if (request.auth?.user.role !== "ADMIN" || !request.auth.user.id) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const parsed = statusSchema.safeParse(await request.json());
  if (!parsed.success || (!parsed.data.status && !parsed.data.paymentStatus)) return NextResponse.json({ error: "Actualización inválida." }, { status: 400 });
  const { id } = await context.params;

  try {
    const order = await prisma.$transaction(async (transaction) => {
      const currentOrder = await transaction.order.findUnique({ where: { id }, include: { items: true } });
      if (!currentOrder) throw new Error("ORDER_NOT_FOUND");
      const finalStatuses = ["COMPLETED", "CANCELLED", "EXPIRED"];
      if (parsed.data.status && finalStatuses.includes(currentOrder.status) && currentOrder.status !== parsed.data.status) throw new Error("ORDER_FINAL");

      const shouldRestock = Boolean(parsed.data.status && !finalStatuses.includes(currentOrder.status) && ["CANCELLED", "EXPIRED"].includes(parsed.data.status));
      if (shouldRestock) {
        for (const item of currentOrder.items.filter((candidate) => !candidate.preorder)) {
          await transaction.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
          await transaction.stockMovement.create({ data: { variantId: item.variantId, createdById: request.auth!.user!.id, type: "ADJUSTMENT", quantity: item.quantity, note: `Reposición por reserva ${currentOrder.id.slice(-8)} ${parsed.data.status === "CANCELLED" ? "cancelada" : "vencida"}` } });
        }
      }

      return transaction.order.update({ where: { id }, data: { ...(parsed.data.status && { status: parsed.data.status }), ...(parsed.data.paymentStatus && { paymentStatus: parsed.data.paymentStatus }) }, select: { id: true, status: true, paymentStatus: true } });
    });
    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    if (error instanceof Error && error.message === "ORDER_FINAL") return NextResponse.json({ error: "No se puede modificar una reserva finalizada." }, { status: 409 });
    return NextResponse.json({ error: "No se pudo actualizar la reserva." }, { status: 500 });
  }
});
