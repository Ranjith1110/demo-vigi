import OrderSummary from "../models/orderSummaryModel.js";

// --- Helper: Generate Invoice Number ---
const generateInvoiceNumber = async () => {
    const count = await OrderSummary.countDocuments();
    const nextNum = (count + 1).toString().padStart(4, "0");
    return `NE-${nextNum}`;
};

export const getInvoiceNumber = async (req, res) => {
    try {
        const invoiceNo = await generateInvoiceNumber();
        res.status(200).json({ invoiceNo });
    } catch (error) {
        res.status(500).json({ message: "Error generating invoice number" });
    }
};

// --- Controller: Submit Bill ---
export const submitBill = async (req, res) => {
    try {
        let {
            invoiceNo,
            date,
            customer,
            items,
            subTotal,
            totalCgstAmount,
            totalSgstAmount,
            discountPercent,
            discountAmount,
            paymentCash,
            paymentUPI,
            paymentCard,
            advance,
            remaining,
            grandTotal,
            deliveryDate,
            orderStatus
        } = req.body;

        if (!invoiceNo) {
            invoiceNo = await generateInvoiceNumber();
        }

        if (!customer || !items || items.length === 0) {
            return res.status(400).json({ message: "Missing items or customer data" });
        }

        const calculatedAdvance = Number(paymentCash || 0) + Number(paymentUPI || 0) + Number(paymentCard || 0);
        const finalAdvance = advance !== undefined ? advance : calculatedAdvance;

        const newOrder = new OrderSummary({
            invoiceNo,
            date,
            customer,
            items,
            subTotal,
            totalCgstAmount,
            totalSgstAmount,
            discountPercent,
            discountAmount,
            paymentCash: paymentCash || 0,
            paymentUPI: paymentUPI || 0,
            paymentCard: paymentCard || 0,
            advance: finalAdvance, 
            remaining,
            grandTotal,
            deliveryDate,
            orderStatus
        });

        await newOrder.save();
        res.status(201).json({ message: "Bill Saved Successfully", order: newOrder });

    } catch (error) {
        console.error("Billing Submit Error:", error);
        res.status(500).json({ message: "Failed to save bill", error: error.message });
    }
};

// --- Controller: Update Bill (NEW) ---
export const updateBill = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Recalculate advance if payment details changed
        const calculatedAdvance = Number(updateData.paymentCash || 0) + Number(updateData.paymentUPI || 0) + Number(updateData.paymentCard || 0);
        updateData.advance = calculatedAdvance;

        const updatedOrder = await OrderSummary.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true } // Return the updated document
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Bill Updated Successfully", order: updatedOrder });
    } catch (error) {
        console.error("Billing Update Error:", error);
        res.status(500).json({ message: "Failed to update bill", error: error.message });
    }
};

// --- Controller: Get All Bills ---
export const getAllBills = async (req, res) => {
    try {
        const { type } = req.query;
        let query = {};

        if (type === "delivered") {
            query = { "orderStatus.delivered": true };
        } else if (type === "ordered") {
            query = { 
                "orderStatus.ordered": true, 
                "orderStatus.delivered": false 
            };
        }

        const orders = await OrderSummary.find(query).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bills" });
    }
};

// --- Controller: Update Order Status (Mark as Delivered) ---
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, paymentMethod } = req.body; 

        const updatedOrder = await OrderSummary.findByIdAndUpdate(
            id,
            { 
                $set: { 
                    "orderStatus.delivered": status === 'delivered',
                    ...(paymentMethod && { paymentMethod }) 
                } 
            },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Status Updated", order: updatedOrder });
    } catch (error) {
        res.status(500).json({ message: "Failed to update status" });
    }
};

// --- Controller: Delete Bill ---
export const deleteBill = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedOrder = await OrderSummary.findByIdAndDelete(id);

        if (!deletedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete order" });
    }
};