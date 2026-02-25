import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./page/Home";
import Login from "./page/Login";
import StaffLogin from "./page/StaffLogin"; // Make sure to import StaffLogin
import Dashboard from "./admin/Dashboard";
// import Prescription from "./admin/Prescription";
import Items from "./admin/Items";
import PurchaseBill from "./admin/PurchaseBill";
import OrderSummary from "./admin/OrderSummary";
import Ordered from "./admin/Ordered";
import Delivered from "./admin/Delivered";
import CustomerList from "./admin/CustomerList";
import AddProducts from "./admin/AddProducts";
import EyeGlasses from "./page/EyeGlasses";
import SunGlasses from "./page/SunGlasses";
import ContactLens from "./page/ContactLens";
import Cart from "./page/Cart";
import PurchaseHistory from "./admin/PurchaseHistory";
import TermsConditions from "./page/TermsConditions";
import PrivacyPolicy from "./page/PrivacyPolicy";
import GstFile from './admin/GstFile';
import StockManagement from './admin/StockManagement';

// Updated ProtectedRoute to accept allowedRoles
const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const userRole = localStorage.getItem("role"); // Get role from local storage

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If roles are defined and user doesn't have permission, redirect
  // For staff trying to access admin pages, redirect to a safe page like order-summary
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/order-summary" />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/eyeglasses" element={<EyeGlasses />} />
      <Route path="/sunglasses" element={<SunGlasses />} />
      <Route path="/contact-lenses" element={<ContactLens />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/terms-conditions" element={<TermsConditions />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      
      {/* Login Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/staff-login" element={<StaffLogin />} />

      {/* --- ADMIN ONLY ROUTES (Restricted from Staff) --- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/items"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Items />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchase-bill"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PurchaseBill />
          </ProtectedRoute>
        }
      />

      {/* --- SHARED ROUTES (Admin & Staff) --- */}
      <Route
        path="/purchase-history"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <PurchaseHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-summary"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <OrderSummary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ordered"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Ordered />
          </ProtectedRoute>
        }
      />
      <Route
        path="/delivered"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Delivered />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer-list"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <CustomerList />
          </ProtectedRoute>
        }
      />
      {/* Assuming GstFile and AddProducts are shared. 
          If these should also be Admin only, move them to the block above. */}
      <Route
        path="/gst-file"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <GstFile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stock-management"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <StockManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-products"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <AddProducts />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;