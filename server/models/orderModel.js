import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
    },
    items: [
        {
            brand: String,
            details: String,
            price: Number,
            qty: { type: Number, default: 1 },
            id: String, // Product ID
            image: String // Store image URL just in case
        }
    ],
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' }, // Pending, Shipped, Delivered
    
    // --- UPDATED FIELD ---
    // Removed Enum to allow "Split (Cash: 100, UPI: 200)" strings
    paymentMethod: { type: String, default: 'Other' } 
});

export default mongoose.model("Order", orderSchema);