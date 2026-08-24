import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";

const orderSchema = z.object({
  items: z.array(z.object({ productId: z.string().min(1), variantId: z.string().min(1), quantity: z.number().int().min(1).max(20) })).min(1).max(50),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER"]),
  deliveryMethod: z.enum(["PICKUP", "UBER_MOTO"]),
  deliveryAddress: z.string().trim().max(300).optional(),
  paymentReceiptUrl: z.string().url().optional(),
  notes: z.string().max(500).optional(),
});

export const POST = auth(async function createOrder(request) {
  if (!request.auth?.user?.id) return NextResponse.json({ error: "Debés iniciar sesión para reservar." }, { status: 401 });
  const parsed = orderSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos de reserva inválidos." }, { status: 400 });
  if (parsed.data.deliveryMethod === "UBER_MOTO" && !parsed.data.deliveryAddress) return NextResponse.json({ error: "Indicá la dirección para el envío por Uber Moto." }, { status: 400 });

  try {
    const order = await prisma.$transaction(async (transaction) => {
      const variants = await transaction.productVariant.findMany({ where: { id: { in: parsed.data.items.map((item) => item.variantId) } }, include: { product: true } });
      if (variants.length !== new Set(parsed.data.items.map((item) => item.variantId)).size) throw new Error("PRODUCT_NOT_FOUND");

      const orderItems = parsed.data.items.map((item) => {
        const variant = variants.find((candidate) => candidate.id === item.variantId)!;
        if (variant.productId !== item.productId) throw new Error("PRODUCT_NOT_FOUND");
        if (variant.product.availability === "IN_STOCK" && variant.stock < item.quantity) throw new Error("INSUFFICIENT_STOCK");
        return { variant, product: variant.product, quantity: item.quantity };
      });
      const total = orderItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const createdOrder = await transaction.order.create({
        data: {
          userId: request.auth!.user!.id,
          paymentMethod: parsed.data.paymentMethod,
          paymentStatus: parsed.data.paymentMethod === "CASH" ? "NOT_REQUIRED" : parsed.data.paymentReceiptUrl ? "PROOF_SUBMITTED" : "PENDING",
          paymentReceiptUrl: parsed.data.paymentReceiptUrl || null,
          deliveryMethod: parsed.data.deliveryMethod,
          deliveryAddress: parsed.data.deliveryAddress || null,
          notes: parsed.data.notes,
          total,
          items: { create: orderItems.map(({ variant, product, quantity }) => ({ productId: product.id, variantId: variant.id, productName: `${product.name} / talle ${variant.size}`, unitPrice: product.price, quantity, preorder: product.availability === "PREORDER", leadTimeDays: product.availability === "PREORDER" ? product.leadTimeDays : null })) },
        },
        select: { id: true, status: true, total: true },
      });
      for (const { variant, product, quantity } of orderItems) {
        if (product.availability === "IN_STOCK") await transaction.productVariant.update({ where: { id: variant.id }, data: { stock: { decrement: quantity } } });
      }
      return createdOrder;
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") return NextResponse.json({ error: "Uno de los productos ya no tiene stock suficiente." }, { status: 409 });
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") return NextResponse.json({ error: "Uno de los productos no existe." }, { status: 404 });
    return NextResponse.json({ error: "No pudimos crear la reserva." }, { status: 500 });
  }
});
