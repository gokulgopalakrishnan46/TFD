import type { Response } from 'express';
import type { AuthRequest } from '../middleware/authMiddleware.js';
export declare const createTransaction: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getTransactions: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=transactionController.d.ts.map