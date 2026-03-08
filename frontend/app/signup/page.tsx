"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Signup() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Regex for basic email validation: char@char.char
    const isEmailValid = useMemo(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }, [email]);

    // Password requirements validation
    const validations = useMemo(() => ({
        minLength: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }), [password]);

    const passwordsMatch = useMemo(() => {
        return password !== "" && password === confirmPassword;
    }, [password, confirmPassword]);

    const isFormValid = useMemo(() => {
        return (
            name.trim().length > 0 &&
            isEmailValid &&
            Object.values(validations).every(Boolean) &&
            passwordsMatch
        );
    }, [name, isEmailValid, validations, passwordsMatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setLoading(true);
        setError("");
        try {
            const res = await axios.post("http://127.0.0.1:5000/api/auth/register", {
                name,
                email,
                password,
            });
            localStorage.setItem("token", res.data.token);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed");
            setLoading(false);
        }
    };

    const Requirement = ({ label, met }: { label: string; met: boolean }) => (
        <div className={`flex items-center text-xs space-x-2 ${met ? "text-green-400" : "text-gray-500"}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${met ? "bg-green-400" : "bg-gray-600"}`} />
            <span>{label}</span>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
                <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
                <p className="text-gray-400 text-center mb-8 text-sm">Join the Fraud Lens system</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-center text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                            Full Name
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full bg-gray-700/50 border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 transition-all ${email.length > 0 && !isEmailValid ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-blue-500"
                                }`}
                            placeholder="you@example.com"
                        />
                        {email.length > 0 && !isEmailValid && (
                            <p className="text-red-500 text-[10px] mt-1 italic">Please enter a valid email address (e.g. name@domain.com)</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                            placeholder="••••••••"
                        />

                        <div className="mt-3 grid grid-cols-2 gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                            <Requirement label="At least 8 characters" met={validations.minLength} />
                            <Requirement label="One uppercase letter" met={validations.hasUpper} />
                            <Requirement label="One lowercase letter" met={validations.hasLower} />
                            <Requirement label="One number" met={validations.hasNumber} />
                            <Requirement label="One special character" met={validations.hasSpecial} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full bg-gray-700/50 border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 transition-all ${confirmPassword.length > 0 && !passwordsMatch ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-blue-500"
                                }`}
                            placeholder="••••••••"
                        />
                        {confirmPassword.length > 0 && !passwordsMatch && (
                            <p className="text-red-500 text-[10px] mt-1 italic">Passwords do not match</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!isFormValid || loading}
                        className={`w-full font-bold py-3 rounded-lg transition-all transform active:scale-[0.98] ${isFormValid && !loading
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
                            : "bg-gray-700 text-gray-500 cursor-not-allowed"
                            }`}
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <div className="mt-6 text-center text-gray-400 text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
