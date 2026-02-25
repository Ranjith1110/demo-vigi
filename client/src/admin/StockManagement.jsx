import React, { useState, useEffect, useMemo } from "react";
import {
    Search,
    Filter,
    Package,
    TrendingUp,
    RotateCcw,
    FileSpreadsheet,
    ChevronDown,
    ChevronUp,
    ShoppingBag,
    Layers,
    AlertCircle,
    CheckCircle2,
    IndianRupee,
    Tag,
    ArrowUpRight,
    ArrowDownRight,
    LayoutGrid
} from "lucide-react";
import Layout from "../components/dashboard/Layout";
import * as XLSX from "xlsx";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ITEMS_API = `${import.meta.env.VITE_APP_BASE_URL}/api/items`;
const BILLING_API = `${import.meta.env.VITE_APP_BASE_URL}/api/billing`;

const StockManagement = () => {
    const [items, setItems] = useState([]);
    const [bills, setBills] = useState([]);
    const [search, setSearch] = useState("");
    const [showAll, setShowAll] = useState(false);
    const [filterStatus, setFilterStatus] = useState("All");
    const [selectedType, setSelectedType] = useState("All");

    const fetchData = async () => {
        try {
            const [itemsRes, billsRes] = await Promise.all([
                axios.get(ITEMS_API),
                axios.get(`${BILLING_API}/all`)
            ]);
            setItems(itemsRes.data);
            setBills(billsRes.data || []);
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Error connecting to inventory and billing records");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const itemsLookup = {};
    items.forEach(i => { itemsLookup[i._id] = i; });

    // --- DYNAMIC ITEM TYPES ---
    const itemTypes = useMemo(() => {
        const types = items.map(item => item.itemType).filter(Boolean);
        return ["All", ...new Set(types)].sort();
    }, [items]);

    // --- CALCULATION LOGIC ---
    const itemSalesStats = {};
    let globalTotalSoldPrice = 0;
    let globalTotalSoldRetailValue = 0;

    // Type-specific totals
    let typeTotalSoldPrice = 0;
    let typeTotalSoldRetailValue = 0;

    bills.forEach(bill => {
        const billTotal = Number(bill.grandTotal) || 0;
        globalTotalSoldPrice += billTotal;

        (bill.items || []).forEach(soldItem => {
            const id = soldItem._id || soldItem.itemId;
            const qty = Number(soldItem.quantity) || 0;
            const revenue = Number(soldItem.itemPrice || 0) * qty;

            if (!itemSalesStats[id]) {
                itemSalesStats[id] = { qty: 0, revenue: 0 };
            }
            itemSalesStats[id].qty += qty;
            itemSalesStats[id].revenue += revenue;

            const originalItem = itemsLookup[id];
            if (originalItem) {
                const retailVal = (Number(originalItem.retailPrice) || 0) * qty;
                globalTotalSoldRetailValue += retailVal;

                // If this specific item belongs to the selected type
                if (selectedType !== "All" && originalItem.itemType === selectedType) {
                    typeTotalSoldRetailValue += retailVal;
                    typeTotalSoldPrice += revenue; // Revenue for this type
                }
            }
        });
    });

    // Determine which items to use for metrics (Global or Type-filtered)
    const metricsItems = selectedType === "All" 
        ? items 
        : items.filter(i => i.itemType === selectedType);

    const metricsSoldStats = selectedType === "All"
        ? Object.values(itemSalesStats)
        : Object.keys(itemSalesStats)
            .filter(id => itemsLookup[id]?.itemType === selectedType)
            .map(id => itemSalesStats[id]);

    const metricsRemainingStock = metricsItems.reduce((acc, i) => acc + (Number(i.stock) || 0), 0);
    const metricsSoldStockCount = metricsSoldStats.reduce((a, b) => a + b.qty, 0);
    const metricsRemainingRetailValue = metricsItems.reduce((acc, i) => acc + ((Number(i.retailPrice) || 0) * (Number(i.stock) || 0)), 0);

    const stats = {
        totalStock: metricsRemainingStock + metricsSoldStockCount,
        wholeRetailValue: Math.round(metricsRemainingRetailValue + (selectedType === "All" ? globalTotalSoldRetailValue : typeTotalSoldRetailValue)),
        stockSold: metricsSoldStockCount,
        soldStockValue: Math.round(selectedType === "All" ? globalTotalSoldRetailValue : typeTotalSoldRetailValue),
        stockSoldPrice: Math.round(selectedType === "All" ? globalTotalSoldPrice : typeTotalSoldPrice),
        remainingStock: metricsRemainingStock,
        remainingStockValue: Math.round(metricsRemainingRetailValue)
    };

    const filteredItems = items.filter(item => {
        const term = search.toLowerCase();
        const matchesSearch =
            item.itemName.toLowerCase().includes(term) ||
            item.barcodeId?.toLowerCase().includes(term) ||
            item.itemNumber?.toLowerCase().includes(term);

        const matchesType = selectedType === "All" || item.itemType === selectedType;

        if (filterStatus === "Low Stock") return matchesSearch && matchesType && item.stock > 0 && item.stock <= 5;
        if (filterStatus === "Out of Stock") return matchesSearch && matchesType && item.stock <= 0;
        return matchesSearch && matchesType;
    });

    const displayedItems = showAll ? filteredItems : filteredItems.slice(0, 8);

    const handleExport = () => {
        const headers = [
            "Item Name", "Item Type", "Total Stock", "Stock Retail Amount", 
            "Units Sold", "Sold Stock Value (Retail)", "Stock Sold Price (Revenue)", 
            "Remaining Stock", "Remaining Stock Value"
        ];
        const dataRows = filteredItems.map(i => {
            const soldData = itemSalesStats[i._id] || { qty: 0, revenue: 0 };
            const retail = Number(i.retailPrice) || 0;
            const currentStock = Number(i.stock) || 0;
            const totalStockCount = currentStock + soldData.qty;
            
            return [
                i.itemName,
                i.itemType,
                totalStockCount,
                Math.round(totalStockCount * retail),
                soldData.qty,
                Math.round(soldData.qty * retail),
                Math.round(soldData.revenue),
                currentStock,
                Math.round(currentStock * retail)
            ];
        });
        const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Stock_Report");
        XLSX.writeFile(wb, `StockReport_${selectedType}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border-l-8 border-[#5ce1e6]">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Stock Management</h2>
                        <p className="text-sm text-gray-500">
                            {selectedType === "All" ? "Global Analytics" : `${selectedType} Category Analytics`}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <select 
                            className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none border-none cursor-pointer"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            {itemTypes.map(t => <option key={t} value={t}>{t === "All" ? "All Categories" : t}</option>)}
                        </select>
                        <button onClick={fetchData} className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition text-gray-600"><RotateCcw size={20} /></button>
                        <button onClick={handleExport} className="px-5 py-2 bg-gray-800 text-white rounded-full text-sm font-bold hover:bg-black transition shadow-md flex items-center gap-2">
                            <FileSpreadsheet size={18} /> Export Analysis
                        </button>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {[
                        { label: `${selectedType !== "All" ? selectedType : 'Total'} Stock`, value: stats.totalStock, color: "text-gray-400" },
                        { label: "Whole Retail Value", value: `₹${stats.wholeRetailValue.toLocaleString()}`, color: "text-purple-500" },
                        { label: "Stock Sold", value: stats.stockSold, color: "text-indigo-500" },
                        { label: "Sold Stock Value", value: `₹${stats.soldStockValue.toLocaleString()}`, color: "text-orange-500" },
                        { label: "Stock Sold Price", value: `₹${stats.stockSoldPrice.toLocaleString()}`, color: "text-emerald-500" },
                        { label: "Remaining Stock", value: stats.remainingStock, color: "text-blue-500" },
                        { label: "Remaining Stock Value", value: `₹${stats.remainingStockValue.toLocaleString()}`, color: "text-blue-600", bg: "bg-blue-50/30 border-[#5ce1e6] border-2" }
                    ].map((card, i) => (
                        <div key={i} className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 ${card.bg || ""}`}>
                            <p className={`text-[9px] font-bold uppercase ${card.color}`}>{card.label}</p>
                            <p className="text-lg font-black text-gray-800 mt-1">{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* Detailed Item Wise Table */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                    <div className="p-6 bg-gray-50 flex flex-wrap gap-4 items-center justify-between border-b">
                        <div className="relative flex-grow max-w-md text-[#03214a]">
                             <input
                                type="text"
                                className="w-full border rounded-md pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#5ce1e6] outline-none"
                                placeholder="Filter by Name, ID or Barcode..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-gray-400" />
                            <select
                                className="border rounded-md bg-white px-4 py-2 text-sm shadow-sm outline-none font-bold text-gray-600 appearance-none pr-8 cursor-pointer"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="All">All Inventory Status</option>
                                <option value="Low Stock">Low Stock Alerts</option>
                                <option value="Out of Stock">Sold Out Items</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-[10px] text-left text-gray-700">
                            <thead className="bg-[#03214a] text-white uppercase tracking-tighter">
                                <tr>
                                    <th className="px-4 py-4 font-bold border-r border-white/10">Item Description</th>
                                    <th className="px-2 py-4 text-center">Stock (Total)</th>
                                    <th className="px-2 py-4 text-right">Stock Retail Amt</th>
                                    <th className="px-2 py-4 text-center bg-green-600/20">Sold</th>
                                    <th className="px-2 py-4 text-right bg-green-600/20">Sold Stock Val</th>
                                    <th className="px-2 py-4 text-right bg-green-600/20">Stock Sold Price</th>
                                    <th className="px-2 py-4 text-center bg-blue-600/20">Remaining</th>
                                    <th className="px-4 py-4 text-right bg-blue-600/20">Rem. Stock Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {displayedItems.map((item) => {
                                    const soldData = itemSalesStats[item._id] || { qty: 0, revenue: 0 };
                                    const retailPrice = Number(item.retailPrice) || 0;
                                    const currentStock = Number(item.stock) || 0;
                                    const totalQty = currentStock + soldData.qty;
                                    
                                    return (
                                        <tr key={item._id} className="bg-white hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 border-r">
                                                <div className="font-bold text-gray-900 text-[11px]">{item.itemName}</div>
                                                <div className="text-[9px] text-gray-400 font-mono italic">
                                                    {item.itemType} | {item.itemNumber} | {item.barcodeId}
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 text-center font-bold text-gray-500">{totalQty}</td>
                                            <td className="px-2 py-4 text-right text-gray-500 font-medium">₹{Math.round(totalQty * retailPrice).toLocaleString()}</td>
                                            
                                            <td className="px-2 py-4 text-center text-emerald-600 font-black bg-green-50/50">{soldData.qty}</td>
                                            <td className="px-2 py-4 text-right text-emerald-700 font-bold bg-green-50/50">₹{Math.round(soldData.qty * retailPrice).toLocaleString()}</td>
                                            <td className="px-2 py-4 text-right text-emerald-800 font-black bg-green-50/50">₹{Math.round(soldData.revenue).toLocaleString()}</td>
                                            
                                            <td className="px-2 py-4 text-center font-black bg-blue-50/50">
                                                <span className={`px-2 py-0.5 rounded ${item.stock <= 5 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700"}`}>
                                                    {item.stock}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right font-black text-blue-900 bg-blue-50/50">
                                                ₹{Math.round(item.stock * retailPrice).toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 bg-gray-50 border-t flex justify-center">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="bg-[#5ce1e6] text-[#03214a] px-8 py-2.5 rounded-full text-xs font-black uppercase hover:bg-[#03214a] hover:text-white transition-all shadow-md flex items-center gap-2"
                        >
                            {showAll ? <>Collapse <ChevronUp size={16} /></> : <>Show All ({filteredItems.length - 8} more) <ChevronDown size={18} /></>}
                        </button>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={2000} theme="colored" />
        </Layout>
    );
};

export default StockManagement;