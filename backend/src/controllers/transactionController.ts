import type { Response } from 'express';
import type { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../prismaClient';
import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export const createTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const { type, amount, details, accountBalance, transactionDuration, loginAttempts } = req.body;
        const userId = req.user?.userId;

        // 1. Call ML Service for prediction
        let fraudResult = {
            probability: 0,
            isFraud: false,
            riskLevel: 'LOW'
        };

        const typeMapping: { [key: string]: string } = {
            'UPI': 'PAYMENT',
            'Credit Card': 'CASH_OUT',
            'Debit Card': 'DEBIT',
            'NEFT': 'TRANSFER'
        };
        const mlType = typeMapping[type] || 'PAYMENT';

        try {
            const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
                type: mlType,
                amount,
                accountBalance: accountBalance ? parseFloat(accountBalance) : 0,
                transactionDuration: parseFloat(transactionDuration),
                loginAttempts: parseInt(loginAttempts),
                details
            });
            fraudResult = mlResponse.data;
        } catch (error) {
            console.error('ML Service Error:', error);
            // Fallback or just log error, treating as non-fraud for now or failing
            // For now, we continue with default safe values but log the error
        }

        // 2. Save to Database
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                type,
                amount: parseFloat(amount),
                details: JSON.stringify({ ...details, accountBalance, transactionDuration, loginAttempts }),
                fraudProbability: fraudResult.probability,
                isFraud: fraudResult.isFraud,
                riskLevel: fraudResult.riskLevel
            }
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
