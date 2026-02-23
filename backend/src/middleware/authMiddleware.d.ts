import type { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        userId: number;
        role: string;
    };
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=authMiddleware.d.ts.map