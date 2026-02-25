import mongoose from "mongoose";

const purchaseBillSchema = new mongoose.Schema(
  {
    vendor: {
      vendorName: { type: String, required: true },
      address: { type: String },
      gstin: { type: String },
      purchaseDate: { type: String, required: true },
      invoiceNumber: { type: String, required: true },
    },
    items: [
      {
        itemName: { type: String, required: true },
        itemType: { type: String },
        hsn: { type: String },
        itemPrice: { type: Number, required: true },
        stock: { type: Number, required: true },
        
        // --- Added Discount Field ---
        discount: { type: Number, default: 0 }, 
        
        gstPercent: { type: Number, default: 0 },
        cgstPercent: { type: Number, default: 0 },
        sgstPercent: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        netAmount: { type: Number, required: true },
      },
    ],
    grandTotal: { type: Number, required: true },
  },
  { timestamps: true }
);

const PurchaseBill = mongoose.model("PurchaseBill", purchaseBillSchema);

export default PurchaseBill;