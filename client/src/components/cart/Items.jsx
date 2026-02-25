import React, { useState } from 'react';
// GO UP TWO LEVELS to find context: src/components/cart/ -> src/components/ -> src/
import { useCart } from '../../context/CartContext';
import { Trash2, ArrowLeft, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// 1. Import React Hot Toast
import toast, { Toaster } from 'react-hot-toast';

// Safe API URL with fallback
const API_URL = import.meta.env.VITE_APP_BASE_URL;

const Items = () => {
    // Get Cart Data & Functions from Context
    const { cartItems, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();

    // Local State for Modal & Form
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    // Calculate Total Price
    const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);

    // Handle Form Input Change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Place Order
    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setLoading(true);

        // 2. Start Loading Toast
        const toastId = toast.loading("Processing your order...");

        const orderPayload = {
            customer: formData,
            items: cartItems,
            totalAmount: totalPrice
        };

        try {
            console.log("Sending Order:", orderPayload);

            const res = await fetch(`${API_URL}/api/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderPayload)
            });

            const data = await res.json();

            // 3. Dismiss Loading Toast
            toast.dismiss(toastId);

            if (res.ok) {
                // SUCCESS: Order placed
                toast.success("Order Placed Successfully!");

                // --- CRITICAL: CLEAR CART HERE ---
                if (clearCart) {
                    clearCart();
                } else {
                    console.error("clearCart function is missing from Context!");
                }

                // Close Modal
                setIsCheckoutOpen(false);

                // Redirect to Home after 2.5 seconds
                setTimeout(() => {
                    navigate('/');
                }, 2500);

            } else {
                console.error("Backend Error:", data);
                toast.error(data.message || "Failed to place order.");
            }
        } catch (error) {
            toast.dismiss(toastId); // Dismiss loading on network error too
            console.error("Network Error:", error);
            toast.error("Unable to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-12 px-4 md:px-8 mt-20 min-h-screen bg-gray-50 relative">
            {/* 4. Add the Toaster Component */}
            <Toaster position="top-center" reverseOrder={false} />

            <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-[#03214a] mb-8">Shopping Cart</h2>

                {cartItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-xl font-medium text-gray-600 mb-4">Your cart is currently empty.</h3>
                        <Link to="/" className="inline-flex items-center gap-2 text-teal-600 font-bold hover:underline">
                            <ArrowLeft size={18} /> Go back to shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item, index) => (
                                <div key={`${item.id}-${index}`} className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition hover:shadow-md">
                                    <div className="w-24 h-24 shrink-0 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center p-2">
                                        <img
                                            src={item.image}
                                            alt={item.brand}
                                            onError={(e) => e.target.src = "https://via.placeholder.com/150"}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>

                                    <div className="grow text-center sm:text-left">
                                        <h3 className="font-bold text-gray-800 text-lg">{item.brand}</h3>
                                        <p className="text-gray-500 text-sm">{item.details}</p>
                                        <p className="text-teal-600 font-bold mt-1 text-lg">₹{item.price}</p>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-3 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                        title="Remove item"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary Box */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                                <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Order Summary</h3>
                                <div className="flex justify-between mb-3 text-gray-600">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span>₹{totalPrice}</span>
                                </div>
                                <div className="flex justify-between mb-4 text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-teal-600 font-bold">Free</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between font-bold text-2xl text-gray-900 mb-6">
                                    <span>Total</span>
                                    <span>₹{totalPrice}</span>
                                </div>
                                <button
                                    onClick={() => setIsCheckoutOpen(true)}
                                    className="w-full bg-[#03214a] text-white py-3.5 rounded-lg font-bold hover:bg-blue-900 transition-colors shadow-lg active:scale-95"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- CHECKOUT MODAL --- */}
            {isCheckoutOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in relative">

                        {/* Header */}
                        <div className="bg-[#03214a] p-4 flex justify-between items-center text-white">
                            <h3 className="text-lg font-bold">Checkout Details</h3>
                            <button onClick={() => setIsCheckoutOpen(false)} className="hover:text-gray-300 transition">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handlePlaceOrder} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="9876543210"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                                <textarea
                                    name="address"
                                    required
                                    rows="3"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Street, City, Pincode"
                                ></textarea>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#5ce1e6] text-[#03214a] font-bold py-3 rounded-lg hover:bg-[#4bcacad0] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                >
                                    {loading ? (
                                        <span className="animate-pulse">Processing...</span>
                                    ) : (
                                        `Confirm Order - ₹${totalPrice}`
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Items;