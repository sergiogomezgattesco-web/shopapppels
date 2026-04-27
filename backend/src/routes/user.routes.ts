import { Router } from 'express';
import * as ctrl from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/me', ctrl.me);
router.put('/me', ctrl.updateProfile);
router.put('/me/password', ctrl.changePassword);

router.get('/', requireAdmin, ctrl.listUsers);
router.put('/:id', requireAdmin, ctrl.updateUserAdmin);

export default router;
