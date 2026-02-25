import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/dashboard/Layout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChevronLeft, ChevronRight, Search, RefreshCw, Eye, X, FileText, ChevronUp, ChevronDown, Clock, Activity } from 'lucide-react';

const API_URL = import.meta.env.VITE_APP_BASE_URL;
const CUSTOMERS_PER_PAGE = 20;

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [purpose, setPurpose] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    
    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal & View States
    const [showAllItems, setShowAllItems] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Fetch Function
    const fetchCustomers = useCallback(async (page, search, purposeFilter, start, end) => {
        setLoading(true);
        setError(null);
        setShowAllItems(false); 
        try {
            const params = new URLSearchParams();
            
            // Always append page and limit
            params.append('page', page);
            params.append('limit', CUSTOMERS_PER_PAGE);

            // Only append filters if they have values
            if (search && search.trim() !== "") params.append('search', search);
            if (purposeFilter && purposeFilter.trim() !== "") params.append('purpose', purposeFilter);
            if (start) params.append('startDate', start);
            if (end) params.append('endDate', end);

            const url = `${API_URL}/api/customers?${params.toString()}`;
            
            // console.log("Fetching URL:", url); 

            const res = await fetch(url);
            
            if (!res.ok) throw new Error('Failed to fetch customers');
            
            const data = await res.json();
            setCustomers(data.customers);
            setCurrentPage(Number(data.currentPage) || 1);
            setTotalPages(Number(data.totalPages) || 1);
        } catch (err) {
            setError(err.message);
        } finally { 
            setLoading(false); 
        }
    }, []);

    // Automatic Trigger Effect with Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers(currentPage, searchTerm, purpose, startDate, endDate);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [fetchCustomers, currentPage, searchTerm, purpose, startDate, endDate]);

    // Handlers
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); 
    };

    const handlePurposeChange = (e) => {
        setPurpose(e.target.value);
        setCurrentPage(1);
    };

    const handleDateChange = (setter) => (e) => {
        setter(e.target.value);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setSearchTerm("");
        setPurpose("");
        setStartDate("");
        setEndDate("");
        setCurrentPage(1);
        toast.info("Filters reset");
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    const handleOpenPreview = (customer) => { setSelectedCustomer(customer); setShowModal(true); };
    const handleCloseModal = () => { setShowModal(false); setSelectedCustomer(null); };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try { return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch (e) { return dateString; }
    };

    const displayedCustomers = showAllItems ? customers : customers.slice(0, 10);

    return (
        <Layout>
            <div className="bg-white shadow-md rounded-lg p-6 relative">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer List & Clinical History</h2>

                {/* Filter Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                    {/* Search Input */}
                    <div className="relative md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600">Search Name/Mobile</label>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm} 
                            onChange={handleSearchChange} 
                            className="w-full mt-1 p-2 pl-10 border rounded-md focus:ring-2 focus:ring-[#5ce1e6] outline-none" 
                        />
                        <Search size={18} className="absolute left-3 bottom-2.5 text-gray-400" />
                    </div>

                    {/* Purpose Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Purpose</label>
                        <select 
                            value={purpose} 
                            onChange={handlePurposeChange} 
                            className="w-full mt-1 p-2 border rounded-md bg-white focus:ring-2 focus:ring-[#5ce1e6] outline-none"
                        >
                            <option value="">All Purposes</option>
                            <option value="Purchase">Purchase</option>
                            <option value="Inquiry">Inquiry</option>
                            <option value="Eye Test">Eye Test</option>
                            <option value="Consultation">Consultation</option>
                            <option value="Contact Lens">Contact Lens</option>
                            <option value="Service/Repair">Service/Repair</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Date Filters */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600">From Date</label>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={handleDateChange(setStartDate)} 
                            className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-[#5ce1e6] outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">To Date</label>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={handleDateChange(setEndDate)} 
                            className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-[#5ce1e6] outline-none" 
                        />
                    </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-end gap-2 mb-6">
                    <button onClick={handleReset} className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition">
                        <RefreshCw size={16} /> Reset
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-500 animate-pulse">Loading customer data...</div>
                ) : error ? (
                    <div className="text-center py-10 text-red-600">{error}</div>
                ) : customers.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg">No customers found matching filters.</div>
                ) : (
                    <>
                        <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                            <table className="min-w-full text-sm text-left text-gray-700">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 font-bold tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3 border-b text-center w-16">Sl.No</th>
                                        <th className="px-4 py-3 border-b">Customer Name</th>
                                        <th className="px-4 py-3 border-b">Age</th> {/* Added Age Header */}
                                        <th className="px-4 py-3 border-b">Mobile</th>
                                        <th className="px-4 py-3 border-b">Address</th>
                                        <th className="px-4 py-3 border-b">Purpose</th>
                                        <th className="px-4 py-3 border-b">Date Joined</th>
                                        <th className="px-4 py-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {displayedCustomers.map((customer, index) => (
                                        <tr key={customer._id} className="bg-white hover:bg-blue-50 transition-colors">
                                            <td className="px-4 py-3 text-center border-b font-medium text-gray-500">{(Number(currentPage || 1) - 1) * CUSTOMERS_PER_PAGE + index + 1}</td>
                                            <td className="px-4 py-3 font-semibold text-gray-800 border-b">{customer.customerName}</td>
                                            <td className="px-4 py-3 text-gray-600 border-b">{customer.age || "-"}</td> {/* Added Age Data */}
                                            <td className="px-4 py-3 text-gray-600 border-b">{customer.mobileNumber}</td>
                                            <td className="px-4 py-3 text-gray-500 max-w-xs truncate border-b" title={customer.address}>{customer.address || "-"}</td>
                                            <td className="px-4 py-3 border-b"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">{customer.purposeOfVisit || "N/A"}</span></td>
                                            <td className="px-4 py-3 text-gray-500 border-b">{formatDate(customer.createdAt)}</td>
                                            <td className="px-4 py-3 text-center border-b">
                                                <button onClick={() => handleOpenPreview(customer)} className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition" title="View Clinical Readings"><Eye size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {customers.length > 10 && (
                            <div className="flex justify-center mt-4">
                                <button onClick={() => setShowAllItems(!showAllItems)} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition font-medium text-sm">{showAllItems ? <>Show Less <ChevronUp size={18} /></> : <>Show More ({customers.length - 10} more items) <ChevronDown size={18} /></>}</button>
                            </div>
                        )}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center mt-6">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="flex items-center gap-1 bg-white border text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 disabled:opacity-50 transition shadow-sm"><ChevronLeft size={16} /> Prev</button>
                                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">Page {currentPage} of {totalPages}</span>
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center gap-1 bg-white border text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 disabled:opacity-50 transition shadow-sm">Next <ChevronRight size={16} /></button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal Logic */}
            {showModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="bg-[#03214a] text-white p-4 flex justify-between items-center shadow-lg z-10">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2"><Activity size={18}/> Clinical History</h3>
                                <p className="text-xs text-blue-200 mt-1">Patient: {selectedCustomer.customerName} | Age: {selectedCustomer.age || "N/A"} | {selectedCustomer.mobileNumber}</p> {/* Added Age to Modal Header */}
                            </div>
                            <button onClick={handleCloseModal} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"><X size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto bg-gray-100 grow">
                            {selectedCustomer.clinicalHistory && selectedCustomer.clinicalHistory.length > 0 ? (
                                <div className="space-y-8 relative">
                                    <div className="absolute left-6 top-4 bottom-0 w-0.5 bg-gray-300 z-0"></div>

                                    {[...selectedCustomer.clinicalHistory].reverse().map((entry, idx) => {
                                        const isLatest = idx === 0;
                                        return (
                                            <div key={idx} className={`relative pl-14 transition-all ${isLatest ? 'scale-100' : 'scale-95 opacity-80 hover:opacity-100 hover:scale-100'}`}>
                                                <div className={`absolute left-4 top-5 w-4 h-4 rounded-full z-10 border-2 border-white ${isLatest ? 'bg-blue-600 shadow-blue-300 shadow-lg scale-125' : 'bg-gray-400'}`}></div>

                                                <div className={`bg-white border rounded-xl shadow-sm overflow-hidden ${isLatest ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'}`}>
                                                    <div className={`px-4 py-3 border-b flex justify-between items-center ${isLatest ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                                        <div className="flex items-center gap-3">
                                                            {isLatest && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Latest Visit</span>}
                                                            {!isLatest && <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">History</span>}
                                                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                                                <Clock size={14} className="text-gray-500" />
                                                                {entry.visitDate || entry.appointmentDetails?.checkupDate}
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-bold uppercase text-gray-500 tracking-wide">{entry.testType}</span>
                                                    </div>

                                                    <div className="p-4">
                                                        {entry.testType === "Glasses" ? (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <ReadingTable title="Right Eye (OD)" data={entry.readings?.right} color={isLatest ? "blue" : "gray"} />
                                                                <ReadingTable title="Left Eye (OS)" data={entry.readings?.left} color={isLatest ? "blue" : "gray"} />
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <CLReadingTable title="Right Eye (OD)" data={entry.readings?.right} color={isLatest ? "green" : "gray"} />
                                                                <CLReadingTable title="Left Eye (OS)" data={entry.readings?.left} color={isLatest ? "green" : "gray"} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                    <FileText size={48} className="mb-2 opacity-20" />
                                    <p>No clinical readings found for this customer.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t bg-white flex justify-end"><button onClick={handleCloseModal} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-full text-sm font-medium hover:bg-gray-300 transition">Close</button></div>
                    </div>
                </div>
            )}
            <ToastContainer position="top-right" autoClose={2000} />
        </Layout>
    );
};

// Sub-components
const ReadingTable = ({ title, data, color }) => {
    if (!data) return null;
    return (
        <div className={`border border-${color}-200 rounded-lg overflow-hidden`}>
            <div className={`bg-${color}-50 px-3 py-1 text-xs font-bold text-${color}-800 uppercase border-b border-${color}-100`}>{title}</div>
            <div className="grid grid-cols-3 gap-y-2 gap-x-4 p-3 text-xs">
                <div><span className="text-gray-400 block text-[10px]">SPH</span> <span className="font-bold text-gray-800">{data.SPH}</span></div>
                <div><span className="text-gray-400 block text-[10px]">CYL</span> <span className="font-bold text-gray-800">{data.CYL}</span></div>
                <div><span className="text-gray-400 block text-[10px]">AXIS</span> <span className="font-bold text-gray-800">{data.AXIS}</span></div>
                <div><span className="text-gray-400 block text-[10px]">ADD</span> <span className="font-bold text-gray-800">{data.ADD}</span></div>
                <div><span className="text-gray-400 block text-[10px]">PD</span> <span className="font-bold text-gray-800">{data.PD}</span></div>
                <div><span className="text-gray-400 block text-[10px]">VA</span> <span className="font-bold text-gray-800">{data.DistanceVA}</span></div>
            </div>
        </div>
    );
};

const CLReadingTable = ({ title, data, color }) => {
    if (!data) return null;
    return (
        <div className={`border border-${color}-200 rounded-lg overflow-hidden`}>
            <div className={`bg-${color}-50 px-3 py-1 text-xs font-bold text-${color}-800 uppercase border-b border-${color}-100`}>{title}</div>
            <div className="grid grid-cols-3 gap-y-2 gap-x-4 p-3 text-xs">
                <div><span className="text-gray-400 block text-[10px]">PWR</span> <span className="font-bold text-gray-800">{data.SPH}</span></div>
                <div><span className="text-gray-400 block text-[10px]">CYL</span> <span className="font-bold text-gray-800">{data.CYL}</span></div>
                <div><span className="text-gray-400 block text-[10px]">AXIS</span> <span className="font-bold text-gray-800">{data.AXIS}</span></div>
                <div><span className="text-gray-400 block text-[10px]">BC</span> <span className="font-bold text-gray-800">{data.BC}</span></div>
                <div><span className="text-gray-400 block text-[10px]">DIA</span> <span className="font-bold text-gray-800">{data.DIA}</span></div>
            </div>
        </div>
    );
};

export default CustomerList;