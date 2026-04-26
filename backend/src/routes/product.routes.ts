import { Router } from 'express';
import * as ctrl from '../controllers/product.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/categories', ctrl.getCategories);
router.post('/categories', authenticate, requireAdmin, ctrl.createCategory);
router.delete('/categories/:id', authenticate, requireAdmin, ctrl.deleteCategory);
router.get('/', ctrl.getProducts);
router.get('/:id', ctrl.getProductById);
router.post('/', authenticate, requireAdmin, ctrl.createProduct);
router.put('/:id', authenticate, requireAdmin, ctrl.updateProduct);
router.delete('/:id', authenticate, requireAdmin, ctrl.deleteProduct);
router.patch('/:id/stock', authenticate, requireAdmin, ctrl.adjustStock);

export default router;
