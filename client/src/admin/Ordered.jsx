import React, { useState, useEffect } from "react";
import {
    Package,
    Printer,
    CheckCircle,
    X,
    FileSpreadsheet,
    ChevronUp,
    ChevronDown,
    Download,
    Trash2,
    Edit // Import Edit Icon
} from "lucide-react";
import Layout from "../components/dashboard/Layout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

const API_URL = import.meta.env.VITE_APP_BASE_URL;

// --- UTILITY FUNCTIONS ---
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
    const roundedAmount = Math.round(amount);
    return numberToWords(roundedAmount);
};

// --- INVOICE TEMPLATE ---
const InvoiceTemplate = ({ bill }) => {
    if (!bill) return null;

    const exactGrandTotal = Number(bill.grandTotal);
    const roundedGrandTotal = Math.round(exactGrandTotal);
    const advance = Number(bill.advance || 0);
    const dynamicRemaining = roundedGrandTotal - advance;
    const discountPercent = bill.discountPercent || 0;

    const isDelivered = bill.orderStatus?.delivered === true;

    return (
        <div className="invoice-box bg-white text-black ms-5 p-4">
            <div className="flex justify-between items-center border-b-2 border-gray-800 pb-2">
                <div>
                    <img src="/assets/dashboard/nxteye-logo.png" alt="Company Logo" className="h-10 w-auto object-contain mb-2" />
                    <p className="text-gray-700 font-medium mt-1">75/1, MRM Complex, Faizal Nagar Road,<br /> Kenikarai, Ramanathapuram - 623504</p>
                    <p className="text-gray-700">Phone: <span className="font-bold">7869369994</span></p>
                    <p className="text-gray-700">GSTIN: <span className="font-bold">33FRXPS5282K1ZQ</span></p>
                    <p className="text-gray-600">Website: <a href="https://nxteye.co.in/" className="font-bold">nxteye.co.in</a></p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-800 uppercase">
                        {isDelivered ? "Tax Invoice" : "Order Summary"}
                    </h2>
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
                    </div>
                    <div className="w-1/2 text-right">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order Details:</h3>
                        <p className="text-gray-700 text-xs">Payment Mode:</p>
                        <p className="text-gray-900 text-xs font-bold">{bill.paymentMethod || "Advance"}</p>
                        <p className="text-gray-700 text-xs mt-1">Status: <b>{isDelivered ? "DELIVERED" : "ORDERED"}</b></p>
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
                            const cgstAmt = lineTaxable * (Number(item.cgst) / 100);
                            const sgstAmt = lineTaxable * (Number(item.sgst) / 100);
                            const lineTotalWithTax = lineTaxable + cgstAmt + sgstAmt;

                            return (
                                <tr key={idx}>
                                    <td className="border border-gray-300 p-1 text-center">{idx + 1}</td>
                                    <td className="border border-gray-300 p-1 text-left"><div className="font-bold text-gray-900">{item.itemNumber}</div></td>
                                    <td className="border border-gray-300 p-1 text-center">{item.itemType || item.type || "-"}</td>
                                    <td className="border border-gray-300 p-1 text-center">{item.hsn || "-"}</td>
                                    <td className="border border-gray-300 p-1 text-center">{qty}</td>
                                    <td className="border border-gray-300 p-1 text-right">{Math.round(price)}</td>
                                    <td className="border border-gray-300 p-1 text-right text-gray-600">
                                        {discountPercent > 0 ? <><span className="text-[9px]">{discountPercent}% / </span>{Math.round(lineDiscountAmt)}</> : "-"}
                                    </td>
                                    <td className="border border-gray-300 p-1 text-right">{(Number(item.cgst) + Number(item.sgst))}%</td>
                                    <td className="border border-gray-300 p-1 text-right">{Math.round(cgstAmt)}</td>
                                    <td className="border border-gray-300 p-1 text-right">{Math.round(sgstAmt)}</td>
                                    <td className="border border-gray-300 p-1 text-right font-bold">{Math.round(lineTotalWithTax)}</td>
                                </tr>
                            )
                        })}
                        {bill.items.length < 3 && Array.from({ length: 3 - bill.items.length }).map((_, i) => (
                            <tr key={`empty-${i}`} className="text-transparent"><td colSpan="11" className="border border-gray-300 p-1">&nbsp;</td></tr>
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
                            <li>One year manufacturing defect warranty on Branded Frames.</li>
                            <li>Orders once placed, cannot be altered / changed or cancelled.</li>
                            <li>Orders placed should be collected within 20 days.</li>
                            <li>Customer's own frame/lenses at customer's own risk.</li>
                            <li>Subject to Ramanathapuram Jurisdiction only.</li>
                        </ul>
                    </div>
                </div>

                <div className="w-1/2 pl-8">
                    <div className="space-y-1 text-right text-xs">
                        <div className="flex justify-between font-bold text-lg border-t border-gray-400 pt-1 mt-1 text-black">
                            <span>Grand Total :</span> <span>{roundedGrandTotal}</span>
                        </div>
                    </div>
                    <div className="border border-gray-300 p-2 rounded mt-4">
                        <p className="text-xs font-bold text-gray-700 mb-1">Payment Details</p>
                        <div className="text-[10px] space-y-1">
                            <div className="flex justify-between"><span>Advance Received :</span> <span>{safeAmount(advance)}</span></div>
                            
                            <div className={`flex justify-between font-bold ${isDelivered ? "text-green-600" : "text-red-600"}`}>
                                <span>{isDelivered ? "Payment Completed :" : "Balance Due :"}</span>
                                <span>{safeAmount(dynamicRemaining)}</span>
                            </div>

                            <div className="border-t border-gray-200 mt-1 pt-1">
                                <span className="block mb-1">Mode :</span>
                                <span className="font-bold text-[9px] warp-break-words">{bill.paymentMethod || "Advance"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-[9px] font-medium text-gray-800">
                <div className="border border-gray-300 rounded-md p-3">
                    <p className="font-semibold text-gray-900 mb-2 text-[10px] text-center">Free Maintenance</p>
                    <ul className="space-y-1 text-[9px]">
                        <li>• Ultrasonic cleaning</li>
                        <li>• Nose pad replacement</li>
                        <li>• Frame alignment</li>
                    </ul>
                </div>
                <div className="border border-gray-300 rounded-md p-3 flex flex-col items-center justify-center text-center">
                    <p className="font-semibold text-gray-900 text-[10px] mb-1">Accurate Eye Test</p>
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

// --- BILL PREVIEW MODAL ---
const BillPreviewModal = ({ bill, onClose, onPrint, processing }) => {
    const [splits, setSplits] = useState({
        cash: "",
        upi: "",
        card: ""
    });

    if (!bill) return null;

    const balanceToPay = Math.round(Number(bill.remaining || 0));
    const currentTotal = (Number(splits.cash) || 0) + (Number(splits.upi) || 0) + (Number(splits.card) || 0);
    const difference = balanceToPay - currentTotal;
    const isMatched = difference === 0;

    const handleSplitChange = (e) => {
        const { name, value } = e.target;
        if (value && isNaN(value)) return;
        setSplits(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirm = () => {
        let methods = [];
        if (Number(splits.cash) > 0) methods.push(`Cash: ₹${Number(splits.cash)}`);
        if (Number(splits.upi) > 0) methods.push(`UPI: ₹${Number(splits.upi)}`);
        if (Number(splits.card) > 0) methods.push(`Card: ₹${Number(splits.card)}`);

        const finalMethodString = methods.length > 0 ? methods.join(' | ') : "Fully Paid";
        onPrint(bill, finalMethodString);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b bg-white rounded-t-xl z-10 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Invoice Preview</h2>
                        <p className="text-xs text-gray-500">Review final bill & collect balance payment</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center bg-gray-50 p-2 rounded-lg border border-gray-200 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col"><label className="text-[10px] font-bold text-gray-500 uppercase">Cash</label><input type="text" name="cash" value={splits.cash} onChange={handleSplitChange} className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" /></div>
                            <div className="flex flex-col"><label className="text-[10px] font-bold text-gray-500 uppercase">UPI</label><input type="text" name="upi" value={splits.upi} onChange={handleSplitChange} className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" /></div>
                            <div className="flex flex-col"><label className="text-[10px] font-bold text-gray-500 uppercase">Card</label><input type="text" name="card" value={splits.card} onChange={handleSplitChange} className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" /></div>
                        </div>

                        <div className="flex flex-col items-end min-w-[100px] border-l pl-3 border-gray-300">
                            <div className="text-xs text-gray-500">Required: <span className="font-bold text-black">₹{balanceToPay}</span></div>
                            <div className={`text-xs ${isMatched ? "text-green-600 font-bold" : "text-red-500 font-semibold"}`}>Entered: ₹{currentTotal}</div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={handleConfirm} disabled={processing || !isMatched} className={`flex items-center gap-2 text-white px-4 py-2 rounded-full font-bold shadow-md transition text-sm ${processing || !isMatched ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}>
                                {processing ? <span className="animate-spin">⌛</span> : <Printer size={16} />}
                                {processing ? "Processing..." : "Deliver"}
                            </button>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition"><X size={20} /></button>
                        </div>
                    </div>
                </div>

                <div className="grow overflow-y-auto bg-gray-100 p-8">
                    <div className="mx-auto bg-white shadow-2xl max-w-[210mm] min-h-[297mm] overflow-hidden transform transition-transform">
                        <InvoiceTemplate bill={{ 
                            ...bill,
                            orderStatus: { ...bill.orderStatus, delivered: true },
                            paymentMethod: (() => {
                                let m = [];
                                if (Number(splits.cash) > 0) m.push(`Cash: ${splits.cash}`);
                                if (Number(splits.upi) > 0) m.push(`UPI: ${splits.upi}`);
                                if (Number(splits.card) > 0) m.push(`Card: ${splits.card}`);
                                return m.length > 0 ? m.join(' | ') : "Pending Entry...";
                            })()
                        }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const Ordered = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [selectedBill, setSelectedBill] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showAllItems, setShowAllItems] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [printBillData, setPrintBillData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const navigate = useNavigate(); // Initialize hook
    const ROWS_TO_SHOW = 10;

    const fetchOrderedBills = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/billing/all?type=ordered`);
            const data = await res.json();
            setBills(data);
        } catch (error) {
            toast.error("Failed to fetch ordered list");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderedBills();
    }, []);

    // --- HANDLE DELIVER ---
    const handlePrintAndDeliver = async (bill, finalPaymentMethodString) => {
        setIsProcessing(true);
        try {
            const res = await fetch(`${API_URL}/api/billing/status/${bill._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'delivered',
                    paymentMethod: finalPaymentMethodString 
                })
            });

            if (!res.ok) throw new Error("Failed to update status");

            const updatedBill = { 
                ...bill, 
                paymentMethod: finalPaymentMethodString,
                orderStatus: { ...bill.orderStatus, delivered: true } 
            };
            setPrintBillData(updatedBill);

            toast.success("Order Delivered! Printing Bill...");

            setTimeout(() => {
                window.print();
                setIsProcessing(false);
                setShowPreview(false);
                fetchOrderedBills();
            }, 500);

        } catch (error) {
            console.error(error);
            toast.error("Error updating status. Please try again.");
            setIsProcessing(false);
        }
    };

    // --- HANDLE DIRECT PRINT ---
    const handleDirectPrint = (bill) => {
        setPrintBillData(bill); 
        setTimeout(() => {
            window.print(); 
        }, 500); 
    };

    // --- HANDLE DELETE ---
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this order permanently?")) return;

        try {
            const res = await fetch(`${API_URL}/api/billing/delete/${id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                toast.success("Order deleted successfully");
                fetchOrderedBills(); 
            } else {
                toast.error("Failed to delete order");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error deleting order");
        }
    };

    // --- HANDLE EDIT (New Function) ---
    const handleEdit = (bill) => {
        // Navigate to OrderSummary page (assuming route is /dashboard/billing or similar)
        // Pass the bill data in state to pre-fill the form
        navigate("/order-summary", { state: { editMode: true, billData: bill } });
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
            if (fromDate) {
                matchesDate = matchesDate && (billDate >= new Date(fromDate));
            }
            if (toDate) {
                const t = new Date(toDate);
                t.setHours(23, 59, 59, 999);
                matchesDate = matchesDate && (billDate <= t);
            }
        }
        return matchesSearch && matchesDate;
    });

    const displayedBills = showAllItems ? filteredBills : filteredBills.slice(0, ROWS_TO_SHOW);

    const handleExportExcel = () => {
        if (filteredBills.length === 0) return toast.warn("No data to export");
        const dataToExport = filteredBills.map(bill => ({
            "Invoice No": bill.invoiceNo,
            "Date": bill.date.split(',')[0],
            "Customer Name": bill.customer.customerName,
            "Mobile": bill.customer.mobileNumber,
            "Total Amount": safeAmount(bill.grandTotal),
            "Balance Due": safeAmount(bill.remaining),
            "Status": "Ordered"
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Active_Orders");
        XLSX.writeFile(workbook, `Active_Orders_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success("Excel exported successfully!");
    };

    const handleExportPDF = async () => {
        const element = document.getElementById("orders-table-container");
        if (!element || filteredBills.length === 0) return toast.warn("No data or table to export");
        setIsExporting(true);
        try {
            const dataUrl = await toPng(element, { cacheBust: true, backgroundColor: '#ffffff' });
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(dataUrl, "PNG", 0, 10, pdfWidth, pdfHeight);
            pdf.save(`Active_Orders_Report.pdf`);
            toast.success("PDF exported successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate PDF");
        } finally {
            setIsExporting(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFromDate("");
        setToDate("");
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
                `}
            </style>

            <div className="bg-white shadow-md rounded-lg p-6 min-h-screen">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                            <Package size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Active Orders</h2>
                            <p className="text-sm text-gray-500">Orders pending delivery & payment</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleExportExcel} className="flex items-center gap-2 px-6 py-2 bg-[#5ce1e6] text-[#03214a] font-bold rounded-full hover:bg-[#03214a] hover:text-white transition shadow-md disabled:opacity-50">
                            <FileSpreadsheet size={16} /> Excel
                        </button>
                        <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-2 px-6 py-2 bg-[#5ce1e6] text-[#03214a] font-bold rounded-full hover:bg-[#03214a] hover:text-white transition shadow-md disabled:opacity-50">
                            <Download size={16} /> {isExporting ? "Generating..." : "PDF"}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100 items-end">
                    <div className="relative w-full sm:max-w-xs">
                        <label className="text-xs font-semibold text-gray-500 ml-1">Search</label>
                        <input type="text" className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none" placeholder="Bill No, Name, Mobile..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="relative w-full sm:max-w-[150px]">
                        <label className="text-xs font-semibold text-gray-500 ml-1">From Date</label>
                        <input type="date" className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    </div>
                    <div className="relative w-full sm:max-w-[150px]">
                        <label className="text-xs font-semibold text-gray-500 ml-1">To Date</label>
                        <input type="date" className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                    <div>
                        <button onClick={clearFilters} className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md text-sm font-bold hover:bg-gray-300 transition">Clear Filters</button>
                    </div>
                </div>

                <div id="orders-table-container" className="mt-4 overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white p-2">
                    <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 font-bold">
                            <tr>
                                <th className="px-4 py-3 border-b">Bill No</th>
                                <th className="px-4 py-3 border-b">Date</th>
                                <th className="px-4 py-3 border-b">Customer</th>
                                <th className="px-4 py-3 border-b">Mobile</th>
                                <th className="px-4 py-3 border-b">Status</th>
                                <th className="px-4 py-3 border-b">Balance Due</th>
                                <th className="px-4 py-3 border-b text-center no-print-col" data-html2canvas-ignore="true">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="p-6 text-center text-gray-500 animate-pulse">Loading orders...</td></tr>
                            ) : displayedBills.length === 0 ? (
                                <tr><td colSpan="7" className="p-6 text-center text-gray-500">No active orders found.</td></tr>
                            ) : (
                                displayedBills.map((bill) => (
                                    <tr key={bill._id} className="bg-white border-b hover:bg-yellow-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900">{bill.invoiceNo}</td>
                                        <td className="px-4 py-3">{bill.date.split(',')[0]}</td>
                                        <td className="px-4 py-3 font-medium">{bill.customer.customerName}</td>
                                        <td className="px-4 py-3 text-gray-600">{bill.customer.mobileNumber}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit">Ordered</span>
                                        </td>
                                        <td className="px-4 py-3 font-bold text-red-600">₹{safeAmount(bill.remaining)}</td>
                                        <td className="px-4 py-3 text-center flex justify-center gap-2 no-print-col" data-html2canvas-ignore="true">
                                            {/* DELIVER BUTTON */}
                                            <button onClick={() => { setSelectedBill(bill); setShowPreview(true); }} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition text-xs font-bold" title="View & Deliver">
                                                <CheckCircle size={14} /> Deliver
                                            </button>
                                            
                                            {/* EDIT BUTTON (NEW) */}
                                            <button onClick={() => handleEdit(bill)} className="flex items-center gap-2 bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-full hover:bg-yellow-100 transition text-xs font-bold" title="Edit Order">
                                                <Edit size={14} /> Edit
                                            </button>

                                            {/* PRINT BUTTON */}
                                            <button onClick={() => handleDirectPrint(bill)} className="flex items-center gap-2 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-100 transition text-xs font-bold border border-gray-200" title="Print Order Summary">
                                                <Printer size={14} /> Print
                                            </button>

                                            {/* DELETE BUTTON */}
                                            <button onClick={() => handleDelete(bill._id)} className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-100 transition text-xs font-bold" title="Delete Order">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredBills.length > ROWS_TO_SHOW && (
                    <div className="flex justify-center mt-6">
                        <button onClick={() => setShowAllItems(!showAllItems)} className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-full font-medium shadow-sm transition">
                            {showAllItems ? <><>Show Less <ChevronUp size={18} /></></> : <><>Show More ({filteredBills.length - ROWS_TO_SHOW} items) <ChevronDown size={18} /></></>}
                        </button>
                    </div>
                )}
            </div>

            <div id="printable-invoice" style={{ display: 'none' }}>
                <InvoiceTemplate bill={printBillData} />
            </div>

            {showPreview && (
                <BillPreviewModal
                    bill={selectedBill}
                    onClose={() => setShowPreview(false)}
                    onPrint={handlePrintAndDeliver}
                    processing={isProcessing}
                />
            )}

            <ToastContainer position="top-right" autoClose={2000} />
        </Layout>
    );
};

export default Ordered;