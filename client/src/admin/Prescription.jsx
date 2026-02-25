import React, { useState } from "react";
import Layout from "../components/dashboard/Layout";
import { RefreshCw } from 'lucide-react';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_APP_BASE_URL;

const Prescription = () => {
    const [form, setForm] = useState({
        date: "",
        eyeTestType: "",
        customerType: "",
        name: "",
        mobile: "",
        gender: "",
        dob: "",
        address: "", // <--- Added State
        purposeOfVisit: "",
        left: {
            SPH: "00", CYL: "00", AXIS: "90", ADD: "1.75", PD: "32.5", DistanceVA: "6/18", NearVA: "N10",
        },
        right: {
            SPH: "00", CYL: "00", AXIS: "90", ADD: "1.75", PD: "32.5", DistanceVA: "6/18", NearVA: "N10",
        },
    });

    const [errors, setErrors] = useState({});

    // --- GENERATORS (Same as before) ---
    const generateSphCylValues = () => {
        const values = [];
        for (let i = 80; i >= 1; i--) values.push(`-${(i / 4).toFixed(2)}`);
        values.push("00");
        for (let i = 1; i <= 80; i++) values.push(`+${(i / 4).toFixed(2)}`);
        return values;
    };
    const generateAddValues = () => {
        const values = [];
        for (let i = 0.25; i <= 3.5; i += 0.25) values.push(i.toFixed(2));
        return values;
    };
    const generatePDValues = () => {
        const values = [];
        for (let i = 25; i <= 40; i += 0.5) values.push(i.toFixed(1));
        return values;
    };

    const SPH_CYL_Values = generateSphCylValues();
    const ADD_Values = generateAddValues();
    const AXIS_Values = Array.from({ length: 37 }, (_, i) => i * 5);
    const PD_Values = generatePDValues();
    const DistanceVA_Values = ["6/60", "6/36", "6/24", "6/18", "6/12", "6/9", "6/6"];
    const NearVA_Values = ["N32", "N18", "N12", "N10", "N8", "N6", "N5"];

    const SelectInput = ({ label, name, eye }) => {
        const isEyeField = true;
        return (
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
                <select
                    name={name}
                    value={form[eye][name]}
                    onChange={e => {
                        setForm({ ...form, [eye]: { ...form[eye], [name]: e.target.value } });
                        setErrors(prev => ({ ...prev, [name]: "" }));
                    }}
                    className="w-full border rounded-md px-3 py-2"
                >
                    {!isEyeField && <option value="">Select</option>}
                    {(label === "SPH" || label === "CYL") && SPH_CYL_Values.map((v, i) => <option key={i} value={v}>{v}</option>)}
                    {label === "AXIS" && AXIS_Values.map((v, i) => <option key={i} value={v}>{v}</option>)}
                    {label === "ADD" && ADD_Values.map((v, i) => <option key={i} value={v}>{v}</option>)}
                    {label === "PD" && PD_Values.map((v, i) => <option key={i} value={v}>{v}</option>)}
                    {label === "Distance VA" && DistanceVA_Values.map((v, i) => <option key={i} value={v}>{v}</option>)}
                    {label === "Near VA" && NearVA_Values.map((v, i) => <option key={i} value={v}>{v}</option>)}
                </select>
                {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
            </div>
        );
    };

    const handleReset = () => {
        setForm({
            date: "",
            eyeTestType: "",
            customerType: "",
            name: "",
            mobile: "",
            gender: "",
            dob: "",
            address: "", // <--- Reset Address
            purposeOfVisit: "",
            left: { SPH: "00", CYL: "00", AXIS: "90", ADD: "1.75", PD: "32.5", DistanceVA: "6/18", NearVA: "N10" },
            right: { SPH: "00", CYL: "00", AXIS: "90", ADD: "1.75", PD: "32.5", DistanceVA: "6/18", NearVA: "N10" },
        });
        setErrors({});
    };

    const handleResetCustomerInfo = () => {
        setForm(prevForm => ({
            ...prevForm,
            name: "",
            mobile: "",
            gender: "",
            dob: "",
            address: "", // <--- Reset Address
            purposeOfVisit: "",
        }));
        setErrors(prevErrors => ({
            ...prevErrors,
            name: "",
            mobile: "",
            gender: "",
            dob: "",
            purposeOfVisit: ""
        }));
    };

    const handleSaveCustomer = async () => {
        if (!form.name || !form.mobile) {
            return toast.warn("Enter customer name & mobile number");
        }

        const customerData = {
            customerName: form.name,
            mobileNumber: form.mobile,
            gender: form.gender,
            dob: form.dob,
            address: form.address, // <--- Save Address
            purposeOfVisit: form.purposeOfVisit
        };

        try {
            const res = await fetch(`${API_URL}/api/customers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(customerData),
            });

            if (res.status === 409) {
                toast.warn("Customer with this mobile number already exists.");
            } else if (res.ok) {
                toast.success("Customer saved successfully!");
            } else {
                throw new Error("Failed to save customer");
            }
        } catch (error) {
            console.error("Save Customer Error:", error);
            toast.error("Error saving customer info");
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.date) newErrors.date = "Please select the eye checkup date.";
        if (!form.eyeTestType) newErrors.eyeTestType = "Please select the test type.";
        if (!form.customerType) newErrors.customerType = "Please select the customer type.";
        if (!form.name.trim()) newErrors.name = "Please enter the customer's name.";
        if (!form.mobile) newErrors.mobile = "Please enter the mobile number.";
        if (form.mobile && !/^\d{10}$/.test(form.mobile)) newErrors.mobile = "Please enter a valid 10-digit number.";
        if (!form.gender) newErrors.gender = "Please select gender.";
        if (!form.dob) newErrors.dob = "Please select the date of birth.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (!validateForm()) return;

        let whatsappNumber = form.mobile.replace(/[^0-9]/g, "");
        if (whatsappNumber.length === 10) whatsappNumber = "91" + whatsappNumber;

        // <--- Updated WhatsApp Message with Address --->
        const msg = `
            *NxtEye Optical - Eye Checkup Report*

            ━━━━━━━━━━━━━━━━━━━
            *Date:* ${form.date}
            *Test Type:* ${form.eyeTestType}
            *Name:* ${form.name}
            *Mobile:* ${form.mobile}
            *Gender:* ${form.gender}
            *DOB:* ${form.dob}
            *Address:* ${form.address || "N/A"}
            ━━━━━━━━━━━━━━━━━━━

            *LEFT EYE*
            • SPH: ${form.left.SPH}
            • CYL: ${form.left.CYL}
            • AXIS: ${form.left.AXIS}
            • ADD: ${form.left.ADD}
            • PD: ${form.left.PD}
            • Distance VA: ${form.left.DistanceVA}
            • Near VA: ${form.left.NearVA}

            *RIGHT EYE*
            • SPH: ${form.right.SPH}
            • CYL: ${form.right.CYL}
            • AXIS: ${form.right.AXIS}
            • ADD: ${form.right.ADD}
            • PD: ${form.right.PD}
            • Distance VA: ${form.right.DistanceVA}
            • Near VA: ${form.right.NearVA}
            ━━━━━━━━━━━━━━━━━━━

            *Thank you for trusting NxtEye Optical!* Your vision, our care
            _Stay Clear. Stay Confident._
            `;

        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg.trim())}`;
        window.open(url, "_blank");
    };

    return (
        <Layout>
            <ToastContainer position="top-right" autoClose={2000} />

            <form onSubmit={handleSubmit} onReset={handleReset} className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Eye Checkup Entry Form</h2>

                {/* Customer Info */}
                <section className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                    <h3 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Customer Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => { setForm({ ...form, name: e.target.value }); setErrors(prev => ({ ...prev, name: "" })); }}
                                className="w-full border rounded-md px-3 py-2"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Mobile Number</label>
                            <input
                                type="text"
                                value={form.mobile}
                                onChange={e => { setForm({ ...form, mobile: e.target.value }); setErrors(prev => ({ ...prev, mobile: "" })); }}
                                className="w-full border rounded-md px-3 py-2"
                            />
                            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Purpose of Visit</label>
                            <select
                                value={form.purposeOfVisit}
                                onChange={e => { setForm({ ...form, purposeOfVisit: e.target.value }); setErrors(prev => ({ ...prev, purposeOfVisit: "" })); }}
                                className="w-full border rounded-md px-3 py-2"
                            >
                                <option value="">Select Purpose</option>
                                <option value="Purchase">Purchase</option>
                                <option value="Inquiry">Inquiry</option>
                                <option value="Service/Repair">Service/Repair</option>
                                <option value="Browsing">Browsing</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                            <select
                                value={form.gender}
                                onChange={e => { setForm({ ...form, gender: e.target.value }); setErrors(prev => ({ ...prev, gender: "" })); }}
                                className="w-full border rounded-md px-3 py-2"
                            >
                                <option value="">Select Gender</option>
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">DOB</label>
                            <input
                                type="date"
                                value={form.dob}
                                onChange={e => { setForm({ ...form, dob: e.target.value }); setErrors(prev => ({ ...prev, dob: "" })); }}
                                className="w-full border rounded-md px-3 py-2"
                            />
                            {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                        </div>

                        {/* --- NEW ADDRESS INPUT --- */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                            <input
                                type="text"
                                value={form.address}
                                placeholder="City / Street / Area"
                                onChange={e => { setForm({ ...form, address: e.target.value }); }}
                                className="w-full border rounded-md px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button type="button" onClick={handleSaveCustomer} className="bg-[#5ce1e6] text-[#03214a] px-4 py-2 rounded-full font-medium hover:bg-[#03214a] hover:text-white transition">
                            Save Customer
                        </button>
                        <button type="button" onClick={handleResetCustomerInfo} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-300 transition">
                            <RefreshCw size={16} />
                            Reset Info
                        </button>
                    </div>
                </section>

                {/* Appointment Details */}
                <section className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                    <h3 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Appointment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Eye Checkup Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => { setForm({ ...form, date: e.target.value }); setErrors(prev => ({ ...prev, date: "" })); }}
                                className="w-full border rounded-md px-3 py-2"
                            />
                            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Eye Test Type</label>
                            <select
                                value={form.eyeTestType}
                                onChange={e => { setForm({ ...form, eyeTestType: e.target.value }); setErrors(prev => ({ ...prev, eyeTestType: "" })); }}
                                className="w-full border rounded-md px-3 py-2"
                            >
                                <option value="">Select</option>
                                <option>Vision</option>
                                <option>Color</option>
                                <option>Complete</option>
                            </select>
                            {errors.eyeTestType && <p className="text-red-500 text-sm mt-1">{errors.eyeTestType}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Customer Type</label>
                            <select
                                value={form.customerType}
                                onChange={e => { setForm({ ...form, customerType: e.target.value }); setErrors(prev => ({ ...prev, customerType: "" })); }}
                                className="w-full border rounded-md px-3 py-2"
                            >
                                <option value="">Select</option>
                                <option>New</option>
                                <option>Returning</option>
                            </select>
                            {errors.customerType && <p className="text-red-500 text-sm mt-1">{errors.customerType}</p>}
                        </div>
                    </div>
                </section>

                {/* Eye Test Readings */}
                <section className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                    <h3 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Eye Test Readings</h3>
                    <h4 className="font-semibold mt-4 mb-2">Left Eye:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                        {["SPH", "CYL", "AXIS", "ADD", "PD", "Distance VA", "Near VA"].map((f, i) => (
                            <SelectInput key={i} label={f} name={f.replace(" ", "")} eye="left" />
                        ))}
                    </div>
                    <h4 className="font-semibold mt-6 mb-2">Right Eye:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                        {["SPH", "CYL", "AXIS", "ADD", "PD", "Distance VA", "Near VA"].map((f, i) => (
                            <SelectInput key={i} label={f} name={f.replace(" ", "")} eye="right" />
                        ))}
                    </div>
                </section>

                {/* Buttons */}
                <div className="flex justify-end mt-8 gap-4">
                    <button type="reset" className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-300 transition">
                        <RefreshCw size={16} />
                        Reset Full Form
                    </button>
                    <button type="submit" className="px-6 py-2 bg-[#5ce1e6] text-[#03214a] rounded-full font-medium hover:bg-[#03214a] hover:text-white transition">
                        Send Report via WhatsApp
                    </button>
                </div>
            </form>
        </Layout>
    );
};

export default Prescription;