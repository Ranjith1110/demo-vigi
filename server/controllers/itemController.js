import Item from "../models/itemModel.js";

// --- HELPER: Safely extract number from ANY Barcode ID (NE-1, N50, Manual-33 etc.) ---
const getLastIdNumber = (barcodeStr) => {
    if (!barcodeStr) return 0;
    // Regex matches the last sequence of digits in the string
    const match = barcodeStr.match(/(\d+)$/); 
    return match ? parseInt(match[0], 10) : 0;
};

// --- HELPER: Find the highest ID number currently in the Database ---
// This prevents duplicates even if the last created item isn't the highest number.
const getNextIdNumber = async () => {
    // Fetch only the barcodeId field from all items (lighter query)
    const allItems = await Item.find({}, { barcodeId: 1 }).lean();
    
    if (allItems.length === 0) return 1;

    // Find the maximum number existing in the DB
    const maxNum = allItems.reduce((max, item) => {
        const num = getLastIdNumber(item.barcodeId);
        return num > max ? num : max;
    }, 0);

    return maxNum + 1;
};

// --- CONTROLLER: Get all items ---
export const getItems = async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- CONTROLLER: Add Single Item ---
export const addItem = async (req, res) => {
    try {
        const { itemNumber, itemName, itemType, retailPrice, salePrice, gst, hsn, stock, mrp } = req.body;

        if (!itemNumber || !itemName || !salePrice) {
            return res.status(400).json({ message: "Item Number, Name, and Sale Price are required." });
        }

        // Round off Sale Price
        const valSalePrice = Math.round(Number(salePrice));
        const valGst = Number(gst) || 0;

        let valMrp = Number(mrp);
        if (!valMrp) {
            valMrp = valSalePrice + (valSalePrice * (valGst / 100));
        }

        // Generate ID based on the absolute highest number in DB
        const nextNum = await getNextIdNumber();
        const newBarcodeId = `NE-${nextNum}`;

        const newItem = new Item({
            barcodeId: newBarcodeId,
            itemNumber,
            itemName,
            itemType: itemType || "General",
            retailPrice: Number(retailPrice) || 0,
            salePrice: valSalePrice,
            mrp: Math.round(valMrp),
            hsn: hsn || "",
            gst: valGst,
            cgst: valGst / 2,
            sgst: valGst / 2,
            stock: Number(stock) || 0
        });

        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        if (error.code === 11000) {
            // Check specifically which field caused the duplicate
            if (error.keyPattern && error.keyPattern.barcodeId) {
                return res.status(400).json({ message: "System Error: Duplicate Barcode ID. Please try again." });
            }
            return res.status(400).json({ message: `Item Number '${itemNumber}' already exists.` });
        }
        res.status(400).json({ message: error.message });
    }
};

// --- CONTROLLER: Bulk Upload ---
export const bulkUpload = async (req, res) => {
    try {
        const itemsData = req.body.items;
        if (!itemsData || itemsData.length === 0) {
            return res.status(400).json({ message: "No items provided" });
        }

        // 1. Get the absolute highest number currently in the DB
        let nextNum = await getNextIdNumber();

        // 2. Process items
        const formattedItems = itemsData.map((item, index) => {
            const valSalePrice = Math.round(Number(item.salePrice) || 0);
            const valGst = Number(item.gst) || 0;

            let valMrp = Number(item.mrp);
            if (!valMrp && valSalePrice > 0) {
                valMrp = valSalePrice + (valSalePrice * (valGst / 100));
            }

            // Assign ID: Start from the safe Max number + current index
            const currentBarcodeId = `N${nextNum + index}`;

            return {
                barcodeId: currentBarcodeId,
                itemNumber: String(item.itemNumber),
                itemName: String(item.itemName),
                itemType: item.itemType || "General",
                hsn: item.hsn || "",
                retailPrice: Number(item.retailPrice) || 0,
                salePrice: valSalePrice,
                mrp: Math.round(valMrp || 0),
                gst: valGst,
                cgst: valGst / 2,
                sgst: valGst / 2,
                stock: Number(item.stock) || 0,
            };
        });

        // 3. Insert into DB
        await Item.insertMany(formattedItems, { ordered: false });
        res.status(201).json({ message: "Bulk upload successful" });

    } catch (error) {
        // 4. Handle Partial Errors (Duplicate Item Numbers)
        if (error.code === 11000) {
            // This happens if the user uploads an Excel file containing an "Item Number" (Manual Code) that already exists.
            return res.status(207).json({ message: "Partial upload success. Some Item Numbers already existed and were skipped." });
        }
        res.status(500).json({ message: error.message });
    }
};

// --- CONTROLLER: Update Item ---
export const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        
        delete updatedData.barcodeId; // Protect BarcodeID

        if (updatedData.gst) {
            updatedData.cgst = Number(updatedData.gst) / 2;
            updatedData.sgst = Number(updatedData.gst) / 2;
        }

        if (updatedData.salePrice) {
            updatedData.salePrice = Math.round(Number(updatedData.salePrice));
        }
        
        // Recalculate MRP if salePrice or GST changed and MRP wasn't explicitly provided/locked
        // (Optional logic, dependent on your UI preference. Keeping it simple as per request)

        const item = await Item.findByIdAndUpdate(id, updatedData, { new: true });
        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- CONTROLLER: Delete Single Item ---
export const deleteItem = async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- CONTROLLER: Delete All Items ---
export const deleteAllItems = async (req, res) => {
    try {
        await Item.deleteMany({});
        res.json({ message: "All items deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting all items: " + error.message });
    }
};

// --- CONTROLLER: Reduce Stock ---
export const reduceStock = async (req, res) => {
    try {
        const { items } = req.body; 

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ message: "Invalid items data" });
        }

        const operations = items.map((item) => ({
            updateOne: {
                filter: { _id: item.itemId },
                update: { $inc: { stock: -item.quantity } } 
            }
        }));

        if (operations.length > 0) {
            await Item.bulkWrite(operations);
        }

        res.status(200).json({ message: "Stock updated successfully" });
    } catch (error) {
        console.error("Stock Update Error:", error);
        res.status(500).json({ message: error.message });
    }
};