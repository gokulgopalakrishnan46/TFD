import { Router } from 'express';
import { createTransaction, getTransactions } from '../controllers/transactionController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/', createTransaction);
router.get('/', getTransactions);

export default router;
