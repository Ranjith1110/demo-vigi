import express from "express";
import Customer from "../models/customerModel.js";

const router = express.Router();

// --- GET Customers (Search & Filter Logic) ---
router.get("/", async (req, res) => {
    try {
        const { search, purpose, startDate, endDate, page = 1, limit = 20 } = req.query;
        
        let query = {};

        if (search) {
            query.$or = [
                { customerName: { $regex: search, $options: "i" } },
                { mobileNumber: { $regex: search } }
            ];
        }

        if (purpose) {
            query.purposeOfVisit = { $regex: `^${purpose}$`, $options: "i" };
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const skip = (page - 1) * limit;

        const customers = await Customer.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip);

        const total = await Customer.countDocuments(query);

        res.status(200).json({
            customers,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- GET Single Customer by Mobile (For Auto-fill) ---
router.get("/mobile/:mobileNumber", async (req, res) => {
    try {
        const { mobileNumber } = req.params;
        const customer = await Customer.findOne({ mobileNumber });

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const lastClinicalEntry = customer.clinicalHistory && customer.clinicalHistory.length > 0
            ? customer.clinicalHistory[customer.clinicalHistory.length - 1]
            : null;

        res.status(200).json({ customer, lastClinicalEntry });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- POST: Save Customer Info & APPEND Clinical Entry ---
router.post("/", async (req, res) => {
    try {
        const {
            customerName, mobileNumber, age, gender, dob, address, purposeOfVisit,
            clinicalEntry 
        } = req.body;

        if (!customerName || !mobileNumber) {
            return res.status(400).json({ message: "Customer Name and Mobile are required" });
        }

        let customer = await Customer.findOne({ mobileNumber });

        if (customer) {
            customer.customerName = customerName;
            customer.age = age || customer.age; // Update Age
            customer.gender = gender || customer.gender;
            customer.dob = dob || customer.dob;
            customer.address = address || customer.address;
            customer.purposeOfVisit = purposeOfVisit || customer.purposeOfVisit;

            if (clinicalEntry) {
                customer.clinicalHistory.push(clinicalEntry);
            }

            await customer.save();
            res.status(200).json({ message: "Clinical Entry Added to History", customer });
        } else {
            customer = new Customer({
                customerName,
                mobileNumber,
                age, // Save Age
                gender,
                dob,
                address,
                purposeOfVisit,
                clinicalHistory: clinicalEntry ? [clinicalEntry] : []
            });
            await customer.save();
            res.status(201).json({ message: "New Customer Created", customer });
        }

    } catch (error) {
        console.error("Customer Save Error:", error);
        res.status(500).json({ message: "Error saving data", error: error.message });
    }
});

export default router;