"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { LogOut, Activity, AlertTriangle, ShieldCheck, User, History, Wallet } from "lucide-react";

interface Transaction {
    id: number;
    type: string;
    amount: number;
    fraudProbability: number;
    isFraud: boolean;
    riskLevel: string;
    createdAt: string;
}

interface UserInfo {
    id: number;
    name: string;
    email: string;
    role: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [amount, setAmount] = useState("");
    const [accountBalance, setAccountBalance] = useState("");
    const [type, setType] = useState("UPI");
    const [beneficiaryStatus, setBeneficiaryStatus] = useState("known");
    const [transactionDateTime, setTransactionDateTime] = useState(new Date().toISOString().slice(0, 16));
    const [bankType, setBankType] = useState("same");
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
    const [location, setLocation] = useState("");
    const [isInternational, setIsInternational] = useState("local");
    const [debitDateTime, setDebitDateTime] = useState(new Date().toISOString().slice(0, 16));
    const [merchantCategory, setMerchantCategory] = useState("retail");
    const [debitChannel, setDebitChannel] = useState("online");
    const [isKnownEntity, setIsKnownEntity] = useState("yes");
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const startTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchUserInfo();
        fetchTransactions();
        startTimeRef.current = Date.now();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://127.0.0.1:5000/api/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserInfo(res.data);
        } catch (error) {
            console.error("Failed to fetch user info", error);
        }
    };

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://127.0.0.1:5000/api/transactions", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTransactions(res.data);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const duration = (Date.now() - startTimeRef.current) / 1000; // Seconds

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://127.0.0.1:5000/api/transactions",
                {
                    type,
                    amount: parseFloat(amount),
                    accountBalance: parseFloat(accountBalance),
                    transactionDuration: duration,
                    loginAttempts: 1, // Default to 1 (current session)
                    details: type === 'NEFT' ? {
                        beneficiaryStatus,
                        transactionDateTime,
                        bankType
                    } : type === 'Credit Card' ? {
                        transactionDate,
                        location,
                        isInternational
                    } : type === 'Debit Card' ? {
                        debitDateTime,
                        merchantCategory,
                        debitChannel
                    } : type === 'UPI' ? {
                        isKnownEntity
                    } : {},
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAmount("");
            setAccountBalance("");
            // Reset timer for next transaction
            startTimeRef.current = Date.now();
            fetchTransactions();
        } catch (error) {
            console.error("Transaction failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/");
    };

    const handleMethodSelect = (method: string) => {
        if (userInfo?.role === 'GUEST' && method !== 'UPI') {
            setShowLoginModal(true);
            return;
        }
        setType(method);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col md:flex-row">
            {/* Left-side Dashboard Panel (Sidebar) */}
            <aside className="w-full md:w-96 bg-gray-850 border-r border-gray-700 h-screen sticky top-0 flex flex-col overflow-hidden">
                {/* User Section */}
                <div className="p-8 border-b border-gray-700 bg-gray-900/30">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                            <User className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold truncate max-w-[180px]">
                                {userInfo?.role === 'GUEST' ? "Guest" : (userInfo?.name || (userInfo?.email ? userInfo.email.split('@')[0] : "Loading..."))}
                            </h3>
                            {userInfo?.role !== 'GUEST' && (
                                <p className="text-xs text-gray-400 truncate max-w-[180px]">
                                    {userInfo?.email || "Fetching profile..."}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="ml-auto p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Transaction Type Filter/Selector */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
                            Transaction Method
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {["UPI", "NEFT", "Credit Card", "Debit Card"].map((method) => (
                                <button
                                    key={method}
                                    onClick={() => handleMethodSelect(method)}
                                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all border ${type === method
                                        ? "bg-blue-600/20 border-blue-500 text-blue-400"
                                        : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                                        }`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <History className="w-5 h-5 text-purple-400" />
                            History
                        </h2>
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-md">
                            Recent
                        </span>
                    </div>

                    <div className="space-y-4">
                        {transactions.map((tx) => (
                            <div
                                key={tx.id}
                                className={`p-4 rounded-2xl border bg-gray-800/40 backdrop-blur-sm transition-all hover:bg-gray-800/60 overflow-hidden relative group ${tx.isFraud
                                    ? "border-red-500/30"
                                    : "border-gray-700"
                                    }`}
                            >
                                {tx.isFraud && (
                                    <div className="absolute top-0 right-0 p-1">
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-sm text-gray-200">{tx.type}</div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">
                                            {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-md font-mono font-bold">₹{tx.amount.toLocaleString()}</div>
                                        <div
                                            className={`text-[9px] font-extrabold uppercase tracking-tighter mt-0.5 ${tx.isFraud
                                                ? "text-red-500"
                                                : "text-green-500"
                                                }`}
                                        >
                                            {tx.isFraud ? "High Risk" : "Safe"}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-700/50 flex justify-between items-center">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${tx.isFraud ? "bg-red-500" : "bg-green-500"}`} />
                                        <span className="text-[10px] text-gray-400">Analysis Result</span>
                                    </div>
                                    <div className="text-[10px] font-mono text-gray-500">
                                        {(tx.fraudProbability * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        ))}

                        {transactions.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Activity className="w-12 h-12 text-gray-700 mb-3" />
                                <p className="text-gray-500 text-sm">No transaction records yet</p>
                            </div>
                        )}
                    </div>

                    {/* Guest Overlay */}
                    {userInfo?.role === 'GUEST' && (
                        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10">
                            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                                <History className="w-8 h-8 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">View History</h3>
                            <p className="text-sm text-gray-400 mb-6">
                                Sign up or log in to keep track of your transactions and fraud analysis history.
                            </p>
                            <div className="flex flex-col w-full gap-3">
                                <button
                                    onClick={() => router.push("/signup")}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
                                >
                                    Sign Up
                                </button>
                                <button
                                    onClick={() => router.push("/login")}
                                    className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl border border-gray-700 transition"
                                >
                                    Login
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Optional Footer or Account Summary */}
                <div className="p-4 bg-gray-900/50 border-t border-gray-700">
                    <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-3 rounded-xl border border-blue-500/20 flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] text-gray-300">Protected by Fraud Lens real-time monitoring</span>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-4xl mx-auto">
                    <header className="flex justify-between items-center mb-10">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Fraud Lens Dashboard
                        </h1>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition md:hidden"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </header>

                    {/* Transaction Form */}
                    <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-400">
                            <Wallet className="w-7 h-7" />
                            Perform Transaction
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Amount (INR)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-lg"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        {(type === 'NEFT' || type === 'Credit Card' || type === 'Debit Card')
                                            ? (type === 'NEFT' ? 'Bank (Same/Different)' : type === 'Credit Card' ? 'Transaction Category' : 'Transaction Channel')
                                            : 'Account Balance (INR)'}
                                    </label>
                                    {type === 'NEFT' ? (
                                        <div className="relative">
                                            <select
                                                value={bankType}
                                                onChange={(e) => setBankType(e.target.value)}
                                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold appearance-none cursor-pointer"
                                            >
                                                <option value="same" className="bg-gray-800">Same Bank</option>
                                                <option value="different" className="bg-gray-800">Different Bank</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                            </div>
                                        </div>
                                    ) : type === 'Credit Card' ? (
                                        <div className="relative">
                                            <select
                                                value={isInternational}
                                                onChange={(e) => setIsInternational(e.target.value)}
                                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold appearance-none cursor-pointer"
                                            >
                                                <option value="local" className="bg-gray-800">Local Transaction</option>
                                                <option value="international" className="bg-gray-800">International Transaction</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                            </div>
                                        </div>
                                    ) : type === 'Debit Card' ? (
                                        <div className="relative">
                                            <select
                                                value={debitChannel}
                                                onChange={(e) => setDebitChannel(e.target.value)}
                                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold appearance-none cursor-pointer"
                                            >
                                                <option value="online" className="bg-gray-800">Online</option>
                                                <option value="pos" className="bg-gray-800">POS Terminal</option>
                                                <option value="atm" className="bg-gray-800">ATM Withdrawal</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <input
                                            type="number"
                                            required
                                            value={accountBalance}
                                            onChange={(e) => setAccountBalance(e.target.value)}
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-lg"
                                            placeholder="Current Balance"
                                        />
                                    )}
                                </div>
                            </div>

                            {type === 'UPI' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Known Entity
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={isKnownEntity}
                                                onChange={(e) => setIsKnownEntity(e.target.value)}
                                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold appearance-none cursor-pointer"
                                            >
                                                <option value="yes" className="bg-gray-800">Yes</option>
                                                <option value="no" className="bg-gray-800">No</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {type === 'NEFT' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Transaction Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={transactionDateTime}
                                            onChange={(e) => setTransactionDateTime(e.target.value)}
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Beneficiary Status
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={beneficiaryStatus}
                                                onChange={(e) => setBeneficiaryStatus(e.target.value)}
                                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold appearance-none cursor-pointer"
                                            >
                                                <option value="known" className="bg-gray-800">Known Beneficiary</option>
                                                <option value="unknown" className="bg-gray-800">Unknown Beneficiary</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {type === 'Credit Card' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Transaction Date
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={transactionDate}
                                            onChange={(e) => setTransactionDate(e.target.value)}
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Location (City/Country)
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            placeholder="e.g. Mumbai, India"
                                        />
                                    </div>
                                </div>
                            )}

                            {type === 'Debit Card' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={debitDateTime}
                                            onChange={(e) => setDebitDateTime(e.target.value)}
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Transferred To
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={merchantCategory}
                                                onChange={(e) => setMerchantCategory(e.target.value)}
                                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold appearance-none cursor-pointer"
                                            >
                                                <option value="retail" className="bg-gray-800">Retail</option>
                                                <option value="food" className="bg-gray-800">Food & Dining</option>
                                                <option value="individual" className="bg-gray-800">Individual</option>
                                                <option value="entertainment" className="bg-gray-800">Entertainment</option>
                                                <option value="utilities" className="bg-gray-800">Utilities</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Activity className="w-5 h-5 animate-spin" />
                                        Analyzing Risk...
                                    </>
                                ) : (
                                    "Confirm Transaction"
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Stats or Info Grid could go here */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                        <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                            <ShieldCheck className="w-8 h-8 text-green-400 mb-2" />
                            <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">Status</span>
                            <span className="text-lg font-bold">Secure</span>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                            <Activity className="w-8 h-8 text-blue-400 mb-2" />
                            <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">Activity</span>
                            <span className="text-lg font-bold">{transactions.length} Total</span>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                            <Wallet className="w-8 h-8 text-purple-400 mb-2" />
                            <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">Network</span>
                            <span className="text-lg font-bold">Live</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Restriction Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 border border-gray-700 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center">
                        <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <ShieldCheck className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 italic">Exclusive Feature</h3>
                        <p className="text-gray-400 mb-8 text-sm">
                            NEFT and Card payments are exclusive to registered users. Sign up now to unlock full access to Fraud Lens.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => router.push("/signup")}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-900/40"
                            >
                                Get Started
                            </button>
                            <button
                                onClick={() => router.push("/login")}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl border border-gray-600 transition"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="w-full py-2 text-gray-500 hover:text-white transition text-xs font-bold uppercase tracking-widest mt-2"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
