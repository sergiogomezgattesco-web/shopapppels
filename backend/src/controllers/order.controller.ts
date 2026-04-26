import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as orderService from '../services/order.service';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.createOrder(req.userId!, req.body.items);
    res.status(201).json(order);
  } catch (err) { next(err); }
};

export const getOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.getOrders(req.userId!, req.userRole!);
    res.json(orders);
  } catch (err) { next(err); }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.userId!, req.userRole!);
    res.json(order);
  } catch (err) { next(err); }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.json(order);
  } catch (err) { next(err); }
};
