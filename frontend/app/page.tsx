"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent italic">
          Fraud Lens
        </div>
        <div className="space-x-6">
          <Link href="/login" className="hover:text-blue-400 transition">
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-full transition"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-4">
        <div className="max-w-4xl space-y-8 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Secure Transactions with <span className="text-blue-500">AI Precision</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
            Detect fraud in real-time using advanced machine learning algorithms. Protect your business and customers from unauthorized activities.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="group bg-white text-gray-900 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-200 transition flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>

            <button
              onClick={async () => {
                try {
                  const res = await fetch("http://127.0.0.1:5000/api/auth/guest", {
                    method: "POST",
                  });
                  const data = await res.json();
                  if (data.token) {
                    localStorage.setItem("token", data.token);
                    window.location.href = "/dashboard";
                  }
                } catch (e) {
                  console.error("Guest login failed", e);
                  alert("Guest login failed. Please try again.");
                }
              }}
              className="border border-gray-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-800 transition cursor-pointer"
            >
              Guest Demo
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto">
          <div className="bg-gray-800 p-8 rounded-2xl hover:bg-gray-750 transition border border-gray-700">
            <ShieldCheck className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Real-time Protection</h3>
            <p className="text-gray-400">Instant analysis of every transaction to block threats before they happen.</p>
          </div>
          <div className="bg-gray-800 p-8 rounded-2xl hover:bg-gray-750 transition border border-gray-700">
            <Activity className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">ML Precision</h3>
            <p className="text-gray-400">Powered by Supervised and Unsupervised learning for maximum accuracy.</p>
          </div>
          <div className="bg-gray-800 p-8 rounded-2xl hover:bg-gray-750 transition border border-gray-700">
            <Lock className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
            <p className="text-gray-400">Enterprise-grade security ensuring your data remains confidential.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center text-gray-500 border-t border-gray-800 mt-20">
        &copy; {new Date().getFullYear()} Fraud Lens System.
      </footer>
    </div>
  );
}
