import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";

export const GET = auth(async function getAdminOrders(request) {
  if (request.auth?.user.role !== "ADMIN") return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const orders = await prisma.order.findMany({
    include: { user: { select: { name: true, email: true, phone: true } }, items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(orders);
});
