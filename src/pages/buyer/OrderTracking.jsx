import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';
import Loader from '../../components/Loader';

// Sesuaikan urutan step dengan status yang benar-benar dipakai di aplikasi
const STEPS = ['menunggu-pembayaran', 'menunggu-verifikasi', 'diverifikasi', 'dikemas', 'dikirim', 'selesai'];

export default function OrderTracking() {
  const { orderCode } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderCode]);

  async function fetchOrder() {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, items(name)')
      .eq('order_code', orderCode)
      .single();
    
    if (!error && data) {
      setOrder(data);
    }
    setLoading(false);
  }

  if (loading) return <div className="page" style={{ padding: 16 }}><Loader text="Memuat data pesanan..." /></div>;
  if (!order) return <div className="page" style={{ padding: 16 }}>Pesanan dengan kode {orderCode} tidak ditemukan.</div>;

  const currentIndex = STEPS.indexOf(order.status);

  return (
    <div className="page" style={{ maxWidth: 500, margin: '20px auto', padding: 16 }}>
      <h1 style={{ fontSize: 18, marginBottom: 16, color: '#1A1714', fontWeight: '800' }}>Pelacakan Pesanan</h1>
      
      <div className="card" style={{ background: '#fdfbf7', border: '1px solid #e6decb', padding: 16, borderRadius: 8 }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 4px' }}>Kode Pesanan: <b>{orderCode}</b></p>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 12px' }}>Barang: <b>{order.items?.name || 'Barang Loak'}</b></p>
        
        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '12px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '12px 0' }}>
          {STEPS.map((step, i) => {
            const isPassed = currentIndex !== -1 && i <= currentIndex;
            return (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                <span style={{ color: isPassed ? 'var(--terracotta)' : 'var(--muted)', fontWeight: 'bold' }}>
                  {isPassed ? '●' : '○'}
                </span>
                <span style={{ textTransform: 'capitalize', color: isPassed ? '#1A1714' : 'var(--muted)', fontSize: 13, fontWeight: isPassed ? '700' : '400' }}>
                  {step.replace('-', ' ')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Tampilan Nomor Resi Lengkap dengan Tombol Pintasan Cek Kurir */}
        {order.resi && (
          <div style={{ marginTop: 14, padding: 12, background: '#fff', borderRadius: 6, border: '1px solid #d5ccc2' }}>
            <p style={{ fontSize: 12, fontWeight: '700', margin: 0, color: '#1A1714' }}>Nomor Resi Pengiriman:</p>
            <p style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--terracotta)', margin: '4px 0 8px' }}>{order.resi}</p>
            
            <a 
              href={`https://www.google.com/search?q=cek+resi+${order.resi}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: '#0056b3', fontWeight: '700', textDecoration: 'underline' }}
            >
              🔍 Lacak Paket di Web Kurir ↗
            </a>
          </div>
        )}
      </div>

      {order.status === 'selesai' && (
        <Link to={`/pesanan/${orderCode}/cerita`} className="btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: 12, padding: 10, textDecoration: 'none' }}>
          Ceritakan pengalamanmu
        </Link>
      )}
    </div>
  );
}