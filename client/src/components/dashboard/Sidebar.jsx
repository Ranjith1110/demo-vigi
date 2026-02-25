import React from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
    Home,
    FileText,
    ClipboardList,
    Clock,
    X,
    Users,
    PackageCheck,
    Boxes,
    PackagePlus,
    LogOut,
    Shield
} from "lucide-react";
import toast from "react-hot-toast";

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear auth state immediately
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        toast.success("Terminal Session Terminated");

        setTimeout(() => {
            navigate("/login");
        }, 1000);
    };

    const menuItems = [
        { name: "Dashboard", icon: <Home size={18} />, path: "/dashboard" },
        { name: "Inventory Items", icon: <Boxes size={18} />, path: "/items" },
        { name: "Purchase Bill", icon: <FileText size={18} />, path: "/purchase-bill" },
        { name: "Order Summary", icon: <ClipboardList size={18} />, path: "/order-summary" },
        { name: "Ordered", icon: <PackageCheck size={18} />, path: "/ordered" },
        { name: "Delivered", icon: <Clock size={18} />, path: "/delivered" },
        { name: "Customer Index", icon: <Users size={18} />, path: "/customer-list" },
        { name: "GST Reporting", icon: <FileText size={18} />, path: "/gst-file" },
        { name: "Stock Control", icon: <PackagePlus size={18} />, path: "/stock-management" },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-40 transition-opacity"
                    onClick={() => toggleSidebar(false)}
                ></div>
            )}

            <aside
                className={`fixed top-0 left-0 z-50 h-screen bg-[#0f0f0f] border-r border-white/5 flex flex-col justify-between w-64 transition-all duration-500 ease-in-out
                ${isOpen ? "translate-x-0 shadow-[20px_0_50px_rgba(0,0,0,0.5)]" : "-translate-x-full lg:translate-x-0"}`}
            >
                <div>
                    {/* Header / Logo Section */}
                    <div className="p-6 flex items-center justify-between border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                        <Link to="/" className="flex items-center gap-2 group bg-white p-1 rounded-md">
                            {/* <div className="w-8 h-8 rounded bg-[#d90428] flex items-center justify-center shadow-lg shadow-[#d90428]/20 group-hover:scale-110 transition-transform">
                                <Shield size={18} className="text-white" />
                            </div>
                            <span className="text-lg font-bold text-white tracking-tighter italic uppercase">
                                VIGILIX<span className="text-[#d90428]">HUB</span>
                            </span> */}
                            <img src="/logo.png" alt="" />
                        </Link>
                        <button
                            className="lg:hidden text-gray-500 hover:text-white transition"
                            onClick={() => toggleSidebar(false)}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex flex-col p-4 mt-4 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] px-3 mb-2">Main Terminal</p>
                        {menuItems.map((item, index) => (
                            <NavLink
                                key={index}
                                to={item.path}
                                onClick={() => toggleSidebar(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${isActive
                                        ? "bg-[#d90428] text-white shadow-lg shadow-[#d90428]/20"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`
                                }
                            >
                                <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                                <span className="tracking-wide">{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Bottom Section */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-red-500/10 hover:text-[#d90428] transition-all duration-300 w-full group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="uppercase tracking-widest text-[11px]">Terminate Session</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;