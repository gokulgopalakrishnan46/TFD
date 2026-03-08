"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactions = exports.createTransaction = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const axios_1 = __importDefault(require("axios"));
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const createTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { type, amount, details, accountBalance, transactionDuration, loginAttempts } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // 1. Call ML Service for prediction
        let fraudResult = {
            probability: 0,
            isFraud: false,
            riskLevel: 'LOW'
        };
        const typeMapping = {
            'UPI': 'PAYMENT',
            'Credit Card': 'CASH_OUT',
            'Debit Card': 'DEBIT',
            'NEFT': 'TRANSFER'
        };
        const mlType = typeMapping[type] || 'PAYMENT';
        try {
            const mlResponse = yield axios_1.default.post(`${ML_SERVICE_URL}/predict`, {
                type: mlType,
                amount,
                accountBalance: accountBalance ? parseFloat(accountBalance) : 0,
                transactionDuration: parseFloat(transactionDuration),
                loginAttempts: parseInt(loginAttempts),
                details
            });
            fraudResult = mlResponse.data;
        }
        catch (error) {
            console.error('ML Service Error:', error);
            // Fallback or just log error, treating as non-fraud for now or failing
            // For now, we continue with default safe values but log the error
        }
        // 2. Save to Database
        const transaction = yield prismaClient_1.default.transaction.create({
            data: {
                userId,
                type,
                amount: parseFloat(amount),
                details: JSON.stringify(Object.assign(Object.assign({}, details), { accountBalance, transactionDuration, loginAttempts })),
                fraudProbability: fraudResult.probability,
                isFraud: fraudResult.isFraud,
                riskLevel: fraudResult.riskLevel
            }
        });
        res.status(201).json(transaction);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createTransaction = createTransaction;
const getTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const transactions = yield prismaClient_1.default.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(transactions);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getTransactions = getTransactions;
