import React, { useState, useEffect, useMemo } from "react";
import {
    Search,
    ChevronUp,
    ChevronDown,
    Eye,
    Printer,
    FileText,
    X,
    ArrowLeft,
    FileSpreadsheet,
    Trash2,
    Edit // Added Edit Icon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/dashboard/Layout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

const API_URL = import.meta.env.VITE_APP_BASE_URL;

// --- HELPER FUNCTIONS ---

// Updated: Rounds off amount and removes decimal points (Like Delivered.jsx)
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
// 1. PURCHASE INVOICE TEMPLATE (For Modal Print)
// ==========================================
const PurchaseInvoiceTemplate = ({ bill }) => {
    if (!bill) return null;

    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalDiscount = 0;

    const processedItems = bill.items.map(item => {
        const qty = parseFloat(item.stock) || 0;
        const price = parseFloat(item.itemPrice) || 0;
        const discount = parseFloat(item.discount) || 0; // Discount
        
        const rawAmount = price * qty;
        const discountAmount = rawAmount * (discount / 100);
        const taxableValue = rawAmount - discountAmount;

        const cgstPer = parseFloat(item.cgstPercent) || 0;
        const sgstPer = parseFloat(item.sgstPercent) || 0;

        const cgstAmt = taxableValue * (cgstPer / 100);
        const sgstAmt = taxableValue * (sgstPer / 100);
        const netAmount = taxableValue + cgstAmt + sgstAmt;

        totalTaxable += taxableValue;
        totalCGST += cgstAmt;
        totalSGST += sgstAmt;
        totalDiscount += discountAmount;

        return { 
            ...item, 
            taxableValue, 
            cgstAmt, 
            sgstAmt, 
            discountAmount,
            netAmount 
        };
    });

    const roundedGrandTotal = Math.round(bill.grandTotal || (totalTaxable + totalCGST + totalSGST));

    return (
        <div className="invoice-box bg-white text-black p-8 h-full flex flex-col justify-between">
            <div>
                {/* HEADER */}
                <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-800 uppercase tracking-wide">{bill.vendor?.vendorName}</h1>
                        <p className="text-gray-700 font-medium mt-1 w-64">{bill.vendor?.address || "Address Not Available"}</p>
                        <p className="text-gray-700 mt-1">GSTIN: <span className="font-bold">{bill.vendor?.gstin || "N/A"}</span></p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-gray-800 uppercase">Purchase Invoice</h2>
                        <p className="mt-2 text-gray-700">Invoice No: <span className="font-bold text-black text-lg">{bill.vendor?.invoiceNumber}</span></p>
                        <p className="text-gray-700">Date: <span className="font-bold">{bill.vendor?.purchaseDate}</span></p>
                    </div>
                </div>

                {/* BILL TO */}
                <div className="mb-6 border border-gray-300 p-3 rounded bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Receiver (Billed To):</h3>
                        <p className="text-base font-bold text-blue-900">NxtEye Optical</p>
                        <p className="text-gray-700">75/1, MRM Complex, Faizal Nagar Road, Kenikarai,<br /> Ramanathapuram - 623504</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-700">Phone: <b>7869369994</b></p>
                        <p className="text-gray-700">GSTIN: <b>33FRXPS5282K1ZQ</b></p>
                    </div>
                </div>

                {/* ITEMS TABLE */}
                <div className="mb-2">
                    <table className="w-full border-collapse border border-gray-300 text-[11px]">
                        <thead className="bg-gray-100 text-gray-800 font-bold">
                            <tr>
                                <th className="border border-gray-300 p-1 text-center w-8">Sn</th>
                                <th className="border border-gray-300 p-1 text-left">Item Name</th>
                                <th className="border border-gray-300 p-1 text-center w-16">HSN</th>
                                <th className="border border-gray-300 p-1 text-center w-8">Qty</th>
                                <th className="border border-gray-300 p-1 text-right w-16">Rate</th>
                                {/* Added Discount Column */}
                                <th className="border border-gray-300 p-1 text-right w-16">Disc</th>
                                <th className="border border-gray-300 p-1 text-right w-20">Taxable</th>
                                <th className="border border-gray-300 p-1 text-center w-10">GST%</th>
                                <th className="border border-gray-300 p-1 text-right w-16">CGST</th>
                                <th className="border border-gray-300 p-1 text-right w-16">SGST</th>
                                <th className="border border-gray-300 p-1 text-right w-20">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="border border-gray-300 p-1 text-center">{idx + 1}</td>
                                    <td className="border border-gray-300 p-1 font-medium">{item.itemName} <span className="text-[9px] text-gray-500">({item.itemType})</span></td>
                                    <td className="border border-gray-300 p-1 text-center">{item.hsn || "-"}</td>
                                    <td className="border border-gray-300 p-1 text-center">{item.stock}</td>
                                    <td className="border border-gray-300 p-1 text-right">{Math.round(item.itemPrice)}</td>
                                    
                                    {/* Discount Column */}
                                    <td className="border border-gray-300 p-1 text-right text-red-600">
                                        {item.discount > 0 ? (
                                            <>
                                            <span className="text-[9px]">{item.discount}%<br/></span>
                                            {Math.round(item.discountAmount)}
                                            </>
                                        ) : "-"}
                                    </td>

                                    <td className="border border-gray-300 p-1 text-right font-medium">{Math.round(item.taxableValue)}</td>
                                    <td className="border border-gray-300 p-1 text-center">{item.cgstPercent + item.sgstPercent}%</td>
                                    <td className="border border-gray-300 p-1 text-right text-gray-600">{Math.round(item.cgstAmt)}</td>
                                    <td className="border border-gray-300 p-1 text-right text-gray-600">{Math.round(item.sgstAmt)}</td>
                                    <td className="border border-gray-300 p-1 text-right font-bold">{Math.round(item.netAmount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FOOTER SECTION */}
            <div className="mt-2">
                <div className="flex justify-between items-start">
                    <div className="w-1/2 pr-4">
                        <div className="border border-gray-300 p-2 bg-gray-50 rounded mb-2">
                            <p className="text-[10px] font-bold text-gray-500 uppercase">Total Invoice Amount in Words:</p>
                            <p className="text-sm font-bold italic capitalize mt-1 text-gray-800">
                                {convertAmountToWords(roundedGrandTotal)}
                            </p>
                        </div>
                    </div>
                    <div className="w-1/2 pl-4">
                        <table className="w-full border-collapse border border-gray-300 text-xs mb-3">
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 p-1 font-medium text-gray-600 text-right">Total Taxable Value:</td>
                                    <td className="border border-gray-300 p-1 text-right font-bold text-gray-800">{Math.round(totalTaxable)}</td>
                                </tr>
                                {totalDiscount > 0 && (
                                    <tr>
                                        <td className="border border-gray-300 p-1 font-medium text-red-600 text-right">Total Discount:</td>
                                        <td className="border border-gray-300 p-1 text-right font-bold text-red-600">-{Math.round(totalDiscount)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td className="border border-gray-300 p-1 font-medium text-gray-600 text-right">Total Tax (CGST+SGST):</td>
                                    <td className="border border-gray-300 p-1 text-right font-bold text-gray-800">{Math.round(totalCGST + totalSGST)}</td>
                                </tr>
                                <tr className="bg-blue-900 text-white">
                                    <td className="border border-blue-900 p-2 font-bold text-right uppercase text-sm">Grand Total:</td>
                                    <td className="border border-blue-900 p-2 text-right font-extrabold text-lg">{roundedGrandTotal}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- PREVIEW MODAL ---
const BillPreviewModal = ({ bill, onClose, onPrintSingle }) => {
    if (!bill) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center p-4 border-b bg-white rounded-t-xl z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Purchase Bill Preview</h2>
                        <p className="text-xs text-gray-500">GST Input Tax Credit Format</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => onPrintSingle(bill)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold shadow-md transition"
                        >
                            <Printer size={18} /> Print Bill
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition">
                            <X size={24} />
                        </button>
                    </div>
                </div>
                <div className="grow overflow-y-auto bg-gray-100 p-8">
                    <div className="mx-auto bg-white shadow-2xl max-w-[210mm] min-h-[297mm] overflow-hidden">
                        <PurchaseInvoiceTemplate bill={bill} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
const PurchaseHistory = () => {
    const navigate = useNavigate();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [selectedBill, setSelectedBill] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showAllItems, setShowAllItems] = useState(false);
    
    // Print State
    const [printMode, setPrintMode] = useState(null);
    const [billToPrint, setBillToPrint] = useState(null);

    const ROWS_TO_SHOW = 15;

    const fetchBills = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/purchase-bills/all`);
            const data = await res.json();
            if (res.ok) setBills(data);
            else toast.error("Failed to fetch purchase history");
        } catch (error) {
            console.error(error);
            toast.error("Server Error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    // Print Trigger Effect
    useEffect(() => {
        if (printMode) {
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [printMode, billToPrint]);

    const handleDeleteBill = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this purchase bill?")) return;
        try {
            const res = await fetch(`${API_URL}/api/purchase-bills/delete/${id}`, { method: "DELETE" });
            if (res.ok) {
                setBills((prevBills) => prevBills.filter((bill) => bill._id !== id));
                toast.success("Purchase Bill Deleted Successfully");
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to delete bill");
            }
        } catch (error) {
            toast.error("Error deleting bill");
        }
    };

    // --- NEW: EDIT FUNCTION ---
    const handleEditBill = (bill) => {
        // Navigates to the Purchase Bill Entry page with data populated
        navigate('/purchase-bill', { state: { editMode: true, billData: bill } });
    };

    // --- FILTER LOGIC ---
    const filteredBills = bills.filter((bill) => {
        const term = searchTerm.toLowerCase();
        const matchesTerm = (bill.vendor?.vendorName?.toLowerCase() || "").includes(term) || (bill.vendor?.invoiceNumber?.toLowerCase() || "").includes(term);
        let matchesDate = true;
        if (fromDate || toDate) {
            const billDate = new Date(bill.vendor?.purchaseDate);
            if (fromDate) matchesDate = matchesDate && (billDate >= new Date(fromDate));
            if (toDate) matchesDate = matchesDate && (billDate <= new Date(toDate));
        }
        return matchesTerm && matchesDate;
    });

    // --- NEW: Process Rows for Item-Wise View (Matching Delivered.jsx logic) ---
    const processedRows = useMemo(() => {
        const rows = [];
        filteredBills.forEach(bill => {
            bill.items.forEach(item => {
                const qty = parseFloat(item.stock) || 0;
                const price = parseFloat(item.itemPrice) || 0;
                const discountPercent = parseFloat(item.discount) || 0;
                
                const rawAmount = price * qty;
                const discountAmount = rawAmount * (discountPercent / 100);
                const taxableValue = rawAmount - discountAmount;

                const cgstPer = parseFloat(item.cgstPercent) || 0;
                const sgstPer = parseFloat(item.sgstPercent) || 0;
                const gstRate = cgstPer + sgstPer;

                const cgstAmt = taxableValue * (cgstPer / 100);
                const sgstAmt = taxableValue * (sgstPer / 100);
                const netAmount = taxableValue + cgstAmt + sgstAmt;

                rows.push({
                    _id: `${bill._id}-${item._id || Math.random()}`,
                    originalBill: bill,
                    purchaseDate: bill.vendor?.purchaseDate,
                    invoiceNumber: bill.vendor?.invoiceNumber,
                    vendorName: bill.vendor?.vendorName,
                    itemName: item.itemName,
                    hsn: item.hsn || "-",
                    qty: qty,
                    rate: Math.round(price),
                    discountPercent: discountPercent,
                    discountAmt: Math.round(discountAmount),
                    taxable: Math.round(taxableValue),
                    cgst: Math.round(cgstAmt),
                    sgst: Math.round(sgstAmt),
                    gstPercent: gstRate,
                    total: Math.round(netAmount)
                });
            });
        });
        return rows;
    }, [filteredBills]);

    const displayedRows = showAllItems ? processedRows : processedRows.slice(0, ROWS_TO_SHOW);

    // --- SUMMARY TOTALS (Rounded) ---
    const totals = processedRows.reduce((acc, row) => {
        acc.taxable += row.taxable;
        acc.cgst += row.cgst;
        acc.sgst += row.sgst;
        acc.total += row.total;
        return acc;
    }, { taxable: 0, cgst: 0, sgst: 0, total: 0 });

    const handlePrintSingle = (bill) => {
        setBillToPrint(bill);
        setPrintMode('single');
    };

    const handleExportExcel = () => {
        if (processedRows.length === 0) return toast.warn("No data to export");
        const dataToExport = processedRows.map(row => ({
            "Date": row.purchaseDate,
            "Inv No": row.invoiceNumber,
            "Vendor": row.vendorName,
            "Item Name": row.itemName,
            "HSN": row.hsn,
            "Qty": row.qty,
            "Rate": row.rate,
            "Disc %": row.discountPercent,
            "Disc Amt": row.discountAmt,
            "Taxable": safeAmount(row.taxable),
            "GST %": row.gstPercent,
            "CGST": safeAmount(row.cgst),
            "SGST": safeAmount(row.sgst),
            "Total": safeAmount(row.total)
        }));

        dataToExport.push({
            "Date": "TOTALS", "Inv No": "", "Vendor": "", "Item Name": "", "HSN": "", "Qty": "", "Rate": "", "Disc %": "", "Disc Amt": "",
            "Taxable": safeAmount(totals.taxable),
            "GST %": "",
            "CGST": safeAmount(totals.cgst),
            "SGST": safeAmount(totals.sgst),
            "Total": safeAmount(totals.total)
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase_Register");
        XLSX.writeFile(workbook, `Purchase_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success("Excel exported successfully!");
    };

    return (
        <Layout>
            <style>
                {`
                    @media print {
                        @page { size: auto; margin: 0; }
                        body * { visibility: hidden; }
                        
                        /* SHOW SINGLE INVOICE */
                        #printable-invoice, #printable-invoice * { 
                            visibility: ${printMode === 'single' ? 'visible' : 'hidden'}; 
                        }

                        #printable-invoice {
                            display: ${printMode === 'single' ? 'block' : 'none'} !important;
                            position: absolute; left: 0; top: 0; width: 210mm; height: 297mm; z-index: 9999;
                        }

                        nav, aside, .layout-content, .Toastify, .modal-backdrop { display: none !important; }
                    }
                `}
            </style>

            <div className="bg-white shadow-md rounded-lg p-6 min-h-screen flex flex-col">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/purchase-bill')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Purchase History</h2>
                            <p className="text-sm text-gray-500">Item-wise details of all purchases</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleExportExcel} className="flex items-center gap-2 px-6 py-2 bg-[#5ce1e6] text-[#03214a] font-bold rounded-full hover:bg-[#03214a] hover:text-white transition shadow-md disabled:opacity-50">
                            <FileSpreadsheet size={18} /> Excel
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100 items-end">
                    <div className="relative w-full sm:max-w-xs">
                        <label className="text-xs font-semibold text-gray-500 ml-1">Search</label>
                        <input type="text" className="w-full border rounded-md px-3 py-2 text-sm outline-none" placeholder="Vendor/Invoice..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="relative w-full sm:max-w-[150px]">
                        <label className="text-xs font-semibold text-gray-500 ml-1">From Date</label>
                        <input type="date" className="w-full border rounded-md px-3 py-2 text-sm outline-none text-gray-600" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    </div>
                    <div className="relative w-full sm:max-w-[150px]">
                        <label className="text-xs font-semibold text-gray-500 ml-1">To Date</label>
                        <input type="date" className="w-full border rounded-md px-3 py-2 text-sm outline-none text-gray-600" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                    <div className="ml-auto">
                        <button onClick={() => { setSearchTerm(""); setFromDate(""); setToDate(""); }} className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md text-sm font-bold hover:bg-gray-300 transition">Clear</button>
                    </div>
                </div>

                {/* TABLE (UPDATED TO MATCH DELIVERED.JSX STYLE) */}
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm grow">
                    <table className="min-w-full text-xs text-left text-gray-700">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 font-bold whitespace-nowrap">
                            <tr>
                                <th className="px-3 py-3 border-b">Date</th>
                                <th className="px-3 py-3 border-b text-center">Inv No</th>
                                <th className="px-3 py-3 border-b">Vendor</th>
                                <th className="px-3 py-3 border-b text-center">GST %</th>
                                <th className="px-3 py-3 border-b text-center">Item</th>
                                <th className="px-3 py-3 border-b text-center">Qty</th>
                                <th className="px-3 py-3 border-b text-right">Rate</th>
                                <th className="px-3 py-3 border-b text-right text-red-600">Disc</th>
                                <th className="px-3 py-3 border-b text-right">Taxable</th>
                                <th className="px-3 py-3 border-b text-right">CGST</th>
                                <th className="px-3 py-3 border-b text-right">SGST</th>
                                <th className="px-3 py-3 border-b text-right text-black font-bold">Total</th>
                                <th className="px-3 py-3 border-b text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="13" className="p-6 text-center text-gray-500 animate-pulse">Loading...</td></tr>
                            ) : displayedRows.length === 0 ? (
                                <tr><td colSpan="13" className="p-6 text-center text-gray-500">No records found.</td></tr>
                            ) : (
                                displayedRows.map((row) => (
                                    <tr key={row._id} className="bg-white border-b hover:bg-blue-50 transition-colors">
                                        <td className="px-3 py-2 whitespace-nowrap">{row.purchaseDate}</td>
                                        <td className="px-3 py-2 text-center text-blue-600 font-semibold">{row.invoiceNumber}</td>
                                        <td className="px-3 py-2 truncate max-w-[120px]" title={row.vendorName}>{row.vendorName}</td>
                                        <td className="px-3 py-2 text-center">{row.gstPercent}%</td>
                                        <td className="px-3 py-2 text-center truncate max-w-[100px]" title={row.itemName}>{row.itemName}</td>
                                        <td className="px-3 py-2 text-center">{row.qty}</td>
                                        <td className="px-3 py-2 text-right">{row.rate}</td>
                                        
                                        {/* Discount Column */}
                                        <td className="px-3 py-2 text-right text-red-600">
                                            {row.discountAmt > 0 ? row.discountAmt : "-"}
                                        </td>

                                        <td className="px-3 py-2 text-right">{safeAmount(row.taxable)}</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{safeAmount(row.cgst)}</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{safeAmount(row.sgst)}</td>
                                        <td className="px-3 py-2 text-right font-bold text-black">{safeAmount(row.total)}</td>
                                        
                                        <td className="px-3 py-2 text-center flex justify-center gap-1">
                                            {/* EDIT BUTTON */}
                                            <button 
                                                onClick={() => handleEditBill(row.originalBill)} 
                                                className="bg-yellow-50 text-yellow-600 p-1.5 rounded-full hover:bg-yellow-100 transition"
                                                title="Edit Bill"
                                            >
                                                <Edit size={14} />
                                            </button>

                                            <button 
                                                onClick={() => { setSelectedBill(row.originalBill); setShowPreview(true); }} 
                                                className="bg-blue-50 text-blue-600 p-1.5 rounded-full hover:bg-blue-100 transition"
                                                title="View/Print Bill"
                                            >
                                                <Eye size={14} />
                                            </button>

                                            <button 
                                                onClick={() => handleDeleteBill(row.originalBill._id)} 
                                                className="bg-red-50 text-red-600 p-1.5 rounded-full hover:bg-red-100 transition"
                                                title="Delete Bill"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-300">
                            <tr>
                                <td colSpan="8" className="px-3 py-3 text-right uppercase text-gray-600">Overall Totals:</td>
                                <td className="px-3 py-3 text-right">{safeAmount(totals.taxable)}</td>
                                <td className="px-3 py-3 text-right">{safeAmount(totals.cgst)}</td>
                                <td className="px-3 py-3 text-right">{safeAmount(totals.sgst)}</td>
                                <td className="px-3 py-3 text-right text-black text-sm">{safeAmount(totals.total)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* PAGINATION */}
                {processedRows.length > ROWS_TO_SHOW && (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={() => setShowAllItems(!showAllItems)}
                            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-full font-medium shadow-sm transition"
                        >
                            {showAllItems ? (<>Show Less <ChevronUp size={18} /></>) : (<>Show More ({processedRows.length - ROWS_TO_SHOW} rows) <ChevronDown size={18} /></>)}
                        </button>
                    </div>
                )}
            </div>

            {/* 2. Single Purchase Bill Invoice */}
            <div id="printable-invoice" style={{ display: 'none' }}>
                <PurchaseInvoiceTemplate bill={billToPrint} />
            </div>

            {showPreview && <BillPreviewModal bill={selectedBill} onClose={() => setShowPreview(false)} onPrintSingle={handlePrintSingle} />}

            <ToastContainer position="top-right" autoClose={2000} />
        </Layout>
    );
};

export default PurchaseHistory;