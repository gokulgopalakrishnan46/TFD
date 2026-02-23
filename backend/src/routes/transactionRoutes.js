import { Router } from 'express';
import { createTransaction, getTransactions } from '../controllers/transactionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
const router = Router();
router.use(authenticateToken);
router.post('/', createTransaction);
router.get('/', getTransactions);
export default router;
//# sourceMappingURL=transactionRoutes.js.map