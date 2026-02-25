import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex bg-gray-100 min-h-screen">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col ml-0 lg:ml-64 transition-all duration-300">
                <Navbar toggleSidebar={toggleSidebar} />
                <main className="flex-1 p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
};

export default Layout;
