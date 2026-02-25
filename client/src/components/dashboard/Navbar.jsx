import React, { useState } from "react";
import { Menu, User, LogOut, Bell, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Navbar = ({ toggleSidebar }) => {
    const [openDropdown, setOpenDropdown] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("role");

        toast.success("Terminal Session Terminated");

        setTimeout(() => {
            navigate("/login");
        }, 1000);
    };

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm">
            {/* NOTE: Toaster should remain in App.jsx to avoid duplicates */}

            <div className="flex items-center gap-4">
                <button
                    className="lg:hidden text-gray-500 hover:text-[#d90428] transition-colors p-2 hover:bg-gray-50 rounded-lg"
                    onClick={() => toggleSidebar(true)}
                >
                    <Menu size={24} />
                </button>

                <div className="flex items-center gap-2">
                    <div className="md:hidden flex items-center justify-center w-7 h-7 rounded bg-[#d90428] text-white">
                        <ShieldCheck size={16} />
                    </div>
                    <h1 className="text-xs md:text-sm font-bold text-[#0f0f0f] tracking-[0.3em] uppercase hidden sm:block">
                        Operational <span className="text-[#d90428]">Console</span>
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Notification Signal - Updated for Light BG */}
                <button className="relative p-2 text-gray-400 hover:text-[#0f0f0f] hover:bg-gray-50 rounded-full transition-all">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#d90428] rounded-full animate-pulse border-2 border-white"></span>
                </button>

                {/* User Controller - Refined for White BG */}
                <div className="relative">
                    <button
                        className="flex items-center gap-3 pl-3 pr-1 py-1 rounded-full bg-gray-50 border border-gray-200 hover:border-[#d90428]/40 transition-all shadow-sm"
                        onMouseEnter={() => setOpenDropdown(true)}
                        onMouseLeave={() => setOpenDropdown(false)}
                    >
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest hidden md:block">Root_Admin</span>
                        <div className="w-8 h-8 rounded-full bg-[#d90428] flex items-center justify-center text-white shadow-md shadow-[#d90428]/20">
                            <User size={16} strokeWidth={3} />
                        </div>
                    </button>

                    {openDropdown && (
                        <div
                            className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] py-2 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200"
                            onMouseEnter={() => setOpenDropdown(true)}
                            onMouseLeave={() => setOpenDropdown(false)}
                        >
                            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-bold">Encrypted Connection</p>
                                <p className="text-xs text-[#0f0f0f] font-mono truncate">admin_v1.vigilix.io</p>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-[#d90428] text-gray-600 hover:text-white transition-all group"
                            >
                                <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Logout Terminal</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;