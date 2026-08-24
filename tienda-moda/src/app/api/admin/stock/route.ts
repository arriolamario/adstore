import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";

const movementSchema = z.object({
  type: z.enum(["PURCHASE", "POS_SALE"]),
  items: z.array(z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(500) })).min(1).max(100),
  supplier: z.string().trim().max(120).optional(),
  total: z.number().int().positive().optional(),
  note: z.string().trim().max(300).optional(),
});

export const POST = auth(async function createStockMovement(request) {
  if (request.auth?.user.role !== "ADMIN" || !request.auth.user.id) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const parsed = movementSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos de movimiento inválidos." }, { status: 400 });

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const movements = [];
      const purchaseLines = [];
      for (const item of parsed.data.items) {
        const variant = await transaction.productVariant.findUnique({ where: { id: item.variantId }, include: { product: true } });
        if (!variant) throw new Error("VARIANT_NOT_FOUND");
        if (parsed.data.type === "POS_SALE" && variant.stock < item.quantity) throw new Error("INSUFFICIENT_STOCK");
        await transaction.productVariant.update({ where: { id: variant.id }, data: { stock: parsed.data.type === "PURCHASE" ? { increment: item.quantity } : { decrement: item.quantity } } });
        if (parsed.data.type === "PURCHASE") purchaseLines.push({ productId: variant.productId, variantId: variant.id, productName: `${variant.product.name} / talle ${variant.size}`, quantity: item.quantity });
        movements.push(await transaction.stockMovement.create({ data: { variantId: variant.id, createdById: request.auth!.user!.id, type: parsed.data.type, quantity: item.quantity, note: parsed.data.note || null }, select: { id: true, type: true, quantity: true, createdAt: true } }));
      }
      if (parsed.data.type === "PURCHASE") await transaction.purchase.create({ data: { purchasedById: request.auth!.user!.id, supplier: parsed.data.supplier || null, total: parsed.data.total || null, notes: parsed.data.note || null, items: { create: purchaseLines } } });
      return movements;
    });
    return NextResponse.json({ movements: result }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "VARIANT_NOT_FOUND") return NextResponse.json({ error: "Una variante no existe." }, { status: 404 });
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") return NextResponse.json({ error: "No hay stock suficiente para esa venta." }, { status: 409 });
    return NextResponse.json({ error: "No se pudo registrar el movimiento." }, { status: 500 });
  }
});

export const GET = auth(async function getStockMovements(request) {
  if (request.auth?.user.role !== "ADMIN") return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const movements = await prisma.stockMovement.findMany({ include: { variant: { include: { product: { select: { name: true } } } } }, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json(movements);
});
