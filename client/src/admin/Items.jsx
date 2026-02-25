import React, { useState, useEffect, useMemo } from "react";
import {
    Search,
    Filter,
    Edit2,
    Trash2,
    DownloadCloud,
    UploadCloud,
    XCircle,
    ChevronDown,
    ChevronUp,
    Printer,
    Calendar,
    RotateCcw,
    FileSpreadsheet,
    AlertTriangle
} from "lucide-react";
import Layout from "../components/dashboard/Layout";
import * as XLSX from "xlsx";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Barcode from "react-barcode";

const API_URL = `${import.meta.env.VITE_APP_BASE_URL}/api/items`;

const Items = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [showAllItems, setShowAllItems] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);

    const fetchItems = async () => {
        try {
            const res = await axios.get(API_URL);
            setItems(res.data);
        } catch (error) {
            console.error("Error fetching items:", error);
            toast.error("Error connecting to server");
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // --- Dynamic Item Types List ---
    // This automatically finds all unique types currently in your data
    const itemTypes = useMemo(() => {
        const types = items.map(item => item.itemType).filter(Boolean);
        return [...new Set(types)].sort();
    }, [items]);

    const calculateMRP = (salePrice, gst) => {
        const price = parseFloat(salePrice) || 0;
        const tax = parseFloat(gst) || 0;
        const finalMrp = price + (price * (tax / 100));
        return Math.round(finalMrp);
    };

    const handleBulkUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

                if (data.length <= 1) {
                    toast.warn("File is empty or contains only headers.");
                    return;
                }

                const uploadedItems = data.slice(1).map((row) => {
                    if (!row[0] || !row[1]) return null;
                    const salePrice = Math.round(Number(row[5]) || 0);
                    const gst = Number(row[6]) || 0;
                    let mrp = Number(row[7]);
                    if (!mrp || mrp === 0) mrp = calculateMRP(salePrice, gst);

                    return {
                        itemNumber: String(row[0]),
                        itemName: String(row[1]),
                        itemType: String(row[2] || "General"),
                        hsn: row[3] ? String(row[3]) : "",
                        retailPrice: Number(row[4]) || 0,
                        salePrice: salePrice,
                        gst: gst,
                        mrp: mrp,
                        stock: Number(row[8]) || 0
                    };
                }).filter(item => item !== null);

                if (uploadedItems.length === 0) return toast.warn("No valid items found.");

                const res = await axios.post(`${API_URL}/bulk`, { items: uploadedItems });
                await fetchItems();
                toast.success(res.data.message || "Items uploaded successfully!");
                e.target.value = null;
            } catch (error) {
                toast.error("Bulk upload failed.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleDownloadSample = () => {
        const wb = XLSX.utils.book_new();
        const rand = Math.floor(Math.random() * 1000);
        const wsData = [
            ["Item Number", "Item Name", "Item Type", "HSN Code", "Retail Price", "Sale Price", "GST %", "MRP", "Stock"],
            [`MANUAL-${rand}`, "Rayban Frame", "Frame", "9003", 1200, 1000, 12, 1120, 50],
            [`MANUAL-${rand + 1}`, "Zeiss Lens", "Lens", "9001", 600, 500, 5, 525, 20]
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "Sample");
        XLSX.writeFile(wb, "ItemUploadSample.xlsx");
    };

    const handleExport = () => {
        if (items.length === 0) return toast.warn("No items available to export.");
        const headers = ["Barcode ID", "Item Number", "Item Name", "Item Type", "HSN Code", "Retail Price", "Sale Price", "GST %", "MRP", "Stock"];
        const dataRows = items.map(item => [item.barcodeId, item.itemNumber, item.itemName, item.itemType, item.hsn, item.retailPrice, item.salePrice, item.gst, item.mrp, item.stock]);
        const wsData = [headers, ...dataRows];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 8 }];
        XLSX.utils.book_append_sheet(wb, ws, "All Items");
        XLSX.writeFile(wb, `Items_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await axios.delete(`${API_URL}/${itemId}`);
            setItems(items.filter((i) => i._id !== itemId));
            setSelectedItems(prev => prev.filter(id => id !== itemId));
            toast.info("Item deleted");
        } catch (error) {
            toast.error("Error deleting item");
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm("DANGER: Delete ALL items?")) return;
        if (!window.confirm("Confirm again: This CANNOT be undone.")) return;
        try {
            await axios.delete(`${API_URL}/delete-all`);
            setItems([]);
            setSelectedItems([]);
            toast.success("All data cleared.");
        } catch (error) {
            toast.error("Failed to delete all items.");
        }
    };

    const openEditModal = (item) => {
        setEditItem({ ...item });
        setEditModalOpen(true);
    };

    const handleEditChange = (field, value) => {
        setEditItem(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'salePrice' || field === 'gst') {
                updated.mrp = calculateMRP(updated.salePrice, updated.gst);
            }
            return updated;
        });
    };

    const handleSaveEdit = async () => {
        try {
            const res = await axios.put(`${API_URL}/${editItem._id}`, editItem);
            setItems(items.map(i => i._id === editItem._id ? res.data : i));
            setEditModalOpen(false);
            toast.success("Item updated");
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const filteredItems = items.filter((item) => {
        const term = search.toLowerCase();
        const matchesSearch = (item.barcodeId && item.barcodeId.toLowerCase().includes(term)) || item.itemName.toLowerCase().includes(term) || item.itemNumber.toLowerCase().includes(term);
        const matchesType = filterType ? item.itemType === filterType : true;
        let matchesDate = true;
        if (fromDate || toDate) {
            const itemDate = new Date(item.createdAt);
            itemDate.setHours(0, 0, 0, 0);
            if (fromDate && itemDate < new Date(fromDate)) matchesDate = false;
            if (toDate && itemDate > new Date(toDate)) matchesDate = false;
        }
        return matchesSearch && matchesType && matchesDate;
    });

    const displayedItems = showAllItems ? filteredItems : filteredItems.slice(0, 5);

    const toggleSelect = (id) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const handleSelectAll = (e) => {
        setSelectedItems(e.target.checked ? filteredItems.map(i => i._id) : []);
    };

    const itemsToPrint = selectedItems.length > 0 ? items.filter(i => selectedItems.includes(i._id)) : filteredItems;

    const handlePrint = () => {
        if (itemsToPrint.length === 0) return toast.warn("Nothing to print");
        window.print();
    };

    const clearFilters = () => {
        setSearch("");
        setFilterType("");
        setFromDate("");
        setToDate("");
        setSelectedItems([]);
    };

    return (
        <Layout>
            <style>
                {`
                @media print {
                    @page { size: 102mm 15mm; margin: 0; }
                    body * { visibility: hidden; }
                    #printable-area, #printable-area * { visibility: visible; }
                    #printable-area { position: absolute; left: 0; top: 0; width: 102mm; padding-left: 47.5mm; display: flex; flex-direction: column; background: white; z-index: 9999; }
                    .print-card { width: 50mm; height: 15mm; display: flex; flex-direction: row; align-items: center; justify-content: flex-start; overflow: hidden; box-sizing: border-box; page-break-after: always; }
                    .pc-barcode-section { width: 65%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0; overflow: hidden; }
                    .pc-barcode-section svg { max-width: 100%; height: auto; shape-rendering: crisp-edges; transform-origin: center; }
                    .pc-barcode-text { font-size: 8px; font-weight: bold; text-align: center; width: 100%; white-space: nowrap; overflow: hidden; margin-top: 3px; letter-spacing: 0px; font-family: monospace; }
                    .pc-info-section { width: 35%; height: 100%; display: flex; flex-direction: column; justify-content: center; padding-left: 2mm; overflow: hidden; }
                    .pc-price { font-size: 10px; font-weight: 900; line-height: 1.1; margin-bottom: 2px; text-align: left; white-space: nowrap; }
                    .pc-name { font-size: 7px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; line-height: 1; text-align: left; }
                }
                `}
            </style>

            <div className="bg-white shadow-md rounded-lg p-6 print:hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold">Items Listing</h2>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={handleDownloadSample} className="px-4 py-2 bg-[#5ce1e6] text-[#03214a] rounded-full text-sm font-bold hover:bg-[#03214a] hover:text-white transition shadow-md flex items-center gap-2">
                            <DownloadCloud size={18} /> Sample
                        </button>
                        <label className="px-4 py-2 bg-[#5ce1e6] text-[#03214a] rounded-full text-sm font-bold hover:bg-[#03214a] hover:text-white transition shadow-md flex items-center gap-2 cursor-pointer">
                            <UploadCloud size={18} /> Bulk Upload
                            <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleBulkUpload} />
                        </label>
                        <button onClick={handleExport} className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm font-bold hover:bg-black transition shadow-md flex items-center gap-2">
                            <FileSpreadsheet size={18} /> Export Excel
                        </button>
                        <button onClick={handlePrint} className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm font-bold hover:bg-black transition shadow-md flex items-center gap-2">
                            <Printer size={18} /> Print Barcodes ({itemsToPrint.length})
                        </button>
                        <button onClick={handleDeleteAll} className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-bold hover:bg-red-700 transition shadow-md flex items-center gap-2">
                            <AlertTriangle size={18} /> Delete All Data
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="relative w-full">
                        <input type="text" className="w-full border rounded-md pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Search ID/Name" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    </div>

                    {/* UPDATED DYNAMIC FILTER */}
                    <div className="relative w-full">
                        <select
                            className="w-full border rounded-md pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="">All Types</option>
                            {itemTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <Filter className="absolute left-3 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
                        <ChevronDown className="absolute right-3 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div>

                    <div className="relative w-full">
                        <input type="date" className="w-full border rounded-md pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 text-gray-600" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        <Calendar className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                        <span className="absolute -top-2 left-2 bg-gray-50 px-1 text-[10px] text-gray-500">From</span>
                    </div>
                    <div className="relative w-full">
                        <input type="date" className="w-full border rounded-md pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 text-gray-600" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        <Calendar className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                        <span className="absolute -top-2 left-2 bg-gray-50 px-1 text-[10px] text-gray-500">To</span>
                    </div>
                    <button onClick={clearFilters} className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md text-sm font-bold hover:bg-gray-300 transition">
                        <RotateCcw size={16} className="inline-block ml-1" /> Clear Filters
                    </button>
                </div>

                <div className="mt-4 overflow-x-auto rounded-t-lg border border-gray-200">
                    <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr className="bg-gray-100">
                                <th className="px-4 py-3 border-b text-center">
                                    <input type="checkbox" onChange={handleSelectAll} checked={filteredItems.length > 0 && selectedItems.length === filteredItems.length} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                                </th>
                                <th className="px-4 py-3 border-b text-blue-800 font-bold">Barcode ID</th>
                                <th className="px-4 py-3 border-b">Item Number</th>
                                <th className="px-4 py-3 border-b">Item Name</th>
                                <th className="px-4 py-3 border-b">Item Type</th>
                                <th className="px-4 py-3 border-b">Sale Price</th>
                                <th className="px-4 py-3 border-b text-center">GST%</th>
                                <th className="px-4 py-3 border-b text-green-700 font-bold">MRP</th>
                                <th className="px-4 py-3 border-b text-center">Stock</th>
                                <th className="px-4 py-3 border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedItems.map((item) => (
                                <tr className={`bg-white border-b hover:bg-gray-50 ${selectedItems.includes(item._id) ? "bg-blue-50" : ""}`} key={item._id}>
                                    <td className="px-4 py-3 text-center">
                                        <input type="checkbox" checked={selectedItems.includes(item._id)} onChange={() => toggleSelect(item._id)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                                    </td>
                                    <td className="px-4 py-3 font-bold text-blue-800">{item.barcodeId}</td>
                                    <td className="px-4 py-3 font-semibold text-gray-500">{item.itemNumber}</td>
                                    <td className="px-4 py-3">{item.itemName}</td>
                                    <td className="px-4 py-3">{item.itemType}</td>
                                    <td className="px-4 py-3 text-blue-600">{item.salePrice}/-</td>
                                    <td className="px-4 py-3 text-center">{item.gst}%</td>
                                    <td className="px-4 py-3 font-bold text-green-700">{item.mrp}/-</td>
                                    <td className="px-4 py-3 text-center">{item.stock}</td>
                                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                                        <button onClick={() => openEditModal(item)} className="p-1 rounded hover:bg-gray-100"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(item._id)} className="p-1 rounded hover:bg-gray-100"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredItems.length > 5 && (
                    <div className="flex justify-center mt-4">
                        <button onClick={() => setShowAllItems(!showAllItems)} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition">
                            {showAllItems ? <>Show Less <ChevronUp size={18} /></> : <>Show More ({filteredItems.length - 5} more items) <ChevronDown size={18} /></>}
                        </button>
                    </div>
                )}
            </div>

            <div id="printable-area" className="hidden">
                {itemsToPrint.map((item) => (
                    <div key={item._id} className="print-card">
                        <div className="pc-barcode-section">
                            <Barcode value={item.barcodeId} width={1} height={25} displayValue={false} margin={1} format="CODE128" background="transparent" lineColor="#000000" />
                            <div className="pc-barcode-text">{item.itemNumber}</div>
                        </div>
                        <div className="pc-info-section">
                            <div className="pc-price">NxtEye</div>
                            <div className="pc-price">MRP. {item.mrp}/-</div>
                            <div className="pc-name">{item.itemType}</div>
                        </div>
                    </div>
                ))}
            </div>

            {editModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 print:hidden">
                    <div className="bg-white p-6 rounded-lg w-[90%] max-w-md relative shadow-lg">
                        <button onClick={() => setEditModalOpen(false)} className="absolute top-3 right-3 text-gray-500 hover:text-red-500"><XCircle size={22} /></button>
                        <h3 className="text-lg font-semibold mb-4">Edit Item</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="text-xs text-blue-800 font-bold">Barcode ID</label>
                                <input className="border rounded-md p-2 text-sm w-full mt-1 bg-blue-50 font-bold text-blue-800" readOnly type="text" value={editItem.barcodeId} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-gray-600 font-medium">Item Name</label>
                                <input className="border rounded-md p-2 text-sm w-full mt-1" type="text" value={editItem.itemName} onChange={(e) => handleEditChange('itemName', e.target.value)} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-gray-600 font-medium">Item Type</label>
                                <input className="border rounded-md p-2 text-sm w-full mt-1" type="text" value={editItem.itemType} onChange={(e) => handleEditChange('itemType', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 font-medium">Sale Price</label>
                                <input className="border rounded-md p-2 text-sm w-full mt-1 border-blue-300" type="number" value={editItem.salePrice} onChange={(e) => handleEditChange('salePrice', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 font-medium">GST %</label>
                                <input className="border rounded-md p-2 text-sm w-full mt-1" type="number" value={editItem.gst} onChange={(e) => handleEditChange('gst', e.target.value)} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-green-700 font-bold">MRP (Auto Calculated)</label>
                                <input className="border rounded-md p-2 text-sm w-full mt-1 bg-green-50 text-green-700 font-bold" type="number" value={editItem.mrp} readOnly />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 font-medium">Stock</label>
                                <input className="border rounded-md p-2 text-sm w-full mt-1" type="number" value={editItem.stock} onChange={(e) => handleEditChange('stock', e.target.value)} />
                            </div>
                        </div>
                        <button className="mt-5 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 w-full font-bold shadow-md" onClick={handleSaveEdit}>Save Changes</button>
                    </div>
                </div>
            )}
            <ToastContainer position="top-right" autoClose={2000} theme="colored" />
        </Layout>
    );
};

export default Items;