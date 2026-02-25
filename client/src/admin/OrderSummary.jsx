import React, { useState, useEffect, useRef } from "react";
import Layout from "../components/dashboard/Layout";
import { Plus, Trash2, RefreshCw, Save, Glasses, Eye, Printer, MessageCircle, X } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom"; 

const API_URL = import.meta.env.VITE_APP_BASE_URL;

// --- OPTICAL CONSTANTS & GENERATORS ---

const generateRange = (start, end, step, prefix = "") => {
    const vals = [];
    for (let i = start; i <= end; i += step) {
        vals.push(`${prefix}${i.toFixed(2)}`);
    }
    return vals;
};

// 1. GENERATE SPH/CYL
const negatives = [];
for (let i = 20.00; i >= 0.25; i -= 0.25) {
    negatives.push(`-${i.toFixed(2)}`);
}
const positives = generateRange(0.25, 20.00, 0.25, "+");
const SPH_CYL_Values = [...negatives, "0.00", ...positives];

// 2. GENERATE ADD
const ADD_Values = ["0.00", ...generateRange(0.25, 4.0, 0.25, "+")];

// 3. AXIS
const AXIS_Values = Array.from({ length: 37 }, (_, i) => (i * 5).toString());

// 4. PD
const PD_Values = Array.from(
    { length: ((40 - 25) / 0.5) + 1 },
    (_, i) => (25 + i * 0.5).toFixed(1)
);

// 5. VA VALUES
const D_VA_Values = ["6/6", "6/9", "6/12", "6/18", "6/24", "6/36", "6/60"];
const N_VA_Values = ["N6", "N8", "N10", "N12"];

// Updated: Rounds off amount and removes decimal points
const safeAmount = (value) => {
    const num = Number(value);
    return isNaN(num) ? "0" : Math.round(num).toString();
};

const numberToWords = (num) => {
    if (num < 0) return "Negative Amount";
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if ((num = num.toString()).length > 9) return 'Overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only ' : '';
    return str || 'Zero Only';
};

const convertAmountToWords = (amount) => {
    if (!amount || amount < 0) return "Zero Only";
    // Round first, then convert integer part
    const roundedAmount = Math.round(amount);
    return numberToWords(roundedAmount);
};

// --- CUSTOM SEARCHABLE DROPDOWN COMPONENT ---
const SearchableSelect = ({ value, options, onChange, placeholder = "Select" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        String(opt).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (opt) => {
        onChange(opt);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <input
                type="text"
                className="w-full border p-1 text-xs rounded text-center bg-white focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer"
                value={isOpen ? searchTerm : value}
                placeholder={value || placeholder}
                onFocus={() => { setIsOpen(true); setSearchTerm(""); }}
                onChange={(e) => { setIsOpen(true); setSearchTerm(e.target.value); }}
            />
            {isOpen && (
                <ul className="absolute z-50 w-full max-h-48 overflow-y-auto bg-white border border-gray-300 rounded shadow-lg mt-1 custom-scrollbar">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt, idx) => (
                            <li
                                key={idx}
                                className={`p-1.5 text-xs text-center cursor-pointer hover:bg-blue-100 transition-colors ${opt === value ? "bg-blue-50 font-bold text-blue-700" : "text-gray-700"}`}
                                onClick={() => handleSelect(opt)}
                            >
                                {opt}
                            </li>
                        ))
                    ) : (
                        <li className="p-2 text-xs text-gray-400 text-center">No match</li>
                    )}
                </ul>
            )}
        </div>
    );
};

const OrderSummary = () => {
    const location = useLocation(); 

    const [invoiceNo, setInvoiceNo] = useState("");
    const [date, setDate] = useState("");
    const [items, setItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showPreview, setShowPreview] = useState(false);
    
    // State to track if we are editing an existing bill
    const [editingId, setEditingId] = useState(null);

    const searchInputRef = useRef(null);

    // Added gstNumber to state
    const [customer, setCustomer] = useState({
        customerName: "", mobileNumber: "", age: "", gender: "", dob: "", address: "", purposeOfVisit: "", gstNumber: "" 
    });

    const [prescriptionMode, setPrescriptionMode] = useState("Glasses");
    const [appointment, setAppointment] = useState({
        checkupDate: new Date().toISOString().split('T')[0],
        expiryDate: "",
        customerType: "New"
    });

    const [glassReadings, setGlassReadings] = useState({
        left: { SPH: "0.00", CYL: "0.00", AXIS: "0", ADD: "0.00", PD: "25.0", DistanceVA: "6/6", NearVA: "N6" },
        right: { SPH: "0.00", CYL: "0.00", AXIS: "0", ADD: "0.00", PD: "25.0", DistanceVA: "6/6", NearVA: "N6" },
    });
    const [clReadings, setClReadings] = useState({
        left: { SPH: "0.00", CYL: "0.00", AXIS: "0", BC: "8.6", DIA: "14.0" },
        right: { SPH: "0.00", CYL: "0.00", AXIS: "0", BC: "8.6", DIA: "14.0" },
    });

    const [paymentModes, setPaymentModes] = useState({
        cash: "",
        upi: "",
        card: ""
    });

    const [discountPercentInput, setDiscountPercentInput] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [orderStatus, setOrderStatus] = useState({ ordered: true, delivered: false });

    const [totals, setTotals] = useState({
        subTotal: 0,
        taxableValue: 0,
        cgst: 0,
        sgst: 0,
        grandTotal: 0,
        roundOffAmount: 0,
        remaining: 0,
        discountAmount: 0,
        discountPercent: 0,
        taxScalingFactor: 1,
        totalPaid: 0 
    });

    useEffect(() => {
        fetchItems();
        
        // CHECK IF EDITING
        if (location.state && location.state.editMode && location.state.billData) {
            const billData = location.state.billData;
            
            setEditingId(billData._id);
            setInvoiceNo(billData.invoiceNo);
            setDate(billData.date);
            
            // Map Customer
            setCustomer(prev => ({ ...prev, ...billData.customer }));
            
            // Map Items (Cart)
            setCart(billData.items || []);
            
            // Map Payments
            setPaymentModes({
                cash: billData.paymentCash || "",
                upi: billData.paymentUPI || "",
                card: billData.paymentCard || ""
            });
            
            // Map Discount
            setDiscountPercentInput(billData.discountPercent || "");
            
            // Map Delivery & Status
            setDeliveryDate(billData.deliveryDate || "");
            setOrderStatus(billData.orderStatus || { ordered: true, delivered: false });
            
            toast.info("Editing Invoice: " + billData.invoiceNo);
        } else {
            // New Bill Mode
            fetchInvoiceNumber();
            setDate(new Date().toLocaleString("en-IN"));
        }

        if (searchInputRef.current) searchInputRef.current.focus();
    }, [location.state]);

    const fetchItems = async () => {
        try {
            const res = await fetch(`${API_URL}/api/items`);
            const data = await res.json();
            const mappedItems = data.map(i => ({
                ...i,
                itemNumber: i.itemNumber || "",
                barcodeId: i.barcodeId || "",
                itemName: i.itemName || "",
                itemType: i.itemType || i.type || "-",
                itemPrice: Number(i.salePrice) || 0,
                cgst: Number(i.cgst) || 0,
                sgst: Number(i.sgst) || 0,
                hsn: i.hsn || "-",
                stock: Number(i.stock) || 0,
                mrp: Number(i.mrp) || 0
            }));
            setItems(mappedItems);
        } catch { toast.error("Failed to fetch items"); }
    };

    const fetchInvoiceNumber = async () => {
        try {
            const res = await fetch(`${API_URL}/api/billing/invoice`);
            if (res.ok) {
                const data = await res.json();
                setInvoiceNo(data.invoiceNo);
            }
        } catch { }
    };

    const handleMobileBlur = async () => {
        if (customer.mobileNumber && customer.mobileNumber.length >= 10) {
            try {
                const res = await fetch(`${API_URL}/api/customers/mobile/${customer.mobileNumber}`);
                if (res.ok) {
                    const data = await res.json();
                    const { customer: foundCust, lastClinicalEntry } = data;

                    setCustomer(prev => ({
                        ...prev,
                        customerName: foundCust.customerName,
                        age: foundCust.age || "", 
                        gender: foundCust.gender || "",
                        dob: foundCust.dob || "",
                        address: foundCust.address || "",
                        purposeOfVisit: foundCust.purposeOfVisit || "",
                        gstNumber: foundCust.gstNumber || "" // Load GST if available
                    }));

                    toast.success("Existing Customer Found!");

                    if (lastClinicalEntry) {
                        setAppointment(prev => ({
                            ...prev,
                            customerType: "Returning",
                            ...lastClinicalEntry.appointmentDetails,
                            checkupDate: new Date().toISOString().split('T')[0]
                        }));

                        if (lastClinicalEntry.testType === "Glasses") {
                            setPrescriptionMode("Glasses");
                            setGlassReadings(lastClinicalEntry.readings);
                        } else if (lastClinicalEntry.testType === "ContactLens") {
                            setPrescriptionMode("ContactLens");
                            setClReadings(lastClinicalEntry.readings);
                        }
                        toast.info("Previous readings loaded for reference.");
                    }
                }
            } catch (e) { }
        }
    };

    // --- CALCULATION LOGIC ---
    useEffect(() => {
        let rawSubTotal = 0;
        let rawTotalCGST = 0;
        let rawTotalSGST = 0;

        cart.forEach(i => {
            const qty = i.quantity || 1;
            const price = Number(i.itemPrice);
            const lineTotal = price * qty;

            rawSubTotal += lineTotal;
            rawTotalCGST += lineTotal * (Number(i.cgst) / 100);
            rawTotalSGST += lineTotal * (Number(i.sgst) / 100);
        });

        let inputPercent = Number(discountPercentInput) || 0;
        if (inputPercent > 100) inputPercent = 100;
        if (inputPercent < 0) inputPercent = 0;

        const finalDiscountAmt = rawSubTotal * (inputPercent / 100);

        let netTaxableValue = rawSubTotal - finalDiscountAmt;
        if (netTaxableValue < 0) netTaxableValue = 0;

        const taxScalingFactor = rawSubTotal > 0 ? (netTaxableValue / rawSubTotal) : 0;
        const finalCGST = rawTotalCGST * taxScalingFactor;
        const finalSGST = rawTotalSGST * taxScalingFactor;
        const grossTotal = netTaxableValue + finalCGST + finalSGST;

        const roundedGrandTotal = Math.round(grossTotal);
        const roundOffDiff = roundedGrandTotal - grossTotal;

        // Calculate Total Paid
        const currentTotalPaid = Number(paymentModes.cash || 0) + Number(paymentModes.upi || 0) + Number(paymentModes.card || 0);
        
        const remaining = roundedGrandTotal - currentTotalPaid;

        setTotals({
            subTotal: rawSubTotal,
            taxableValue: netTaxableValue,
            cgst: finalCGST,
            sgst: finalSGST,
            discountAmount: finalDiscountAmt,
            discountPercent: inputPercent,
            grandTotal: roundedGrandTotal,
            roundOffAmount: roundOffDiff,
            remaining: remaining < 0 ? 0 : remaining,
            taxScalingFactor: taxScalingFactor,
            totalPaid: currentTotalPaid
        });
    }, [cart, discountPercentInput, paymentModes]);

    const getBillData = () => ({
        invoiceNo,
        date: date, // Use state date
        customer,
        items: cart,
        paymentModes,
        grandTotal: totals.grandTotal,
        subTotal: totals.subTotal,
        taxableValue: totals.taxableValue,
        totalCgstAmount: totals.cgst,
        totalSgstAmount: totals.sgst,
        discountAmount: totals.discountAmount,
        discountPercent: totals.discountPercent,
        advance: totals.totalPaid,
        remaining: totals.remaining,
        orderStatus: orderStatus,
        taxScalingFactor: totals.taxScalingFactor,
        roundOffAmount: totals.roundOffAmount
    });

    const handleAddToCart = (item) => {
        // Simplified stock check for editing (optional: disable strict stock check in edit)
        if (!editingId && (!item.stock || item.stock <= 0)) return toast.error("Out of Stock!");
        
        const existingItemIndex = cart.findIndex(c => c._id === item._id);

        if (existingItemIndex > -1) {
            const currentQty = cart[existingItemIndex].quantity || 1;
             // Check stock only if not editing
            if (!editingId && currentQty + 1 > item.stock) return toast.warning(`Out of Stock! Only ${item.stock} available.`);
            
            const newCart = [...cart];
            newCart[existingItemIndex].quantity = currentQty + 1;
            setCart(newCart);
            toast.info(`Increased quantity for ${item.itemName}`);
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const handleQuantityChange = (id, newQty) => {
        const qty = parseInt(newQty);
        if (qty < 1 || isNaN(qty)) return;
        const itemIndex = cart.findIndex(c => c._id === id);
        if (itemIndex === -1) return;
        
        // Strict stock check only on new creation
        const itemInCart = cart[itemIndex];
        if (!editingId && qty > itemInCart.stock) {
            toast.warning(`Cannot exceed available stock (${itemInCart.stock})`);
            const newCart = [...cart];
            newCart[itemIndex].quantity = itemInCart.stock;
            setCart(newCart);
            return;
        }
        setCart(cart.map(c => c._id === id ? { ...c, quantity: qty } : c));
    };

    const handleRemove = (id) => setCart(cart.filter(c => c._id !== id));

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const code = searchTerm.trim();
            if (!code) return;
            const foundItem = items.find(i =>
                (i.barcodeId && i.barcodeId.toString().toLowerCase() === code.toLowerCase()) ||
                (i.itemNumber && i.itemNumber.toString().toLowerCase() === code.toLowerCase())
            );
            if (foundItem) {
                handleAddToCart(foundItem);
                setSearchTerm("");
                toast.success("Scanned: " + foundItem.itemName);
            } else {
                toast.error("Item not found");
            }
        }
    };

    const filteredItems = items.filter(i =>
        (i.itemName && i.itemName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (i.barcodeId && i.barcodeId.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (i.itemNumber && i.itemNumber.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handlePrint = () => {
        if (cart.length === 0) return toast.warn("Cart is empty");
        window.print();
    };

    // --- SAVE / UPDATE BILL HANDLER ---
    const handleSaveBill = async () => {
        if (!customer.customerName || !customer.mobileNumber) return toast.warn("Name & Mobile Required");
        if (cart.length === 0) return toast.warn("Cart is empty");

        const billingPayload = {
            invoiceNo,
            date: date, // Keep original date if editing
            customer,
            items: cart,
            subTotal: totals.subTotal,
            taxableValue: totals.taxableValue,
            totalCgstAmount: totals.cgst,
            totalSgstAmount: totals.sgst,
            discountPercent: totals.discountPercent,
            discountAmount: totals.discountAmount,
            paymentCash: Number(paymentModes.cash) || 0,
            paymentUPI: Number(paymentModes.upi) || 0,
            paymentCard: Number(paymentModes.card) || 0,
            advance: totals.totalPaid, 
            deliveryDate,
            orderStatus,
            remaining: totals.remaining,
            grandTotal: totals.grandTotal,
            roundOffAmount: totals.roundOffAmount
        };

        try {
            let res;
            if (editingId) {
                // UPDATE EXISTING BILL
                res = await fetch(`${API_URL}/api/billing/update/${editingId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(billingPayload)
                });
            } else {
                // CREATE NEW BILL
                res = await fetch(`${API_URL}/api/billing/submit`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(billingPayload)
                });
            }

            if (res.ok) {
                // Only reduce stock if it's a NEW bill to avoid double deduction complexity
                if (!editingId) {
                    try {
                        const stockPayload = cart.map(item => ({
                            itemId: item._id,
                            quantity: item.quantity || 1
                        }));
                        await fetch(`${API_URL}/api/items/reduce-stock`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ items: stockPayload })
                        });
                    } catch (stockErr) { console.error("Stock update error:", stockErr); }
                }

                toast.success(editingId ? "Bill Updated Successfully!" : "Bill Saved & Stock Updated!");
                
                // Clear state
                setEditingId(null);
                setCart([]); 
                setPaymentModes({ cash: "", upi: "", card: "" });
                setDiscountPercentInput("");
                setDeliveryDate("");
                setCustomer({ customerName: "", mobileNumber: "", age: "", gender: "", dob: "", address: "", purposeOfVisit: "", gstNumber: "" });
                
                // Refresh data
                fetchInvoiceNumber();
                fetchItems();
                if (searchInputRef.current) searchInputRef.current.focus();
            } else {
                toast.error("Failed to save bill");
            }
        } catch (e) { toast.error("Server Error"); }
    };

    const handleShareWhatsApp = () => {
        if (!customer.customerName || !customer.mobileNumber) return toast.warn("Name & Mobile Required for WhatsApp");
        let msg = `*NxtEye Optical - Clinical Report*\n--------------------------------\n*Patient:* ${customer.customerName}\n*Date:* ${appointment.checkupDate}\n*Type:* ${prescriptionMode}\n--------------------------------\n\n`;
        if (prescriptionMode === "Glasses") {
            msg += `*RIGHT EYE (OD)*\nSPH: ${glassReadings.right.SPH} | CYL: ${glassReadings.right.CYL} | AXIS: ${glassReadings.right.AXIS}\nADD: ${glassReadings.right.ADD} | VA: 6/${glassReadings.right.DistanceVA} | N${glassReadings.right.NearVA}\n\n*LEFT EYE (OS)*\nSPH: ${glassReadings.left.SPH} | CYL: ${glassReadings.left.CYL} | AXIS: ${glassReadings.left.AXIS}\nADD: ${glassReadings.left.ADD} | VA: 6/${glassReadings.left.DistanceVA} | N${glassReadings.left.NearVA}\n`;
        } else {
            msg += `*RIGHT EYE (OD)*\nPWR: ${clReadings.right.SPH} | CYL: ${clReadings.right.CYL}\n\n*LEFT EYE (OS)*\nPWR: ${clReadings.left.SPH} | CYL: ${clReadings.left.CYL}\n`;
        }
        let phone = customer.mobileNumber.replace(/[^0-9]/g, "");
        if (phone.length === 10) phone = "91" + phone;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
        window.open(url, "_blank");
    };

    const handleSaveClinical = async () => {
        if (!customer.customerName || !customer.mobileNumber) return toast.warn("Name & Mobile Required");
        const payload = {
            ...customer,
            clinicalEntry: {
                visitDate: appointment.checkupDate,
                testType: prescriptionMode,
                appointmentDetails: appointment,
                readings: prescriptionMode === "Glasses" ? glassReadings : clReadings
            }
        };
        try {
            const res = await fetch(`${API_URL}/api/customers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) toast.success("Clinical Entry Added to History!");
            else toast.error("Failed to save");
        } catch (e) { toast.error("Server Error"); }
    };

    const handleReset = () => {
        setEditingId(null);
        setCustomer({ customerName: "", mobileNumber: "", age: "", gender: "", dob: "", address: "", purposeOfVisit: "", gstNumber: "" });
        setCart([]);
        setPaymentModes({ cash: "", upi: "", card: "" });
        setDiscountPercentInput(""); setDeliveryDate("");
        setAppointment({ checkupDate: new Date().toISOString().split('T')[0], expiryDate: "", customerType: "New" });
        setOrderStatus({ ordered: true, delivered: false });
        fetchInvoiceNumber(); // Reset invoice number
        setDate(new Date().toLocaleString("en-IN")); // Reset Date
        setTimeout(() => {
            if (searchInputRef.current) searchInputRef.current.focus();
        }, 100);
    };

    return (
        <Layout>
            <style>
                {`
                    @media print {
                        @page { size: A4; margin: 0; }
                        html, body {
                            height: 100%;
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: hidden !important;
                        }
                        body * { visibility: hidden; }
                        #printable-invoice, #printable-invoice * { visibility: visible; }
                        #printable-invoice {
                            display: flex !important; flex-direction: column; position: absolute; left: 0; top: 0;
                            padding: 0px 20px 20px 20px; background: white; z-index: 9999; font-size: 11px;
                            width: 100%;
                        }
                        .no-print { display: none !important; }
                    }
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #888; border-radius: 3px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
                `}
            </style>
            <div className="bg-white shadow-md rounded-lg p-6 relative">
                <div className="flex justify-between items-center bg-white">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {editingId ? "Edit Order" : "Order Summary"}
                    </h2>
                    <div className="text-right">
                        <div className="text-md font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Invoice No: {invoiceNo || "..."}</div>
                        <div className="text-xs text-gray-400 mt-1">{date}</div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* CUSTOMER INFO SECTION */}
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                        <h3 className="text-xl font-bold text-blue-800 uppercase tracking-wider mb-4">Customer Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-gray-600">Mobile*</label>
                                <input className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" value={customer.mobileNumber} onChange={e => setCustomer({ ...customer, mobileNumber: e.target.value })} onBlur={handleMobileBlur} placeholder="Enter mobile to search..." />
                            </div>
                            <div className="md:col-span-2"><label className="text-xs font-semibold text-gray-600">Name*</label><input className="w-full border rounded p-2 text-sm" value={customer.customerName} onChange={e => setCustomer({ ...customer, customerName: e.target.value })} /></div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600">Purpose</label>
                                <select className="w-full border rounded p-2 text-sm" value={customer.purposeOfVisit} onChange={e => setCustomer({ ...customer, purposeOfVisit: e.target.value })}>
                                    <option value="">Select</option>
                                    <option>Purchase</option>
                                    <option>Eye test</option>
                                    <option>Consultation</option>
                                    <option>Contact lens</option>
                                    <option>Service/Repair</option>
                                    <option>Others</option>
                                </select>
                            </div>
                            <div><label className="text-xs font-semibold text-gray-600">Age</label><input className="w-full border rounded p-2 text-sm" value={customer.age} onChange={e => setCustomer({ ...customer, age: e.target.value })} placeholder="Age" /></div>
                            <div><label className="text-xs font-semibold text-gray-600">Gender</label><select className="w-full border rounded p-2 text-sm" value={customer.gender} onChange={e => setCustomer({ ...customer, gender: e.target.value })}><option value="">Select</option><option>Male</option><option>Female</option></select></div>
                            <div className="md:col-span-3"><label className="text-xs font-semibold text-gray-600">Address</label><input className="w-full border rounded p-2 text-sm" placeholder="Full Address" value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} /></div>
                            
                            {/* NEW GST NUMBER INPUT */}
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-gray-600">GST Number</label>
                                <input 
                                    className="w-full border rounded p-2 text-sm uppercase" 
                                    placeholder="GSTIN" 
                                    value={customer.gstNumber} 
                                    onChange={e => setCustomer({ ...customer, gstNumber: e.target.value.toUpperCase() })} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* CLINICAL ENTRY SECTION */}
                    <div className="bg-blue-50 p-5 rounded-lg border border-blue-200 relative">
                        {/* ... Clinical Entry Logic (Same as before) ... */}
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-blue-800 uppercase tracking-wider">Clinical Entry</h3>
                            <div className="flex gap-4 items-center">
                                <input type="date" className="border rounded px-2 py-1 text-xs" value={appointment.checkupDate} onChange={e => setAppointment({ ...appointment, checkupDate: e.target.value })} />
                                <div className="flex bg-white rounded-lg shadow-sm p-1">
                                    <button onClick={() => setPrescriptionMode("Glasses")} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition ${prescriptionMode === "Glasses" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}><Glasses size={14} /> Glasses</button>
                                    <button onClick={() => setPrescriptionMode("ContactLens")} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition ${prescriptionMode === "ContactLens" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}><Eye size={14} /> Contact Lens</button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4 mb-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-center">
                                {prescriptionMode === "Glasses" ? (
                                    <>
                                        {['right', 'left'].map((eye) => (
                                            <div key={eye} className={`bg-white p-3 rounded shadow-sm border-t-4 ${eye === 'right' ? 'border-blue-500' : 'border-blue-400'}`}>
                                                <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase">{eye} EYE</h4>
                                                <div className="grid grid-cols-7 gap-1">
                                                    <div><label className="text-[10px] text-gray-400 block">SPH</label><SearchableSelect value={glassReadings[eye].SPH} options={SPH_CYL_Values} onChange={v => setGlassReadings(p => ({ ...p, [eye]: { ...p[eye], SPH: v } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">CYL</label><SearchableSelect value={glassReadings[eye].CYL} options={SPH_CYL_Values} onChange={v => setGlassReadings(p => ({ ...p, [eye]: { ...p[eye], CYL: v } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">AXIS</label><SearchableSelect value={glassReadings[eye].AXIS} options={AXIS_Values} onChange={v => setGlassReadings(p => ({ ...p, [eye]: { ...p[eye], AXIS: v } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">ADD</label><SearchableSelect value={glassReadings[eye].ADD} options={ADD_Values} onChange={v => setGlassReadings(p => ({ ...p, [eye]: { ...p[eye], ADD: v } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">PD</label><SearchableSelect value={glassReadings[eye].PD} options={PD_Values} onChange={v => setGlassReadings(p => ({ ...p, [eye]: { ...p[eye], PD: v } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">D-VA (6/x)</label><SearchableSelect value={glassReadings[eye].DistanceVA} options={D_VA_Values} onChange={v => setGlassReadings(p => ({ ...p, [eye]: { ...p[eye], DistanceVA: v } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">N-VA (Nx)</label><SearchableSelect value={glassReadings[eye].NearVA} options={N_VA_Values} onChange={v => setGlassReadings(p => ({ ...p, [eye]: { ...p[eye], NearVA: v } }))} /></div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        {['right', 'left'].map((eye) => (
                                            <div key={eye} className="bg-white p-3 rounded shadow-sm border-t-4 border-green-500">
                                                <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase">{eye} EYE</h4>
                                                <div className="grid grid-cols-5 gap-2">
                                                    <div><label className="text-[10px] text-gray-400 block">PWR</label><SearchableSelect value={clReadings[eye].SPH} options={SPH_CYL_Values} onChange={v => setClReadings(p => ({ ...p, [eye]: { ...p[eye], SPH: v } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">CYL</label><SearchableSelect value={clReadings[eye].CYL} options={SPH_CYL_Values} onChange={v => setClReadings(p => ({ ...p, [eye]: { ...p[eye], CYL: v } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">AXIS</label><SearchableSelect value={clReadings[eye].AXIS} options={AXIS_Values} onChange={v => setClReadings(p => ({ ...p, [eye]: { ...p[eye], AXIS: v } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">BC</label><input className="w-full border p-1 text-xs rounded text-center" value={clReadings[eye].BC} onChange={e => setClReadings(p => ({ ...p, [eye]: { ...p[eye], BC: e.target.value } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">DIA</label><input className="w-full border p-1 text-xs rounded text-center" value={clReadings[eye].DIA} onChange={e => setClReadings(p => ({ ...p, [eye]: { ...p[eye], DIA: e.target.value } }))} /></div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end border-t border-blue-200 pt-3 gap-2">
                            <button onClick={handleShareWhatsApp} className="bg-green-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow hover:bg-green-600 transition flex items-center gap-2">
                                <MessageCircle size={16} /> Share via WhatsApp
                            </button>
                            <button onClick={handleSaveClinical} className="px-6 py-2 bg-[#5ce1e6] text-[#03214a] rounded-full text-sm font-bold hover:bg-[#03214a] hover:text-white transition shadow-md flex items-center gap-2">
                                <Save size={16} /> Save Clinical Entry
                            </button>
                        </div>
                    </div>

                    {/* SEARCH ITEMS SECTION */}
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <h3 className="text-xl font-bold text-blue-800 uppercase tracking-wider mb-2">Select Items / Scan Barcode</h3>
                        <div className="flex gap-3 mb-3">
                            <input
                                ref={searchInputRef}
                                className="grow p-2 border-2 border-blue-100 focus:border-blue-500 rounded text-sm outline-none transition-colors"
                                placeholder="Scan Barcode / Enter Item No / Type Name..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                autoComplete="off"
                            />
                        </div>

                        <div className="border rounded-lg max-h-48 overflow-y-auto bg-gray-50">
                            {filteredItems.length > 0 ? (
                                filteredItems.slice(0, 20).map(i => (
                                    <div key={i._id} className="flex justify-between items-center p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 bg-white transition-colors" onClick={() => handleAddToCart(i)}>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-800">{i.itemName}</div>
                                            <div className="text-xs text-gray-500">
                                                #{i.barcodeId} | ID: <span className="text-blue-600 font-medium">{i.itemNumber}</span> | Stock: <span className={i.stock > 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>{i.stock}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-bold text-gray-700">₹{Math.round(i.itemPrice)}</span>
                                            <button className="bg-blue-600 text-white p-1.5 rounded-full shadow-sm hover:bg-blue-700 transition"><Plus size={16} /></button>
                                        </div>
                                    </div>
                                ))
                            ) : <div className="p-8 text-center text-gray-400 text-sm">No matching items found</div>}
                        </div>
                    </div>

                    {/* CART & BILLING SECTION */}
                    {cart.length > 0 && (
                        <div className="border rounded-lg overflow-hidden bg-white shadow-lg mt-4 animate-fade-in">
                            <div className="bg-gray-100 p-3 font-bold text-gray-700 text-sm border-b flex justify-between items-center">
                                <span>Cart & Billing</span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{cart.length} Items</span>
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                                    <tr>
                                        <th className="px-4 py-3 w-16">SL.NO</th>
                                        <th className="px-4 py-3">ITEM NAME</th>
                                        <th className="px-4 py-3">PRICE</th>
                                        <th className="px-4 py-3 w-20">QTY</th>
                                        <th className="px-4 py-3">HSN</th>
                                        <th className="px-4 py-3">TOTAL</th>
                                        <th className="px-4 py-3 text-center">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {cart.map((item, index) => {
                                        const qty = item.quantity || 1;
                                        const price = Number(item.itemPrice);
                                        const lineTotal = price * qty;
                                        return (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                                                <td className="px-4 py-3 font-medium text-gray-800">
                                                    <div>{item.itemName}</div>
                                                    <div className="text-[10px] text-gray-400">{item.itemNumber}</div>
                                                </td>
                                                <td className="px-4 py-3">₹{Math.round(price)}/-</td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="w-16 border rounded p-1 text-center focus:ring-2 focus:ring-blue-400 outline-none"
                                                        value={qty}
                                                        onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">{item.hsn}</td>
                                                <td className="px-4 py-3 font-bold text-gray-800">₹{Math.round(lineTotal)}/-</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => handleRemove(item._id)} className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs font-medium hover:bg-red-200 transition flex items-center gap-1 mx-auto">
                                                        <Trash2 size={12} /> Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            <div className="p-4 bg-gray-50 grid grid-cols-1 md:grid-cols-6 gap-4 border-t items-end">
                                <div>
                                    <div className="flex justify-between">
                                        <label className="text-xs font-semibold text-gray-500 mt-1">Discount (%)</label>
                                        <span className="text-xs font-bold text-blue-600 p-1">
                                            ₹{Math.round(totals.discountAmount)}
                                        </span>
                                    </div>
                                    <input
                                        type="number"
                                        className="w-full border p-2 rounded text-sm bg-white focus:ring-2 focus:ring-blue-400 outline-none"
                                        placeholder="Enter %"
                                        value={discountPercentInput}
                                        onChange={e => setDiscountPercentInput(e.target.value)}
                                        max="100"
                                        min="0"
                                    />
                                </div>
                                
                                {/* SPLIT PAYMENTS */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500">Cash</label>
                                    <input 
                                        type="number" 
                                        className="w-full border p-2 rounded text-sm bg-white" 
                                        placeholder="Amount" 
                                        value={paymentModes.cash} 
                                        onChange={e => setPaymentModes({ ...paymentModes, cash: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500">UPI</label>
                                    <input 
                                        type="number" 
                                        className="w-full border p-2 rounded text-sm bg-white" 
                                        placeholder="Amount" 
                                        value={paymentModes.upi} 
                                        onChange={e => setPaymentModes({ ...paymentModes, upi: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500">Card</label>
                                    <input 
                                        type="number" 
                                        className="w-full border p-2 rounded text-sm bg-white" 
                                        placeholder="Amount" 
                                        value={paymentModes.card} 
                                        onChange={e => setPaymentModes({ ...paymentModes, card: e.target.value })} 
                                    />
                                </div>
                                
                                {/* Read-Only Advance Display */}
                                <div>
                                    <label className="text-xs font-bold text-green-600">Total Paid (Advance)</label>
                                    <div className="w-full border border-green-200 bg-green-50 p-2 rounded text-sm font-bold text-green-700">
                                        ₹{totals.totalPaid}
                                    </div>
                                </div>

                                <div><label className="text-xs font-semibold text-gray-500">Delivery Date</label><input type="date" className="w-full border p-2 rounded text-sm bg-white" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} /></div>
                            </div>

                            <div className="p-4 bg-white flex flex-col md:flex-row justify-between items-end gap-6">
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" checked={orderStatus.ordered} onChange={e => setOrderStatus({ ...orderStatus, ordered: e.target.checked })} /> Ordered
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-green-600 rounded" checked={orderStatus.delivered} onChange={e => setOrderStatus({ ...orderStatus, delivered: e.target.checked })} /> Delivered
                                    </label>
                                </div>
                                <div className="text-right space-y-1 text-sm">
                                    <div className="flex justify-between w-64"><span className="text-gray-500">Subtotal :</span> <span>₹{Math.round(totals.subTotal)}/-</span></div>
                                    
                                    {Number(totals.discountAmount) > 0 && (
                                        <div className="flex justify-between w-64 text-red-500">
                                            <span className="">Discount ({totals.discountPercent}%) :</span>
                                            <span>-₹{Math.round(totals.discountAmount)}/-</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between w-64 font-medium"><span className="text-gray-700">Taxable Value :</span> <span>₹{Math.round(totals.taxableValue)}/-</span></div>
                                    <div className="flex justify-between w-64"><span className="text-gray-500">Total CGST :</span> <span>₹{Math.round(totals.cgst)}/-</span></div>
                                    <div className="flex justify-between w-64"><span className="text-gray-500">Total SGST :</span> <span>₹{Math.round(totals.sgst)}/-</span></div>

                                    <div className="flex justify-between w-64 text-gray-600 border-t pt-1">
                                        <span className="">Round Off :</span> 
                                        <span>{totals.roundOffAmount > 0 ? '+' : ''}{totals.roundOffAmount.toFixed(2)}</span>
                                    </div>

                                    {/* Total Paid Display based on Splits */}
                                    <div className="flex justify-between w-64 text-green-600 font-bold bg-green-50 p-1 rounded">
                                        <span className="">Total Advance Paid :</span> 
                                        <span>-₹{totals.totalPaid}/-</span>
                                    </div>

                                    <div className="flex justify-between w-64 text-xl font-bold text-gray-900 mt-2 border-t pt-2"><span className="">Grand Total :</span> <span>₹{totals.grandTotal}/-</span></div>
                                    <div className="flex justify-between w-64 text-blue-600 font-bold text-sm pt-1 border-t border-dashed"><span className="">Balance Due :</span> <span>₹{safeAmount(totals.remaining)}/-</span></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={handleReset} className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium hover:bg-red-100 transition flex items-center gap-2"><RefreshCw size={16} /> Full Reset</button>
                        <button onClick={() => setShowPreview(true)} disabled={cart.length === 0} className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${cart.length === 0 ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><Eye size={16} /> Preview</button>
                        <button onClick={handlePrint} disabled={cart.length === 0} className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${cart.length === 0 ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}><Printer size={16} /> Print</button>
                        {cart.length > 0 && (
                            <button onClick={handleSaveBill} className="px-6 py-2 bg-[#5ce1e6] text-[#03214a] rounded-full text-sm font-bold hover:bg-[#03214a] hover:text-white transition shadow-md flex items-center gap-2">
                                <Save size={18} /> {editingId ? "Update Bill" : "Save Sale Bill"}
                            </button>
                        )}
                    </div>
                </div>
                <ToastContainer position="top-right" autoClose={2000} />

                <div id="printable-invoice" style={{ display: 'none' }}>
                    <InvoiceTemplate bill={getBillData()} />
                </div>

                {showPreview && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-lg">Invoice Preview</h3>
                                <div className="flex gap-2">
                                    <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm flex items-center gap-2 hover:bg-blue-700"><Printer size={14} /> Print</button>
                                    <button onClick={() => setShowPreview(false)} className="bg-gray-200 text-gray-700 px-2 py-1.5 rounded hover:bg-gray-300"><X size={18} /></button>
                                </div>
                            </div>
                            <div className="overflow-y-auto p-8 bg-gray-200">
                                <div className="shadow-xl mx-auto max-w-[210mm]">
                                    <InvoiceTemplate bill={getBillData()} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

// ... InvoiceTemplate component remains exactly same ...
// --- UPDATED INVOICE TEMPLATE (Shows Split Payments & Age) ---
const InvoiceTemplate = ({ bill }) => {
    if (!bill) return null;
    const isDelivered = bill.orderStatus ? bill.orderStatus.delivered : true;

    const roundedGrandTotal = Math.round(bill.grandTotal);
    const roundOffAmount = bill.roundOffAmount || 0;
    
    const scalingFactor = bill.taxScalingFactor !== undefined ? bill.taxScalingFactor : 1;
    const discountPercent = bill.discountPercent || 0;

    // Split payments from bill object
    const cash = Number(bill.paymentModes?.cash || bill.paymentCash || 0);
    const upi = Number(bill.paymentModes?.upi || bill.paymentUPI || 0);
    const card = Number(bill.paymentModes?.card || bill.paymentCard || 0);
    const totalPaid = cash + upi + card;

    const taxSummary = {};

    bill.items.forEach(item => {
        const qty = item.quantity || 1;
        const price = Number(item.itemPrice);
        const subtotal = price * qty;
        
        const itemTaxable = subtotal * scalingFactor;
        
        const cgstRate = Number(item.cgst) || 0;
        const sgstRate = Number(item.sgst) || 0;
        const totalRate = cgstRate + sgstRate;

        const cgstAmt = itemTaxable * (cgstRate / 100);
        const sgstAmt = itemTaxable * (sgstRate / 100);

        if (!taxSummary[totalRate]) {
            taxSummary[totalRate] = { cgstRate, sgstRate, cgstAmt: 0, sgstAmt: 0 };
        }
        taxSummary[totalRate].cgstAmt += cgstAmt;
        taxSummary[totalRate].sgstAmt += sgstAmt;
    });

    return (
        <div className="invoice-box bg-white text-black ms-5">
            <div className="flex justify-between items-center border-b-2 border-gray-800 pb-2">
                <div>
                    <img
                        src="/assets/dashboard/nxteye-logo.png"
                        alt="Company Logo"
                        className="h-10 w-auto object-contain mb-2"
                    />
                    <p className="text-gray-700 font-medium mt-1">75/1, MRM Complex, Faizal Nagar Road,<br/> Kenikarai, Ramanathapuram - 623504</p>
                    <p className="text-gray-700">Phone: <span className="font-bold">7869369994</span></p>
                    <p className="text-gray-700">GSTIN: <span className="font-bold">33FRXPS5282K1ZQ</span></p>
                    <p className="text-gray-600">Website: <a href="https://nxteye.co.in/" className="font-bold">nxteye.co.in</a></p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-800 uppercase">Tax Invoice</h2>
                    <p className="mt-2 text-gray-700">Invoice #: <span className="font-bold text-black text-lg">{bill.invoiceNo}</span></p>
                    <p className="text-gray-700">Date: <span className="font-bold">{bill.date.split(',')[0]}</span></p>
                </div>
            </div>
            
            <div className="mb-4 border border-gray-300 p-3 rounded mt-4">
                <div className="flex justify-between">
                    <div className="w-1/2">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bill To:</h3>
                        <p className="text-base font-bold text-gray-900">{bill.customer?.customerName || "Walk-in Customer"}</p>
                        <p className="text-gray-700 text-xs">{bill.customer?.address || "Address not provided"}</p>
                        <p className="text-gray-700 text-xs mt-1">Mobile: <b>{bill.customer?.mobileNumber}</b></p>
                        {/* AGE & GST DISPLAYED */}
                        {bill.customer?.age && <p className="text-gray-700 text-xs">Age: {bill.customer.age}</p>}
                        {bill.customer?.gstNumber && <p className="text-gray-700 text-xs mt-0.5">GSTIN: <b>{bill.customer.gstNumber}</b></p>}
                    </div>
                    <div className="w-1/2 text-right">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order Details:</h3>
                        <p className="text-gray-700 text-xs">Status: <b>{isDelivered ? "DELIVERED" : "ORDERED"}</b></p>
                    </div>
                </div>
            </div>

            <div className="mb-1">
                <table className="w-full border-collapse border border-gray-300 text-[10px]">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="border border-gray-300 p-1 text-center w-8">S.No</th>
                            <th className="border border-gray-300 p-1 text-left">Item Name</th>
                            <th className="border border-gray-300 p-1 text-center w-12">Type</th>
                            <th className="border border-gray-300 p-1 text-center w-12">HSN</th>
                            <th className="border border-gray-300 p-1 text-center w-8">Qty</th>
                            <th className="border border-gray-300 p-1 text-right w-16">Rate</th>
                            <th className="border border-gray-300 p-1 text-right w-20">Disc % / Amt</th>
                            <th className="border border-gray-300 p-1 text-right w-12">GST%</th>
                            <th className="border border-gray-300 p-1 text-right w-16">CGST Amt</th>
                            <th className="border border-gray-300 p-1 text-right w-16">SGST Amt</th>
                            <th className="border border-gray-300 p-1 text-right w-20">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bill.items.map((item, idx) => {
                            const qty = item.quantity || 1;
                            const price = Number(item.itemPrice);
                            const lineSubtotal = price * qty;
                            const lineDiscountAmt = lineSubtotal * (discountPercent / 100);
                            const lineTaxable = lineSubtotal - lineDiscountAmt;
                            const cgstAmt = lineTaxable * (Number(item.cgst)/100);
                            const sgstAmt = lineTaxable * (Number(item.sgst)/100);
                            const lineTotalWithTax = lineTaxable + cgstAmt + sgstAmt;

                            return (
                                <tr key={idx}>
                                    <td className="border border-gray-300 p-1 text-center">{idx + 1}</td>
                                    <td className="border border-gray-300 p-1 text-left">
                                        <div className="font-bold text-gray-900">{item.itemNumber}</div>
                                    </td>
                                    <td className="border border-gray-300 p-1 text-center">{item.itemType || "-"}</td>
                                    <td className="border border-gray-300 p-1 text-center">{item.hsn || "-"}</td>
                                    <td className="border border-gray-300 p-1 text-center">{qty}</td>
                                    <td className="border border-gray-300 p-1 text-right">{Math.round(price)}</td>
                                    <td className="border border-gray-300 p-1 text-right text-gray-600">
                                        {discountPercent > 0 ? (
                                            <><span className="text-[9px]">{discountPercent}% / </span>{Math.round(lineDiscountAmt)}</>
                                        ) : "-"}
                                    </td>
                                    <td className="border border-gray-300 p-1 text-right">{(Number(item.cgst)+Number(item.sgst))}%</td>
                                    <td className="border border-gray-300 p-1 text-right">{Math.round(cgstAmt)}</td>
                                    <td className="border border-gray-300 p-1 text-right">{Math.round(sgstAmt)}</td>
                                    <td className="border border-gray-300 p-1 text-right font-bold">{Math.round(lineTotalWithTax)}</td>
                                </tr>
                            )
                        })}
                        {bill.items.length < 3 && Array.from({ length: 3 - bill.items.length }).map((_, i) => (
                            <tr key={`empty-${i}`} className="text-transparent">
                                <td className="border border-gray-300 p-1">&nbsp;</td>
                                <td colSpan="10" className="border border-gray-300 p-1"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-start mt-2">
                <div className="w-1/2 pr-8">
                    <div className="py-2">
                        <p className="text-xs font-bold text-gray-500 uppercase">Amount in Words:</p>
                        <p className="text-xs font-semibold italic capitalize mt-1 text-gray-800">{convertAmountToWords(roundedGrandTotal)}</p>
                    </div>
                    
                    <div className="mt-4 text-[9px] text-gray-600">
                        <p className="font-bold text-[10px]">Terms & Conditions:</p>
                        <ul className="list-disc pl-4 mt-1 space-y-0.5">
                            <li>One year manufacturing defect warranty on Branded Frames is provided from the date of purchase</li>
                            <li>Orders once placed, cannot be altered / changed or cancelled.</li>
                            <li>Orders placed should be collected within 20 days from the date of order placement.</li>
                            <li>Orders placed with customer's own frame or own lenses will be undertaken at customer's own risk only.</li>
                            <li>All disputes on products or services are subject to Ramanathapuram Jurisdiction only.</li>
                        </ul>
                    </div>
                </div>

                <div className="w-1/2 pl-8">
                    <div className="space-y-1 text-right text-xs">
                         <div className="flex justify-between text-gray-600">
                             <span>Round Off :</span> 
                             <span>{roundOffAmount > 0 ? '+' : ''}{roundOffAmount.toFixed(2)}</span>
                         </div>
                        
                        <div className="flex justify-between font-bold text-lg border-t border-gray-400 pt-1 mt-1 text-black">
                            <span>Grand Total :</span> <span>{roundedGrandTotal}</span>
                        </div>
                    </div>
                    
                    {/* Payment Breakdown Section */}
                    <div className="border border-gray-300 p-2 rounded mt-4">
                        <p className="text-xs font-bold text-gray-700 mb-1">Payment Details</p>
                        <div className="text-[10px] space-y-1">
                            {/* Show only used payment methods */}
                            {cash > 0 && <div className="flex justify-between"><span>Cash :</span> <span>{cash}</span></div>}
                            {upi > 0 && <div className="flex justify-between"><span>UPI :</span> <span>{upi}</span></div>}
                            {card > 0 && <div className="flex justify-between"><span>Card :</span> <span>{card}</span></div>}
                            
                            <div className="flex justify-between border-t border-gray-200 mt-1 pt-1 font-bold">
                                <span>Total Paid :</span> <span>{totalPaid}</span>
                            </div>

                            {isDelivered ? (
                                <>
                                     <div className="flex justify-between text-green-700 font-bold border-t pt-1 mt-1"><span>Payment Status :</span> <span>PAID FULL</span></div>
                                </>
                            ) : (
                                <div className="flex justify-between text-red-600 font-bold border-t pt-1 mt-1"><span>Balance To Pay :</span> <span>{safeAmount(bill.remaining)}</span></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4 text-[9px] font-medium text-gray-800">
                <div className="border border-gray-300 rounded-md p-3">
                    <p className="font-semibold text-gray-900 mb-2 text-[10px] text-center">
                        Free Maintenance
                    </p>
                    <ul className="space-y-1 text-[9px]">
                        <li>• Ultrasonic cleaning</li>
                        <li>• Nose pad replacement</li>
                        <li>• Frame alignment</li>
                    </ul>
                </div>

                <div className="border border-gray-300 rounded-md p-3 flex flex-col items-center justify-center text-center">
                    <p className="font-semibold text-gray-900 text-[10px] mb-1">
                        Accurate Eye Test
                    </p>
                    <p className="text-[9px]">Certified Optometrists</p>
                </div>
            </div>
            
            <div className="mt-auto pt-6">
                <div className="flex justify-between items-end">
                    <div className="text-center w-1/3">
                         <div className="h-8"></div>
                         <p className="text-gray-500 text-[10px] border-t border-gray-300 pt-1">Customer Signature</p>
                    </div>
                    <div className="text-center w-1/3">
                        <p className="font-bold text-sm">Authorized Signatory</p>
                        <p className="text-[9px] text-gray-500">For NxtEye Optical</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;