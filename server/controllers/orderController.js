import Order from "../models/orderModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const createOrder = async (req, res) => {
    try {
        console.log("📩 Received Order Request:", req.body); // LOG THE INCOMING DATA

        const { customer, items, totalAmount } = req.body;

        // 1. Validation
        if (!customer || !items || items.length === 0) {
            return res.status(400).json({ message: "Missing customer details or items" });
        }

        // 2. Save Order to Database
        const newOrder = new Order({
            customer,
            items,
            totalAmount
        });

        const savedOrder = await newOrder.save();
        console.log("✅ Order Saved to DB:", savedOrder._id);

        // 3. Email Configuration
        // IF YOU DON'T HAVE EMAIL CREDENTIALS, THIS BLOCK WILL FAIL
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS // MUST be App Password, not login password
                    }
                });

                // Generate HTML for Items
                const itemsHtml = items.map(item => 
                    `<tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.brand}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.details}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">₹${item.price}</td>
                     </tr>`
                ).join('');

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: process.env.ADMIN_EMAIL, // Admin receives the order
                    cc: customer.email,          // Customer gets a copy
                    subject: `New Order #${savedOrder._id} - NxtEye Optical`,
                    html: `
                        <h2>New Order Received</h2>
                        <p><strong>Customer:</strong> ${customer.name}</p>
                        <p><strong>Phone:</strong> ${customer.phone}</p>
                        <p><strong>Address:</strong> ${customer.address}</p>
                        
                        <h3>Order Details:</h3>
                        <table style="border-collapse: collapse; width: 100%;">
                            <thead>
                                <tr style="background-color: #f2f2f2;">
                                    <th style="padding: 8px; border: 1px solid #ddd;">Product</th>
                                    <th style="padding: 8px; border: 1px solid #ddd;">Details</th>
                                    <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                        
                        <h3 style="text-align: right;">Total: ₹${totalAmount}</h3>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log("✅ Email Sent Successfully");
            } catch (emailError) {
                console.error("⚠️ Email Failed to Send:", emailError.message);
                // We do NOT return an error here, because the order WAS saved.
                // We just log it so the user knows email didn't work.
            }
        } else {
            console.log("⚠️ Email credentials missing in .env, skipping email.");
        }

        // 4. Success Response
        res.status(201).json({ 
            message: "Order placed successfully!", 
            orderId: savedOrder._id,
            emailStatus: process.env.EMAIL_USER ? "Sent" : "Skipped (No Config)" 
        });

    } catch (error) {
        console.error("❌ CRITICAL ERROR in createOrder:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};