import express from "express";
import { 
    getInvoiceNumber, 
    submitBill, 
    getAllBills, 
    updateOrderStatus,
    deleteBill,
    updateBill // Import the new function
} from "../controllers/billingController.js";

const router = express.Router();

router.get("/invoice-number", getInvoiceNumber);
router.post("/submit", submitBill);
router.put("/update/:id", updateBill); // Added update route
router.get("/all", getAllBills);
router.put("/status/:id", updateOrderStatus);
router.delete("/delete/:id", deleteBill);

export default router;