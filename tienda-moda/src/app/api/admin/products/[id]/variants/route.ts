import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../../../../auth";
import { prisma } from "@/lib/prisma";

const variantSchema = z.object({
  size: z.string().trim().min(1).max(20),
  sku: z.string().trim().min(1).max(40),
  color: z.string().trim().max(60).optional(),
  stock: z.number().int().min(0).max(100000),
});

export const POST = auth(async function createProductVariant(request, context) {
  if (request.auth?.user.role !== "ADMIN" || !request.auth.user.id) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const parsed = variantSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos de variante inválidos." }, { status: 400 });
  const { id: productId } = await context.params;
  try {
    const result = await prisma.$transaction(async (transaction) => {
      const product = await transaction.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      const variant = await transaction.productVariant.create({ data: { productId, size: parsed.data.size, sku: parsed.data.sku, color: parsed.data.color || null, stock: parsed.data.stock } });
      if (parsed.data.stock > 0) await transaction.stockMovement.create({ data: { variantId: variant.id, createdById: request.auth!.user!.id, type: "PURCHASE", quantity: parsed.data.stock, note: "Stock inicial de nueva variante" } });
      return variant;
    });
    return NextResponse.json({ variant: result }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    if (error instanceof Error && error.message.includes("Unique constraint")) return NextResponse.json({ error: "El SKU o la combinación de talle y color ya existe." }, { status: 409 });
    return NextResponse.json({ error: "No se pudo crear la variante." }, { status: 500 });
  }
});
