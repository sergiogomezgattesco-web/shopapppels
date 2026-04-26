import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as paymentService from '../services/payment.service';

export const createPreference = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.body;
    const result = await paymentService.createPreference(orderId);
    res.json(result);
  } catch (err) { next(err); }
};

export const confirmPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, paymentId, status } = req.body;
    const payment = await paymentService.confirmPayment(orderId, paymentId, status);
    res.json(payment);
  } catch (err) { next(err); }
};

export const getPaymentByOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payment = await paymentService.getPaymentByOrder(req.params.orderId);
    res.json(payment);
  } catch (err) { next(err); }
};

export const verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await paymentService.verifyPaymentByOrder(req.params.orderId);
    res.json(result);
  } catch (err) { next(err); }
};

export const webhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, data } = req.body;
    if (type === 'payment' && data?.id) {
      await paymentService.handleWebhook(String(data.id));
    }
    res.sendStatus(200);
  } catch (err) { next(err); }
};
