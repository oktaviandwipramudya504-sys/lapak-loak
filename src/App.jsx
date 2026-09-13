import { Routes, Route } from 'react-router-dom';

// Halaman pembeli
import Home from './pages/buyer/Home.jsx';
import ItemDetail from './pages/buyer/ItemDetail.jsx';
import Negotiation from './pages/buyer/Negotiation.jsx';
import Checkout from './pages/buyer/Checkout.jsx';
import Payment from './pages/buyer/Payment.jsx';
import OrderTracking from './pages/buyer/OrderTracking.jsx';
import BuyerStoryForm from './pages/buyer/BuyerStoryForm.jsx';
import MyActivity from './pages/buyer/MyActivity.jsx'; // <-- Impor halaman aktivitas saya

// Halaman admin
import AdminLogin from './pages/admin/Login.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminItems from './pages/admin/Items.jsx';
import AdminNegotiations from './pages/admin/Negotiations.jsx';
import AdminOrders from './pages/admin/Orders.jsx';
import AdminTransactions from './pages/admin/AdminTransactions.jsx';
import AdminAffiliates from './pages/admin/AdminAffiliates.jsx'; // <-- Impor halaman kelola afiliasi/rekomendasi
import AdminSettings from './pages/admin/Settings.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import RequireAdmin from './components/RequireAdmin.jsx';

export default function App() {
  return (
    <Routes>
      {/* Sisi pembeli — tanpa login, jalan sama di HP maupun laptop */}
      <Route path="/" element={<Home />} />
      <Route path="/barang/:itemId" element={<ItemDetail />} />
      <Route path="/tawar/:negotiationId" element={<Negotiation />} />
      <Route path="/checkout/:itemId" element={<Checkout />} />
      <Route path="/bayar/:orderCode" element={<Payment />} />
      <Route path="/pesanan/:orderCode" element={<OrderTracking />} />
      <Route path="/pesanan/:orderCode/cerita" element={<BuyerStoryForm />} />
      <Route path="/aktivitas-saya" element={<MyActivity />} /> {/* <-- Rute baru untuk aktivitas pembeli */}

      {/* Sisi admin — perlu login, sama-sama diakses dari HP/laptop */}
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<AdminDashboard />} />
        <Route path="barang" element={<AdminItems />} />
        <Route path="negosiasi" element={<AdminNegotiations />} />
        <Route path="pesanan" element={<AdminOrders />} />
        <Route path="transaksi" element={<AdminTransactions />} />
        <Route path="afiliasi" element={<AdminAffiliates />} /> {/* <-- Rute baru untuk kelola rekomendasi & afiliasi */}
        <Route path="pengaturan" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}