import express from "express";
import { 
    createPurchaseBill, 
    getAllPurchaseBills, 
    updatePurchaseBill, // Import this
    deletePurchaseBill 
} from "../controllers/purchaseBillController.js";

const router = express.Router();

router.post("/add", createPurchaseBill);
router.get("/all", getAllPurchaseBills);
router.put("/update/:id", updatePurchaseBill); // --- ADDED THIS LINE ---
router.delete("/delete/:id", deletePurchaseBill);

export default router;