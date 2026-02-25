import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    // New Unique Primary ID (Auto-generated)
    barcodeId: { type: String, required: true, unique: true },

    // Existing "Item Number" (can act as SKU or Manual Code)
    itemNumber: { type: String, required: true }, 
    
    itemName: { type: String, required: true },
    itemType: { type: String, default: "General" },
    
    // Pricing Fields
    retailPrice: { type: Number, default: 0 }, 
    salePrice: { type: Number, required: true }, 
    mrp: { type: Number, required: true }, 
    
    // Tax & Stock
    hsn: { type: String, default: "" },
    gst: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);
export default Item;