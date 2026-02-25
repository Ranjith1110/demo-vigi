import mongoose from "mongoose";

const clinicalEntrySchema = new mongoose.Schema({
    visitDate: String,
    testType: String,
    appointmentDetails: Object,
    readings: Object,
}, { _id: true });

const customerSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
    age: { type: String }, // Added Age field
    gender: { type: String },
    dob: { type: String },
    address: { type: String },
    purposeOfVisit: { type: String },
    
    clinicalHistory: [clinicalEntrySchema], 
    
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Customer", customerSchema);