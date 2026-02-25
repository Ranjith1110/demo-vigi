import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const adminCredentials = {
        email: "admin@vigi.com", // Updated for Vigi
        password: "admin123",
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (email === adminCredentials.email && password === adminCredentials.password) {
            localStorage.setItem("isAuthenticated", true);
            localStorage.setItem("role", "admin");

            toast.success("Access Granted. Initializing Vigi...");

            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);
        } else {
            toast.error("Access Denied! Invalid credentials.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f] px-4 relative overflow-hidden">
            {/* Background Glow Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_#d9042810_0%,_transparent_70%)] blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-[#d9042805] rounded-full blur-3xl" />

            <Toaster position="top-center" reverseOrder={false} />

            <div className="relative group w-full max-w-md">
                {/* Outer Glow Border */}
                <div className="absolute -inset-0.5 bg-gradient-to-b from-[#d90428] to-transparent rounded-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                
                <div className="relative bg-[#1a1a1a] border border-white/10 p-10 rounded-2xl shadow-2xl backdrop-blur-xl">
                    <div className="text-center mb-10">
                        <div className="inline-block px-3 py-1 mb-4 rounded-full border border-[#d90428]/30 bg-[#d90428]/10 text-[#d90428] text-[10px] font-bold tracking-[0.2em] uppercase">
                            Secure Gateway
                        </div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">
                            Vigilixhub<span className="text-[#d90428]">.</span>Admin
                        </h1>
                        <p className="text-gray-500 text-sm mt-2">Enter credentials to access the terminal</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">
                                Identity Terminal
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-[#0f0f0f] border border-white/5 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#d90428]/50 focus:ring-1 focus:ring-[#d90428]/50 transition-all duration-300 placeholder:text-gray-700"
                                placeholder="name@vigi.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">
                                Access Cipher
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-[#0f0f0f] border border-white/5 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#d90428]/50 focus:ring-1 focus:ring-[#d90428]/50 transition-all duration-300 placeholder:text-gray-700"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#d90428] hover:bg-[#b20321] text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-[#d90428]/20 active:scale-[0.98]"
                        >
                            Authorize Access
                        </button>
                    </form>

                    <div className="mt-10 pt-6 border-t border-white/5 text-center">
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                            © {new Date().getFullYear()} VIGI Systems • Encryption Active
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;