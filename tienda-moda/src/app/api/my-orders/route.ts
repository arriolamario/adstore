import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";

export const GET = auth(async function getMyOrders(request) {
  if (!request.auth?.user?.id) return NextResponse.json({ error: "Debés iniciar sesión." }, { status: 401 });
  const orders = await prisma.order.findMany({
    where: { userId: request.auth.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
});
