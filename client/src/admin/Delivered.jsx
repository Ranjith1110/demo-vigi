import React, { useState, useEffect, useMemo } from "react";
import {
    ChevronUp,
    ChevronDown,
    CheckCircle,
    FileSpreadsheet,
    Printer,
    Edit,
    Trash2 // 1. Import Delete Icon
} from "lucide-react";
import Layout from "../components/dashboard/Layout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom"; 

const API_URL = import.meta.env.VITE_APP_BASE_URL;

// --- HELPER FUNCTIONS ---

// Rounds off amount and removes decimal points
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
    // Using rounded integer part for words
    const roundedAmount = Math.round(amount);
    return numberToWords(roundedAmount);
};

// ==========================================
// 1. INVOICE TEMPLATE (For Individual Bill Print)
// ==========================================
const InvoiceTemplate = ({ bill }) => {
    if (!bill) return null;

    // --- Calculations to match OrderSummary logic ---
    // Rounding Grand Total
    const roundedGrandTotal = Math.round(bill.grandTotal);
    
    const scalingFactor = bill.taxScalingFactor !== undefined ? bill.taxScalingFactor : 1;
    const discountPercent = bill.discountPercent || 0;

    // GST Breakup Calculation
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
        <div className="invoice-box bg-white text-black ms-5 p-4">
            {/* Header */}
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
            
            {/* Customer Details */}
            <div className="mb-4 border border-gray-300 p-3 rounded mt-4">
                <div className="flex justify-between">
                    <div className="w-1/2">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bill To:</h3>
                        <p className="text-base font-bold text-gray-900">{bill.customer?.customerName || "Walk-in Customer"}</p>
                        <p className="text-gray-700 text-xs">{bill.customer?.address || "Address not provided"}</p>
                        <p className="text-gray-700 text-xs mt-1">Mobile: <b>{bill.customer?.mobileNumber}</b></p>
                    </div>
                    <div className="w-1/2 text-right">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order Details:</h3>
                        <p className="text-gray-700 text-xs">Payment Mode: {bill.paymentMethod}</p>
                        <p className="text-gray-700 text-xs">Status: <b>DELIVERED</b></p>
                    </div>
                </div>
            </div>

            {/* Detailed Items Table */}
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
                                    <td className="border border-gray-300 p-1 text-center">{item.itemType || item.type || "-"}</td>
                                    <td className="border border-gray-300 p-1 text-center">{item.hsn || "-"}</td>
                                    <td className="border border-gray-300 p-1 text-center">{qty}</td>
                                    {/* Rounding: Rate */}
                                    <td className="border border-gray-300 p-1 text-right">{Math.round(price)}</td>
                                    
                                    <td className="border border-gray-300 p-1 text-right text-gray-600">
                                        {discountPercent > 0 ? (
                                            <>
                                                <span className="text-[9px]">{discountPercent}% / </span>
                                                {/* Rounding: Discount Amt */}
                                                {Math.round(lineDiscountAmt)}
                                            </>
                                        ) : "-"}
                                    </td>

                                    <td className="border border-gray-300 p-1 text-right">{(Number(item.cgst)+Number(item.sgst))}%</td>
                                    {/* Rounding: Tax Amts */}
                                    <td className="border border-gray-300 p-1 text-right">{Math.round(cgstAmt)}</td>
                                    <td className="border border-gray-300 p-1 text-right">{Math.round(sgstAmt)}</td>
                                    
                                    {/* Rounding: Item Total */}
                                    <td className="border border-gray-300 p-1 text-right font-bold">{Math.round(lineTotalWithTax)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer Section */}
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
                        
                        {Number(bill.discountAmount) > 0 && (
                             <div className="flex justify-between text-red-600"><span>Discount :</span> <span>- {Math.round(bill.discountAmount)}</span></div>
                        )}

                        <div className="flex justify-between font-bold text-lg border-t border-gray-400 pt-1 mt-1 text-black">
                            {/* Rounding: Grand Total */}
                            <span>Grand Total :</span> <span>{roundedGrandTotal}</span>
                        </div>
                    </div>
                    
                    <div className="border border-gray-300 p-2 rounded mt-4">
                        <p className="text-xs font-bold text-gray-700 mb-1">Payment Details</p>
                        <div className="text-[10px] space-y-1">
                            <div className="flex justify-between text-green-600 font-bold">
                                <span>Payment Status :</span> 
                                <span>PAID FULL</span>
                            </div>
                             <div className="flex justify-between">
                                <span>Total Amount :</span> 
                                <span>{safeAmount(roundedGrandTotal)}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 mt-1 pt-1"><span>Mode :</span> <span>{bill.paymentMethod}</span></div>
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

// ==========================================
// MAIN COMPONENT
// ==========================================
const Delivered = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [showAllItems, setShowAllItems] = useState(false);
    const [printBillData, setPrintBillData] = useState(null);

    const navigate = useNavigate(); 
    const ROWS_TO_SHOW = 15;

    // --- Data Fetching Logic (Refactored to be callable) ---
    const fetchDeliveredBills = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/billing/all?type=delivered`);
            const data = await res.json();
            setBills(data);
        } catch (error) {
            toast.error("Failed to fetch history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveredBills();
    }, []);

    // --- Handle Edit Function ---
    const handleEdit = (bill) => {
        navigate("/order-summary", { state: { editMode: true, billData: bill } });
    };

    // --- 2. Handle Delete Function ---
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this delivered record?")) return;

        try {
            const res = await fetch(`${API_URL}/api/billing/delete/${id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                toast.success("Record deleted successfully");
                fetchDeliveredBills(); // Refresh list
            } else {
                toast.error("Failed to delete record");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error deleting record");
        }
    };

    const filteredBills = bills.filter((bill) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            bill.invoiceNo.toLowerCase().includes(searchLower) ||
            bill.customer.customerName.toLowerCase().includes(searchLower) ||
            bill.customer.mobileNumber.includes(searchTerm);

        let matchesDate = true;
        if (fromDate || toDate) {
            const billDate = new Date(bill.createdAt || bill.date);
            const bDate = new Date(billDate.getFullYear(), billDate.getMonth(), billDate.getDate());

            if (fromDate) {
                const fDate = new Date(fromDate);
                fDate.setHours(0, 0, 0, 0);
                matchesDate = matchesDate && (bDate >= fDate);
            }
            if (toDate) {
                const tDate = new Date(toDate);
                tDate.setHours(23, 59, 59, 999);
                matchesDate = matchesDate && (bDate <= tDate);
            }
        }
        return matchesSearch && matchesDate;
    });

    const processedRows = useMemo(() => {
        const rows = [];
        filteredBills.forEach(bill => {
            let scalingFactor = bill.taxScalingFactor;
            const discountPercent = bill.discountPercent || 0;

            if (scalingFactor === undefined) {
                const rawSubTotal = bill.subTotal || bill.items.reduce((acc, i) => acc + (Number(i.itemPrice) * (i.quantity || 1)), 0);
                const discountAmt = rawSubTotal * (discountPercent / 100);
                const netTaxable = rawSubTotal - discountAmt;
                scalingFactor = rawSubTotal > 0 ? (netTaxable / rawSubTotal) : 1;
            }

            bill.items.forEach(item => {
                const qty = item.quantity || 1;
                const price = Number(item.itemPrice);
                const rawLineTotal = price * qty;
                const itemTaxable = rawLineTotal * scalingFactor;
                const cgstRate = Number(item.cgst) || 0;
                const sgstRate = Number(item.sgst) || 0;
                const itemCgstAmt = itemTaxable * (cgstRate / 100);
                const itemSgstAmt = itemTaxable * (sgstRate / 100);
                const itemTotal = itemTaxable + itemCgstAmt + itemSgstAmt;

                rows.push({
                    _id: `${bill._id}-${item._id}`, 
                    originalBill: bill, 
                    receiverName: bill.customer.customerName,
                    invNo: bill.invoiceNo,
                    invDate: bill.date.split(',')[0],
                    invoiceValue: Math.round(bill.grandTotal), 
                    hsn: item.hsn || "-",
                    taxable: Math.round(itemTaxable), 
                    cgst: Math.round(itemCgstAmt),
                    sgst: Math.round(itemSgstAmt),
                    gstPercent: cgstRate + sgstRate,
                    qty: qty,
                    total: Math.round(itemTotal) 
                });
            });
        });
        return rows;
    }, [filteredBills]);

    const displayedRows = showAllItems ? processedRows : processedRows.slice(0, ROWS_TO_SHOW);

    const totals = processedRows.reduce((acc, row) => {
        acc.taxable += row.taxable;
        acc.cgst += row.cgst;
        acc.sgst += row.sgst;
        acc.total += row.total;
        return acc;
    }, { taxable: 0, cgst: 0, sgst: 0, total: 0 });

    const handleExportExcel = () => {
        if (processedRows.length === 0) return toast.warn("No data to export");
        const dataToExport = processedRows.map(row => ({
            "Receiver Name": row.receiverName,
            "Inv No": row.invNo,
            "Inv Date": row.invDate,
            "Invoice Value": safeAmount(row.invoiceValue),
            "HSNCODE": row.hsn,
            "Taxable": safeAmount(row.taxable),
            "CGST": safeAmount(row.cgst),
            "SGST": safeAmount(row.sgst),
            "GST %": row.gstPercent,
            "QTY": row.qty,
            "TOTAL": safeAmount(row.total)
        }));

        dataToExport.push({
            "Receiver Name": "OVERALL TOTALS",
            "Inv No": "", "Inv Date": "", "Invoice Value": "", "HSNCODE": "",
            "Taxable": safeAmount(totals.taxable),
            "CGST": safeAmount(totals.cgst),
            "SGST": safeAmount(totals.sgst),
            "GST %": "",
            "QTY": "",
            "TOTAL": safeAmount(totals.total)
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Delivered_Report");
        XLSX.writeFile(workbook, `Delivered_Register_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success("Excel exported successfully!");
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFromDate("");
        setToDate("");
    };

    const handlePrintBill = (bill) => {
        setPrintBillData(bill);
        setTimeout(() => {
            window.print();
        }, 500);
    };

    return (
        <Layout>
            <style>
                {`
                    @media print {
                        @page { size: A4; margin: 0; }
                        html, body {
                            height: 100%;
                            overflow: hidden !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        body * { visibility: hidden; }
                        
                        /* Only Print Invoice */
                        #printable-invoice, #printable-invoice * { 
                            visibility: visible; 
                        }
                        #printable-invoice {
                            display: block !important;
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            padding: 10mm;
                            page-break-after: avoid;
                            page-break-before: avoid;
                            height: auto;
                            z-index: 9999;
                        }
                        nav, aside, .layout-content, .Toastify, .modal-backdrop { display: none !important; }
                    }
                `}
            </style>

            <div className="bg-white shadow-md rounded-lg p-6 min-h-screen">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-full text-green-600">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Delivered History</h2>
                            <p className="text-sm text-gray-500">Item-wise details of completed orders</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 px-6 py-2 bg-[#5ce1e6] text-[#03214a] font-bold rounded-full hover:bg-[#03214a] hover:text-white transition shadow-md disabled:opacity-50">
                            <FileSpreadsheet size={16} /> Excel
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100 items-end">
                    <div className="relative w-full sm:max-w-xs">
                        <label className="text-xs font-semibold text-gray-500 ml-1">Search</label>
                        <input
                            type="text"
                            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                            placeholder="Bill No, Name, Mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full sm:max-w-[150px]">
                        <label className="text-xs font-semibold text-gray-500 ml-1">From Date</label>
                        <input
                            type="date"
                            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none text-gray-600"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full sm:max-w-[150px]">
                        <label className="text-xs font-semibold text-gray-500 ml-1">To Date</label>
                        <input
                            type="date"
                            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none text-gray-600"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <button onClick={clearFilters} className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md text-sm font-bold hover:bg-gray-300 transition">
                            Clear
                        </button>
                    </div>
                </div>

                {/* Table Logic */}
                <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white p-2">
                    <table className="min-w-full text-xs text-left text-gray-700">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 font-bold whitespace-nowrap">
                            <tr>
                                <th className="px-3 py-3 border-b">Receiver Name</th>
                                <th className="px-3 py-3 border-b text-center">InvNo</th>
                                <th className="px-3 py-3 border-b">Inv Date</th>
                                <th className="px-3 py-3 border-b text-right">Invoice Value</th>
                                <th className="px-3 py-3 border-b text-center">HSNCODE</th>
                                <th className="px-3 py-3 border-b text-right">Taxable</th>
                                <th className="px-3 py-3 border-b text-right">CGST</th>
                                <th className="px-3 py-3 border-b text-right">SGST</th>
                                <th className="px-3 py-3 border-b text-center">GST %</th>
                                <th className="px-3 py-3 border-b text-center">QTY</th>
                                <th className="px-3 py-3 border-b text-right">TOTAL</th>
                                <th className="px-3 py-3 border-b text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="12" className="p-6 text-center text-gray-500 animate-pulse">Loading history...</td></tr>
                            ) : displayedRows.length === 0 ? (
                                <tr><td colSpan="12" className="p-6 text-center text-gray-500">No data found.</td></tr>
                            ) : (
                                displayedRows.map((row) => (
                                    <tr key={row._id} className="bg-white border-b hover:bg-green-50 transition-colors">
                                        <td className="px-3 py-2 font-medium text-gray-900 truncate max-w-[150px]" title={row.receiverName}>{row.receiverName}</td>
                                        <td className="px-3 py-2 text-center text-blue-600 font-semibold">{row.invNo}</td>
                                        <td className="px-3 py-2 whitespace-nowrap">{row.invDate}</td>
                                        <td className="px-3 py-2 text-right font-medium text-gray-600">{safeAmount(row.invoiceValue)}</td>
                                        <td className="px-3 py-2 text-center">{row.hsn}</td>
                                        <td className="px-3 py-2 text-right">{safeAmount(row.taxable)}</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{safeAmount(row.cgst)}</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{safeAmount(row.sgst)}</td>
                                        <td className="px-3 py-2 text-center">{row.gstPercent}%</td>
                                        <td className="px-3 py-2 text-center">{row.qty}</td>
                                        <td className="px-3 py-2 text-right font-bold text-green-700">{safeAmount(row.total)}</td>
                                        <td className="px-3 py-2 text-center flex justify-center gap-1">
                                            {/* EDIT BUTTON */}
                                            <button
                                                onClick={() => handleEdit(row.originalBill)}
                                                className="bg-yellow-50 text-yellow-600 p-1.5 rounded-full hover:bg-yellow-100 transition"
                                                title="Edit Invoice"
                                            >
                                                <Edit size={14} />
                                            </button>

                                            {/* PRINT BUTTON */}
                                            <button
                                                onClick={() => handlePrintBill(row.originalBill)}
                                                className="bg-gray-100 text-gray-700 p-1.5 rounded-full hover:bg-gray-200 transition"
                                                title="Print Invoice"
                                            >
                                                <Printer size={14} />
                                            </button>

                                            {/* 3. DELETE BUTTON */}
                                            <button
                                                onClick={() => handleDelete(row.originalBill._id)}
                                                className="bg-red-50 text-red-600 p-1.5 rounded-full hover:bg-red-100 transition"
                                                title="Delete Order"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot className="bg-gray-100 font-bold text-gray-800">
                            <tr>
                                <td colSpan="5" className="px-3 py-3 text-right text-gray-600 uppercase text-xs tracking-wider">Overall Totals:</td>
                                <td className="px-3 py-3 text-right">{safeAmount(totals.taxable)}</td>
                                <td className="px-3 py-3 text-right">{safeAmount(totals.cgst)}</td>
                                <td className="px-3 py-3 text-right">{safeAmount(totals.sgst)}</td>
                                <td colSpan="2"></td>
                                <td className="px-3 py-3 text-right text-black text-sm">{safeAmount(totals.total)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {processedRows.length > ROWS_TO_SHOW && (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={() => setShowAllItems(!showAllItems)}
                            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-full font-medium shadow-sm transition"
                        >
                            {showAllItems ? (
                                <>Show Less <ChevronUp size={18} /></>
                            ) : (
                                <>Show More ({processedRows.length - ROWS_TO_SHOW} rows) <ChevronDown size={18} /></>
                            )}
                        </button>
                    </div>
                )}
            </div>

            <ToastContainer position="top-right" autoClose={2000} />

            {/* --- PRINTABLE SECTION (Only for Individual Invoice) --- */}
            {printBillData && (
                <div id="printable-invoice" style={{ display: 'none' }}>
                    <InvoiceTemplate bill={printBillData} />
                </div>
            )}
        </Layout>
    );
};

export default Delivered;