// admin/layout.jsx
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const MENU = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/barang', label: 'Barangmu Iki' },
  { to: '/admin/negosiasi', label: 'Nyang-Nyangan' },
  { to: '/admin/pesanan', label: 'Pesanan Iki' },
  { to: '/admin/transaksi', label: 'Transaksi Bos' },
  { to: '/admin/afiliasi', label: 'Afiliasilit' }, // <-- Menu Kelola Rekomendasi & Afiliasi baru
  { to: '/admin/pengaturan', label: 'Dandan Bos' },
];

// Layout admin: sidebar di layar lebar (laptop), bottom nav / floating side nav di layar sempit (HP).
// Dipakai sama persis baik diakses dari Android, iOS, maupun laptop.
export default function AdminLayout() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <nav className="admin-sidebar">
        <p style={{ fontWeight: 600, padding: '0 16px' }}>Meja Ara Dindul</p>
        {MENU.map((m) => (
          <NavLink key={m.to} to={m.to} end={m.end} className="admin-nav-item">
            {m.label}
          </NavLink>
        ))}
      </nav>

      <main className="page" style={{ flex: 1, paddingBottom: 40 }}>
        <Outlet />
      </main>

      <div className={`admin-mobile-floating-wrapper ${isOpen ? 'open' : ''}`}>
        <button 
          className="admin-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '‹' : '›'}
        </button>

        <nav className="admin-bottom-nav">
          <p className="admin-mobile-title">Menu</p>
          {MENU.map((m) => (
            <NavLink 
              key={m.to} 
              to={m.to} 
              end={m.end} 
              className="admin-nav-item-mobile"
              onClick={() => setIsOpen(false)}
            >
              {m.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}