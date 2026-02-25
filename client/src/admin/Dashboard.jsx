import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/dashboard/Layout";
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  Download,
  Filter as FilterIcon,
  X,
  AlertTriangle,
  Wallet,
  CreditCard,
  Smartphone,
  Banknote,
  CheckCircle,
  Clock,
  Package,
  Truck,
  ArrowRight
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from "recharts";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

const API_URL = import.meta.env.VITE_APP_BASE_URL;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [allItems, setAllItems] = useState([]); // Store master items list
  const [exporting, setExporting] = useState(false);

  // Toggle for Custom Date Inputs
  const [showCustomFilter, setShowCustomFilter] = useState(false);

  // Default Date Range: TODAY (Start = Today, End = Today)
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch Sales Data AND Master Items
        const [resDelivered, resOrdered, resItems] = await Promise.all([
          fetch(`${API_URL}/api/billing/all?type=delivered`),
          fetch(`${API_URL}/api/billing/all?type=ordered`),
          fetch(`${API_URL}/api/items`)
        ]);

        const delivered = await resDelivered.json();
        const ordered = await resOrdered.json();
        const items = await resItems.json();

        // Combine both lists for the dashboard
        const allSales = [...(Array.isArray(delivered) ? delivered : []), ...(Array.isArray(ordered) ? ordered : [])];

        setSalesData(allSales);
        setAllItems(Array.isArray(items) ? items : []);

      } catch (error) {
        console.error("Dashboard Load Error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const analytics = useMemo(() => {
    if (loading) return null;

    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);

    // 1. Create a Price Map (Item Name -> Retail Price) for fast lookup
    const retailPriceMap = {};
    allItems.forEach(item => {
      if (item.itemName) {
        retailPriceMap[item.itemName] = Number(item.retailPrice) || 0;
      }
    });

    // 2. Filter Sales by Date for REVENUE and ORDERS counts
    const filteredSales = salesData.filter(item => {
      const itemDate = new Date(item.createdAt || item.date);
      return itemDate >= start && itemDate <= end;
    });

    // --- LOGIC FOR ADVANCE PAID & BALANCE DUE (ACTIVE ORDERS IN DATE RANGE) ---
    const activeOrdersInDateRange = filteredSales.filter(sale =>
      sale.orderStatus?.ordered === true &&
      sale.orderStatus?.delivered === false
    );

    const currentAdvancePaid = activeOrdersInDateRange.reduce((acc, sale) => {
      return acc + (Number(sale.advance) || 0);
    }, 0);

    const currentBalanceDue = activeOrdersInDateRange.reduce((acc, sale) => {
      return acc + (Number(sale.remaining) || 0);
    }, 0);
    // ------------------------------------------------------------------------

    // 3. Total Orders (Based on Date Filter)
    const totalOrders = filteredSales.length;

    // 4. Total Revenue (Strictly sums the Grand Total of sales in Date Range)
    const totalRevenue = filteredSales.reduce((acc, curr) => {
      return acc + (Number(curr.grandTotal) || 0);
    }, 0);

    // 5. Calculate Total Retail Cost
    const totalRetailCost = filteredSales.reduce((acc, sale) => {
      const saleCost = sale.items.reduce((itemAcc, item) => {
        const qty = Number(item.quantity) || 1;
        // Try to find price in Bill -> Fallback to Master List -> Default 0
        const retail = Number(item.retailPrice) || retailPriceMap[item.itemName] || 0;
        return itemAcc + (retail * qty);
      }, 0);
      return acc + saleCost;
    }, 0);

    // 6. Net Profit Logic: Total Revenue - Total Retail Cost
    const netResult = totalRevenue - totalRetailCost;
    const isProfit = netResult >= 0;

    // 7. Chart Data (Sales Trend based on Grand Total)
    const trendMap = {};
    filteredSales.forEach(sale => {
      const d = new Date(sale.createdAt || sale.date);
      const dateKey = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!trendMap[dateKey]) trendMap[dateKey] = 0;
      trendMap[dateKey] += (Number(sale.grandTotal) || 0);
    });

    const chartData = Object.keys(trendMap).map(date => ({
      name: date,
      sales: trendMap[date]
    })).slice(-10);

    // 8. Top Items Data
    const itemMap = {};
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        if (!itemMap[item.itemName]) itemMap[item.itemName] = 0;
        itemMap[item.itemName] += (Number(item.quantity) || 1);
      });
    });

    const topItemsData = Object.entries(itemMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // 9. Payment Method Analytics (CORRECTED FOR SPLIT PAYMENTS)
    // Instead of looking for a single "paymentMethod" string, we sum the specific fields.
    const paymentStats = {
      Cash: { count: 0, amount: 0 },
      UPI: { count: 0, amount: 0 },
      Card: { count: 0, amount: 0 }
    };

    filteredSales.forEach(sale => {
      // Extract individual payment amounts from the bill object
      const cashAmt = Number(sale.paymentCash) || 0;
      const upiAmt = Number(sale.paymentUPI) || 0;
      const cardAmt = Number(sale.paymentCard) || 0;

      if (cashAmt > 0) {
        paymentStats.Cash.count += 1;
        paymentStats.Cash.amount += cashAmt;
      }
      if (upiAmt > 0) {
        paymentStats.UPI.count += 1;
        paymentStats.UPI.amount += upiAmt;
      }
      if (cardAmt > 0) {
        paymentStats.Card.count += 1;
        paymentStats.Card.amount += cardAmt;
      }
    });

    // 10. Due Deliveries (GLOBAL ACTIVE LIST)
    const globalActiveOrders = salesData.filter(sale =>
      sale.orderStatus?.ordered === true &&
      sale.orderStatus?.delivered === false
    );

    const dueDeliveries = globalActiveOrders;

    return {
      filteredSales,
      totalOrders,
      totalRevenue,
      netResult,
      isProfit,
      currentAdvancePaid,
      currentBalanceDue,
      chartData,
      topItemsData,
      dueDeliveries,
      paymentStats
    };

  }, [salesData, allItems, dateRange, loading]);

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setDateRange({ startDate: today, endDate: today });
    setShowCustomFilter(false);
  };

  const toggleCustomFilter = () => {
    setShowCustomFilter(!showCustomFilter);
  };

  const handleExportExcel = () => {
    if (!analytics) return;
    setExporting(true);
    try {
      const salesSheetData = analytics.filteredSales.map(sale => ({
        "Date": new Date(sale.createdAt || sale.date).toLocaleDateString(),
        "Invoice No": sale.invoiceNo,
        "Customer": sale.customer?.customerName || "N/A",
        "Mobile": sale.customer?.mobileNumber || "N/A",
        // Format payment mode for Excel (e.g., "Cash + UPI")
        "Payment Mode": [
          Number(sale.paymentCash) > 0 ? "Cash" : null,
          Number(sale.paymentUPI) > 0 ? "UPI" : null,
          Number(sale.paymentCard) > 0 ? "Card" : null
        ].filter(Boolean).join(" + ") || "Unpaid",
        "Total Amount": Number(sale.grandTotal || 0),
        "Paid Amount": (Number(sale.grandTotal || 0) - (Number(sale.remaining) || 0)),
        "Balance Due": Number(sale.remaining || 0),
        "Status": sale.orderStatus?.delivered ? "Delivered" : "Ordered"
      }));

      const workbook = XLSX.utils.book_new();
      const salesSheet = XLSX.utils.json_to_sheet(salesSheetData);
      XLSX.utils.book_append_sheet(workbook, salesSheet, "Sales Report");

      XLSX.writeFile(workbook, `Analytics_Report_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`);
      toast.success("Excel exported successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export Excel");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById("dashboard-content");
    if (!element) return;

    setExporting(true);
    toast.info("Generating PDF, please wait...");

    try {
      const dataUrl = await toPng(element, {
        cacheBust: true,
        backgroundColor: '#f9fafb'
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);

      pdf.save(`Dashboard_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF exported successfully!");

    } catch (error) {
      console.error("PDF Gen Error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      </Layout>
    );
  }

  if (!analytics) return null;

  const isTodayView = dateRange.startDate === new Date().toISOString().split('T')[0] &&
    dateRange.endDate === new Date().toISOString().split('T')[0];

  return (
    <Layout>
      <div id="dashboard-content" className="p-6 min-h-screen bg-gray-50">

        <div className="flex flex-col xl:flex-row justify-between items-end xl:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#03214a]">Analytics Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              {isTodayView ? "Showing stats for Today" : `Stats from ${dateRange.startDate} to ${dateRange.endDate}`}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-end md:items-center">

            <div className="flex gap-2">
              <button
                onClick={handleExportExcel}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-100 transition shadow-sm text-xs disabled:opacity-50"
              >
                <FileSpreadsheet size={14} /> Excel
              </button>
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-100 transition shadow-sm text-xs disabled:opacity-50"
              >
                <Download size={14} /> PDF
              </button>
            </div>

            <div className="bg-white p-1.5 rounded-full shadow-sm border border-gray-200 flex items-center gap-2">
              <button
                onClick={setToday}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${isTodayView && !showCustomFilter ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Today
              </button>

              <button
                onClick={toggleCustomFilter}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex bg-red-600 text-white items-center gap-1 ${showCustomFilter ? 'bg-[#5ce1e6] text-[#03214a]' : 'text-gray-600 hover:bg-red-700'}`}
              >
                {showCustomFilter ? <X size={14} /> : <AlertTriangle size={14} />} Caution
              </button>
            </div>

            {showCustomFilter && (
              <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-200 flex items-center gap-3 animate-fade-in-down">
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-400 font-semibold ml-1">From</label>
                  <input
                    type="date"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateChange}
                    className="border-gray-200 bg-gray-50 rounded-lg text-sm px-2 py-1 outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-400 font-semibold ml-1">To</label>
                  <input
                    type="date"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateChange}
                    className="border-gray-200 bg-gray-50 rounded-lg text-sm px-2 py-1 outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ---------------- PRIMARY CARDS ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">

          {/* Card 1: Total Orders */}
          <StatCard
            title={isTodayView ? "Orders Today" : "Total Orders"}
            value={analytics.totalOrders}
            icon={<ShoppingCart className="text-blue-600" size={24} />}
            bg="bg-blue-50"
            subtext="Bills generated"
          />

          {/* Card 2: Total Revenue */}
          <StatCard
            title={isTodayView ? "Today's Bill Revenue" : "Total Revenue"}
            value={`₹${analytics.totalRevenue.toLocaleString('en-IN')}`}
            icon={<DollarSign className="text-emerald-600" size={24} />}
            bg="bg-emerald-50"
            subtext="Total Value of Bills"
          />

          {/* Card 3: Net Profit/Loss */}
          <div className={`relative overflow-hidden rounded-2xl shadow-sm border p-5 transition-all hover:shadow-md ${analytics.isProfit ? 'bg-linear-to-br from-green-50 to-white border-green-100' : 'bg-linear-to-br from-red-50 to-white border-red-100'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${analytics.isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.isProfit ? (isTodayView ? "Today's Net Profit" : "Net Profit") : (isTodayView ? "Today's Net Loss" : "Net Loss")}
                </p>
                <h3 className={`mt-8 text-2xl font-extrabold ${analytics.isProfit ? 'text-green-700' : 'text-red-700'}`}>
                  ₹{Math.abs(analytics.netResult).toLocaleString('en-IN')}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${analytics.isProfit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {analytics.isProfit ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100/50">
              <p className="text-xs text-gray-500">
                Revenue - Retail Cost
              </p>
            </div>
          </div>

          {/* Card 4: Advance Paid (Active Orders Only) */}
          <StatCard
            title={isTodayView ? "Advance Paid (Today)" : "Advance Paid"}
            value={`₹${analytics.currentAdvancePaid.toLocaleString('en-IN')}`}
            icon={<CheckCircle className="text-teal-600" size={24} />}
            bg="bg-teal-50"
            subtext={isTodayView ? "Collected for active orders today" : "Collected in this date range"}
          />

          {/* Card 5: Balance Due (Active Orders Only) */}
          <StatCard
            title={isTodayView ? "Balance Due (Today)" : "Balance Due"}
            value={`₹${analytics.currentBalanceDue.toLocaleString('en-IN')}`}
            icon={<Clock className="text-red-600" size={24} />}
            bg="bg-red-50"
            subtext={isTodayView ? "Pending from today's orders" : "Pending from these orders"}
          />

        </div>

        {/* ---------------- CHARTS & TABLES GRID ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* 1. SALES TREND CHART */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" /> Sales Trend
              </h2>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`₹${value}`, "Sales"]}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#0088FE" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. PAYMENT METHODS TABLE (UPDATED) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Wallet size={20} className="text-purple-600" /> Payment Modes
            </h2>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3 text-center">Count</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700 flex items-center gap-2">
                      <div className="p-1.5 bg-green-100 text-green-600 rounded-lg">
                        <Banknote size={14} />
                      </div>
                      Cash
                    </td>
                    <td className="px-4 py-3 text-center">{analytics.paymentStats.Cash.count}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">₹{analytics.paymentStats.Cash.amount.toLocaleString('en-IN')}</td>
                  </tr>

                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700 flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                        <Smartphone size={14} />
                      </div>
                      UPI
                    </td>
                    <td className="px-4 py-3 text-center">{analytics.paymentStats.UPI.count}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">₹{analytics.paymentStats.UPI.amount.toLocaleString('en-IN')}</td>
                  </tr>

                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700 flex items-center gap-2">
                      <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                        <CreditCard size={14} />
                      </div>
                      Card
                    </td>
                    <td className="px-4 py-3 text-center">{analytics.paymentStats.Card.count}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">₹{analytics.paymentStats.Card.amount.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-xl flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Total Collected:</span>
              <span className="text-gray-900 font-extrabold text-lg">
                ₹{(analytics.paymentStats.Cash.amount + analytics.paymentStats.UPI.amount + analytics.paymentStats.Card.amount).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* 3. TOP ITEMS & DELIVERIES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Package size={20} className="text-orange-500" /> Top Items
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={analytics.topItemsData} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" fill="#FF8042" radius={[0, 4, 4, 0]} barSize={20}>
                    {analytics.topItemsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Truck size={20} className="text-[#03214a]" /> Today's Deliveries
              </h2>
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {analytics.dueDeliveries.length} Pending
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 font-bold">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Bill No</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4 text-right">Balance Due</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.dueDeliveries.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-400 italic">
                        No deliveries scheduled for today.
                      </td>
                    </tr>
                  ) : (
                    analytics.dueDeliveries.map((sale, idx) => (
                      <tr key={idx} className="bg-white border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {sale.customer.customerName}
                          <div className="text-xs text-gray-400 font-normal">{sale.customer.mobileNumber}</div>
                        </td>
                        <td className="px-6 py-4">{sale.invoiceNo}</td>
                        <td className="px-6 py-4">
                          {sale.items.length > 0 ? sale.items[0].itemName : "N/A"}
                          {sale.items.length > 1 && <span className="text-xs text-blue-500 ml-1">+{sale.items.length - 1} more</span>}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-red-500">
                          ₹{sale.remaining}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {analytics.dueDeliveries.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <a href="/ordered" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                  Go to Active Orders <ArrowRight size={14} />
                </a>
              </div>
            )}
          </div>
        </div>

      </div>
      <ToastContainer position="bottom-right" theme="colored" />
    </Layout>
  );
};

const StatCard = ({ title, value, icon, bg, subtext }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${bg}`}>
        {icon}
      </div>
    </div>
    <div>
      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-extrabold text-gray-800 mt-1">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
    </div>
  </div>
);

export default Dashboard;