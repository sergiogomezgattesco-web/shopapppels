import { PrismaClient } from '@prisma/client';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

const prisma = new PrismaClient();

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!
});

export const createPreference = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true, items: { include: { product: true } } }
  });
  if (!order) throw new Error('Orden no encontrada');
  if (order.payment?.status === 'APPROVED') throw new Error('La orden ya fue pagada');
  if (order.payment?.status === 'REJECTED') {
    await prisma.payment.delete({ where: { orderId } });
  }

  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';

  const preference = new Preference(mpClient);
  const result = await preference.create({
    body: {
      items: order.items.map(item => ({
        id: item.productId,
        title: item.product.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        currency_id: 'ARS',
      })),
      back_urls: {
        success: `${frontendUrl}/payment/success`,
        failure: `${frontendUrl}/payment/failure`,
        pending: `${frontendUrl}/payment/pending`,
      },
      external_reference: orderId,
    }
  });

  return {
    checkoutUrl: result.init_point!,
    preferenceId: result.id!,
  };
};

export const confirmPayment = async (
  orderId: string,
  mpPaymentId: string,
  status: string
) => {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
  if (!order) throw new Error('Orden no encontrada');
  if (order.payment) return order.payment;

  const paymentStatus = status === 'approved' ? 'APPROVED'
    : status === 'pending' ? 'PENDING'
    : 'REJECTED';

  const payment = await prisma.payment.create({
    data: {
      orderId,
      method: 'mercadopago',
      amount: order.total,
      status: paymentStatus,
      transactionId: mpPaymentId,
    }
  });

  if (paymentStatus === 'APPROVED') {
    await prisma.order.update({ where: { id: orderId }, data: { status: 'CONFIRMED' } });
  }

  return payment;
};

export const getPaymentByOrder = async (orderId: string) => {
  const payment = await prisma.payment.findUnique({ where: { orderId } });
  if (!payment) throw new Error('Pago no encontrado');
  return payment;
};

export const verifyPaymentByOrder = async (orderId: string) => {
  const paymentClient = new Payment(mpClient);
  const results = await paymentClient.search({ options: { external_reference: orderId, limit: 10 } });

  const mpPayment = results.results?.[0];
  if (!mpPayment) throw new Error('No se encontró el pago en MercadoPago');

  const paymentStatus = mpPayment.status === 'approved' ? 'APPROVED'
    : mpPayment.status === 'pending' ? 'PENDING'
    : 'REJECTED';

  const existing = await prisma.payment.findUnique({ where: { orderId } });
  if (existing) {
    await prisma.payment.update({
      where: { orderId },
      data: { status: paymentStatus, transactionId: String(mpPayment.id) }
    });
  } else {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Orden no encontrada');
    await prisma.payment.create({
      data: { orderId, method: 'mercadopago', amount: order.total, status: paymentStatus, transactionId: String(mpPayment.id) }
    });
  }

  if (paymentStatus === 'APPROVED') {
    await prisma.order.update({ where: { id: orderId }, data: { status: 'CONFIRMED' } });
  }

  return { status: paymentStatus };
};

export const handleWebhook = async (paymentId: string) => {
  const mpPayment = new Payment(mpClient);
  const data = await mpPayment.get({ id: paymentId });

  const orderId = data.external_reference;
  if (!orderId) return;

  const status = data.status === 'approved' ? 'APPROVED'
    : data.status === 'pending' ? 'PENDING'
    : 'REJECTED';

  const existing = await prisma.payment.findUnique({ where: { orderId } });
  if (existing) {
    await prisma.payment.update({ where: { orderId }, data: { status, transactionId: String(paymentId) } });
  } else {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return;
    await prisma.payment.create({
      data: { orderId, method: 'mercadopago', amount: order.total, status, transactionId: String(paymentId) }
    });
  }

  if (status === 'APPROVED') {
    await prisma.order.update({ where: { id: orderId }, data: { status: 'CONFIRMED' } });
  }
};
