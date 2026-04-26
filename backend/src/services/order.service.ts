import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface OrderItemInput {
  productId: string;
  quantity: number;
}

export const createOrder = async (userId: string, items: OrderItemInput[]) => {
  // Validate stock and calculate total
  let total = 0;
  const itemsWithPrice = await Promise.all(items.map(async (item) => {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { stock: true }
    });
    if (!product) throw new Error(`Producto ${item.productId} no encontrado`);
    if (!product.stock || product.stock.quantity < item.quantity) {
      throw new Error(`Stock insuficiente para ${product.name}`);
    }
    total += product.price * item.quantity;
    return { ...item, unitPrice: product.price };
  }));

  // Create order and discount stock in a transaction
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId,
        total,
        items: { create: itemsWithPrice }
      },
      include: { items: { include: { product: true } }, user: { select: { id: true, name: true, email: true } } }
    });

    for (const item of itemsWithPrice) {
      await tx.stock.update({
        where: { productId: item.productId },
        data: {
          quantity: { decrement: item.quantity },
          moves: { create: { type: 'OUT', quantity: item.quantity, reason: `Orden ${order.id}` } }
        }
      });
    }

    return order;
  });
};

export const getOrders = async (userId: string, role: string) => {
  return prisma.order.findMany({
    where: role === 'ADMIN' ? {} : { userId },
    include: {
      items: { include: { product: true } },
      payment: true,
      user: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getOrderById = async (id: string, userId: string, role: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      payment: true,
      user: { select: { id: true, name: true, email: true } }
    }
  });
  if (!order) throw new Error('Orden no encontrada');
  if (role !== 'ADMIN' && order.userId !== userId) throw new Error('Acceso denegado');
  return order;
};

export const updateOrderStatus = async (id: string, status: string) => {
  return prisma.order.update({
    where: { id },
    data: { status: status as any },
    include: { items: { include: { product: true } }, payment: true }
  });
};
