import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";

const saleSchema = z.object({
  items: z.array(z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(500) })).min(1).max(100),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER"]),
  notes: z.string().trim().max(300).optional(),
});

export const POST = auth(async function createPosSale(request) {
  if (request.auth?.user.role !== "ADMIN" || !request.auth.user.id) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const parsed = saleSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos de venta inválidos." }, { status: 400 });

  try {
    const sale = await prisma.$transaction(async (transaction) => {
      const variants = await transaction.productVariant.findMany({ where: { id: { in: parsed.data.items.map((item) => item.variantId) } }, include: { product: true } });
      if (variants.length !== new Set(parsed.data.items.map((item) => item.variantId)).size) throw new Error("VARIANT_NOT_FOUND");
      const lines = parsed.data.items.map((item) => {
        const variant = variants.find((candidate) => candidate.id === item.variantId)!;
        if (variant.product.availability === "PREORDER" || variant.stock < item.quantity) throw new Error("INSUFFICIENT_STOCK");
        return { variant, quantity: item.quantity };
      });
      const total = lines.reduce((sum, line) => sum + line.variant.product.price * line.quantity, 0);
      const created = await transaction.posSale.create({ data: { soldById: request.auth!.user!.id, paymentMethod: parsed.data.paymentMethod, notes: parsed.data.notes || null, total, items: { create: lines.map(({ variant, quantity }) => ({ productId: variant.productId, variantId: variant.id, productName: `${variant.product.name} / talle ${variant.size}`, unitPrice: variant.product.price, quantity })) } }, select: { id: true, total: true, paymentMethod: true, createdAt: true } });
      for (const { variant, quantity } of lines) {
        await transaction.productVariant.update({ where: { id: variant.id }, data: { stock: { decrement: quantity } } });
        await transaction.stockMovement.create({ data: { variantId: variant.id, createdById: request.auth!.user!.id, type: "POS_SALE", quantity, note: `Venta presencial ${created.id.slice(-8)}` } });
      }
      return created;
    });
    return NextResponse.json({ sale }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "VARIANT_NOT_FOUND") return NextResponse.json({ error: "Una variante no existe." }, { status: 404 });
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") return NextResponse.json({ error: "No hay stock suficiente para esa variante." }, { status: 409 });
    return NextResponse.json({ error: "No se pudo registrar la venta." }, { status: 500 });
  }
});
