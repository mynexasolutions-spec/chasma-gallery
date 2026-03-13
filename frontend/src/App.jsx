import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import Coupons from './pages/Coupons';
import Reviews from './pages/Reviews';
import Settings from './pages/Settings';
import Payments from './pages/Payments';
import Attributes from './pages/Attributes';
import UserDetail from './pages/UserDetail';
import { Spinner } from './components/ui';

import StoreLayout from './components/store/StoreLayout';
import Home from './pages/store/Home';
import Shop from './pages/store/Shop';
import ProductDetail from './pages/store/ProductDetail';
import Checkout from './pages/store/Checkout';
import CustomerLogin from './pages/store/CustomerLogin';
import CustomerRegister from './pages/store/CustomerRegister';
import CustomerDashboard from './pages/store/CustomerDashboard';
import PrivacyPolicy from './pages/store/PrivacyPolicy';
import TermsConditions from './pages/store/TermsConditions';
import RefundPolicy from './pages/store/RefundPolicy';
import ShippingPolicy from './pages/store/ShippingPolicy';
import ContactUs from './pages/store/ContactUs';
import AboutUs from './pages/store/AboutUs';
import { CartProvider } from './context/CartContext';
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin' && user.role !== 'manager') return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;

  if (user) {
    if (user.role === 'admin' || user.role === 'manager') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* ── Public Storefront ─────────────────────────────────── */}
            <Route path="/" element={<StoreLayout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="shop/product/:id" element={<ProductDetail />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="login" element={<PublicRoute><CustomerLogin /></PublicRoute>} />
              <Route path="register" element={<PublicRoute><CustomerRegister /></PublicRoute>} />
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="terms-conditions" element={<TermsConditions />} />
              <Route path="refund-policy" element={<RefundPolicy />} />
              <Route path="shipping-policy" element={<ShippingPolicy />} />
              <Route path="contact" element={<ContactUs />} />
              <Route path="about" element={<AboutUs />} />
            </Route>
            {/* ── Admin Dashboard ───────────────────────────────────── */}
            <Route path="/admin/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="users" element={<Users />} />
              <Route path="users/:id" element={<UserDetail />} />
              <Route path="categories" element={<Categories />} />
              <Route path="brands" element={<Brands />} />
              <Route path="attributes" element={<Attributes />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="payments" element={<Payments />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
