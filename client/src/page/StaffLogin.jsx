import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const StaffLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // Updated for Vigi branding
    const staffCredentials = {
        email: "staff@vigi.com",
        password: "staff123",
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (email === staffCredentials.email && password === staffCredentials.password) {
            localStorage.setItem("isAuthenticated", true);
            localStorage.setItem("role", "staff");

            toast.success("Staff Authentication Successful!");

            setTimeout(() => {
                // Redirect to Order Summary as requested
                navigate("/order-summary");
            }, 2000);
        } else {
            toast.error("Invalid Staff Credentials!");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f] px-4 relative overflow-hidden">
            {/* Background Aesthetic Glows */}
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_#d9042808_0%,_transparent_65%)] blur-3xl" />

            <Toaster position="top-center" reverseOrder={false} />

            <div className="relative group w-full max-w-md">
                {/* Premium Border Highlight */}
                <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#d90428] via-transparent to-[#d90428] rounded-2xl opacity-10 group-hover:opacity-30 transition duration-1000"></div>

                <div className="relative bg-[#1a1a1a] border border-white/5 p-10 rounded-2xl shadow-2xl backdrop-blur-2xl">
                    <div className="text-center mb-10">
                        <div className="inline-block px-3 py-1 mb-4 rounded-md border border-white/10 bg-white/5 text-gray-400 text-[10px] font-bold tracking-[0.3em] uppercase">
                            Staff Portal
                        </div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">
                            Vigilixhub<span className="text-[#d90428]">.</span>Ops
                        </h1>
                        <p className="text-gray-500 text-sm mt-2">Operational Personnel Verification</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                                Staff ID / Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-[#0f0f0f] border border-white/5 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#d90428]/40 focus:ring-1 focus:ring-[#d90428]/40 transition-all duration-300 placeholder:text-gray-800"
                                placeholder="staff@vigi.com"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                                Security Code
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-[#0f0f0f] border border-white/5 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#d90428]/40 focus:ring-1 focus:ring-[#d90428]/40 transition-all duration-300 placeholder:text-gray-800"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Action Button */}
                        <button
                            type="submit"
                            className="w-full bg-white hover:bg-[#d90428] hover:text-white text-[#0f0f0f] font-bold py-3 rounded-lg transition-all duration-500 shadow-xl shadow-black/50 active:scale-[0.97]"
                        >
                            Enter Operations
                        </button>
                    </form>

                    {/* Footer branding */}
                    <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] text-gray-700 uppercase tracking-widest">System v2.04</span>
                        <p className="text-[9px] text-gray-700 uppercase tracking-widest">
                            © {new Date().getFullYear()} Vigilixhub
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffLogin;