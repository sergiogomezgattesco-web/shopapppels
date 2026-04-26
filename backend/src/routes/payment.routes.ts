import { Router } from 'express';
import * as ctrl from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/webhook', ctrl.webhook);
router.post('/confirm', ctrl.confirmPayment);
router.use(authenticate);
router.post('/', ctrl.createPreference);
router.get('/order/:orderId', ctrl.getPaymentByOrder);
router.post('/verify/:orderId', ctrl.verifyPayment);

export default router;
