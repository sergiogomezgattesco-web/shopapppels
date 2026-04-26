import { Router } from 'express';
import * as ctrl from '../controllers/order.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', ctrl.createOrder);
router.get('/', ctrl.getOrders);
router.get('/:id', ctrl.getOrderById);
router.patch('/:id/status', requireAdmin, ctrl.updateOrderStatus);

export default router;
