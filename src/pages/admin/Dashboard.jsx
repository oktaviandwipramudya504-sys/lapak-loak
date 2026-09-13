import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import Loader from '../../components/Loader';

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ tawaranBaru: 0, nungguBayar: 0, perluDikirim: 0, selesai: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCounts() {
      setLoading(true);
      // TODO: ganti dengan query agregasi yang lebih efisien (RPC/count) di Supabase.
      const [{ count: tawaranBaru }, { count: nungguBayar }, { count: perluDikirim }, { count: selesai }] =
        await Promise.all([
          supabase.from('negotiations').select('*', { count: 'exact', head: true }).eq('status', 'aktif'),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'menunggu-verifikasi'),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'dikemas'),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'selesai'),
        ]);
      setCounts({ tawaranBaru: tawaranBaru ?? 0, nungguBayar: nungguBayar ?? 0, perluDikirim: perluDikirim ?? 0, selesai: selesai ?? 0 });
      setLoading(false);
    }
    loadCounts();
  }, []);

  const cards = [
    ['Tawaran baru', counts.tawaranBaru],
    ['Nunggu bayar', counts.nungguBayar],
    ['Perlu dikirim', counts.perluDikirim],
    ['Selesai', counts.selesai],
  ];

 return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ 
        background: '#fdfbf7', 
        border: '2px solid #1A1714', 
        boxShadow: '4px 4px 0px #1A1714', 
        padding: '16px 20px', 
        borderRadius: '8px' 
      }}>
        <h1 style={{ fontSize: 20, fontWeight: '800', margin: 0, color: '#1A1714', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Cek Dagangan 
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}></p>
      </div>
      
      {loading ? (
        <Loader text="Lagi meriksa inventaris & pesanan..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {cards.map(([label, value]) => (
            <div key={label} className="card">
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>{label}</p>
              <p style={{ fontSize: 24, fontWeight: 600, margin: '4px 0 0' }}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}