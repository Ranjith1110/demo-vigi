import React, { useState, useEffect } from "react";
import { Facebook, Instagram, MessageCircle, ArrowUp } from "lucide-react";
import logo from "/assets/home-hero/logo-white.png";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const Footer = () => {
    const [formData, setFormData] = useState({ name: "", email: "" });
    const [subscribed, setSubscribed] = useState(false);
    const [showScroll, setShowScroll] = useState(false);

    // --- Scroll Listener Logic ---
    useEffect(() => {
        const checkScrollTop = () => {
            if (!showScroll && window.scrollY > 300) {
                setShowScroll(true);
            } else if (showScroll && window.scrollY <= 300) {
                setShowScroll(false);
            }
        };

        window.addEventListener('scroll', checkScrollTop);
        return () => window.removeEventListener('scroll', checkScrollTop);
    }, [showScroll]);

    // --- Scroll to Top Function ---
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubscribe = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) return toast.error("Please enter your name");
        if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Enter a valid email");

        const toastId = toast.loading("Subscribing...");

        try {
            const res = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/subscribe`, formData);

            if (res.status === 200) {
                toast.dismiss(toastId);
                toast.success("Successfully subscribed to newsletter!");

                setSubscribed(true);
                setTimeout(() => setSubscribed(false), 3000);
                setFormData({ name: "", email: "" });
            }
        } catch (err) {
            toast.dismiss(toastId);
            toast.error("Error sending subscription request");
        }
    };

    return (
        <footer className="bg-black text-white mt-16 relative">
            <Toaster position="top-center" reverseOrder={false} />

            {/* --- Floating Action Buttons (Bottom Right) --- */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">

                {/* WhatsApp Floating Button (Always Visible) */}
                <a
                    href="https://wa.me/917869369994?text=Hello,%20I%20would%20like%20to%20get%20in%20touch!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 p-3 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110 text-white flex items-center justify-center"
                    title="Chat on WhatsApp"
                >
                    <MessageCircle size={24} />
                </a>

                {/* Scroll To Top Arrow (Conditionally Visible) */}
                <button
                    onClick={scrollToTop}
                    className={`bg-[#5ce1e6] p-3 rounded-full shadow-lg text-[#03214a] hover:bg-white transition-all duration-300 transform flex items-center justify-center ${showScroll ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                        }`}
                    title="Back to Top"
                >
                    <ArrowUp size={24} />
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

                    {/* About Section */}
                    <div className="md:col-span-4">
                        <img
                            src={logo}
                            alt="NxTEye Logo"
                            className="w-46 h-auto mb-4"
                        />

                        <p className="text-gray-300 leading-relaxed mb-4">
                            NxTEye is a premium optical brand delivering quality eyewear,
                            expert eye care and transparent pricing. Trusted by thousands,
                            we craft eyewear that blends precision with style.
                        </p>

                        <p className="text-gray-400 mb-4">
                            Visit our stores or shop online — we make eyewear effortless.
                        </p>

                        {/* Social Icons */}
                        <div className="flex items-center gap-3">
                            <a className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition" href="https://www.facebook.com/share/17iLTNeCWz/?mibextid=wwXIfr">
                                <Facebook size={18} />
                            </a>
                            <a className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition" href="https://www.instagram.com/nxteye.opticals/">
                                <Instagram size={18} />
                            </a>
                            <a
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                                href="https://wa.me/917869369994?text=Hello,%20I%20would%20like%20to%20get%20in%20touch!"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <MessageCircle size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Inside NxTEye + Policy */}
                    <div className="md:col-span-4 grid grid-cols-2 gap-6">
                        {/* Inside Nxteye */}
                        <div>
                            <h4 className="text-gray-200 font-bold text-sm tracking-wide mb-3">
                                INSIDE NXTEYE
                            </h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a className="hover:text-white transition" href="/">About us</a></li>
                                <li><a className="hover:text-white transition" href="/">Contact us</a></li>
                            </ul>
                        </div>

                        {/* Policy */}
                        <div>
                            <h4 className="text-gray-200 font-bold text-sm tracking-wide mb-3">
                                OUR POLICY
                            </h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a className="hover:text-white transition" href="/terms-conditions">Terms and Conditions</a></li>
                                <li><a className="hover:text-white transition" href="/privacy-policy">Privacy policy</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="md:col-span-4">
                        <h4 className="text-gray-200 font-bold text-sm tracking-wide mb-3">
                            NEWSLETTER
                        </h4>

                        <form onSubmit={handleSubscribe} className="space-y-3">
                            <input
                                type="text"
                                name="name"
                                placeholder="Your name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-md bg-transparent border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5ce1e6]/40"
                                required
                            />

                            <input
                                type="email"
                                name="email"
                                placeholder="Your email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-md bg-transparent border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5ce1e6]/40"
                                required
                            />

                            <button
                                type="submit"
                                className="w-full px-4 py-3 rounded-md bg-[#5ce1e6] text-[#03214a] font-semibold hover:opacity-90 transition"
                            >
                                {subscribed ? "Subscribed!" : "Subscribe"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm gap-4">

                    <p>© {new Date().getFullYear()} NxTEye. All rights reserved.</p>

                    {/* Center highlight */}
                    <p className="font-medium">
                        Developed By{" "}
                        <a
                            href="https://vigilixhub.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-linear-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent hover:underline transition"
                        >
                            VigiluxHub
                        </a>
                    </p>

                    <div className="flex items-center gap-6">
                        <a className="hover:text-white transition" href="/privacy-policy">Privacy</a>
                        <a className="hover:text-white transition" href="/terms-conditions">Terms</a>
                    </div>
                </div>
            </div>
        </footer >
    );
};

export default Footer;