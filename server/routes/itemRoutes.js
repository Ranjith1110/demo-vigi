import express from "express";
import {
    getItems,
    addItem,
    bulkUpload,
    updateItem,
    deleteItem,
    deleteAllItems,
    reduceStock // Imported new controller
} from "../controllers/itemController.js";

const router = express.Router();

// Get all items
router.get("/", getItems);

// Add a single item
router.post("/", addItem);

// Bulk upload items
router.post("/bulk", bulkUpload);

// NEW: Reduce Stock (Call this after billing success)
router.post("/reduce-stock", reduceStock);

// Delete All Items (Must be before /:id)
router.delete("/delete-all", deleteAllItems);

// Update/Edit an item
router.put("/:id", updateItem);

// Delete a single item
router.delete("/:id", deleteItem);

export default router;