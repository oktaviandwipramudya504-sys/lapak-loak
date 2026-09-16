import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import Loader from '../../components/Loader';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  // State untuk menyimpan input resi per order_code
  const [resiInputs, setResiInputs] = useState({});

  useEffect(() => { 
    loadOrders(); 
  }, []);

  async function loadOrders() {
    setLoading(true);
    // Mengambil pesanan beserta data barang (nama)
    const { data, error } = await supabase
      .from('orders')
      .select('*, items(name)')
      .order('created_at', { ascending: false });
    
    if (!error) {
      setOrders(data ?? []);
      // Inisialisasi state input resi dari database jika sudah ada
      const initialResi = {};
      (data ?? []).forEach(o => {
        initialResi[o.order_code] = o.resi || '';
      });
      setResiInputs(initialResi);
    }
    setLoading(false);
  }

  async function updateStatusDanResi(orderCode, status) {
    try {
      const currentResi = resiInputs[orderCode] || '';
      const { error } = await supabase
        .from('orders')
        .update({ status, resi: currentResi })
        .eq('order_code', orderCode);

      if (error) throw error;

      // Cari data order yang bersangkutan untuk mengambil nomor WhatsApp & nama barang
      const targetOrder = orders.find(o => o.order_code === orderCode);
      if (targetOrder && targetOrder.buyer_whatsapp) {
        let cleanWa = targetOrder.buyer_whatsapp.replace(/\D/g, '');
        if (cleanWa.startsWith('0')) {
          cleanWa = '62' + cleanWa.slice(1);
        }

        const itemName = targetOrder.items?.name || 'Barang Loak';
        let statusText = status.replace('-', ' ');
        
        // Buat pesan WhatsApp otomatis sesuai status
        let pesanWa = `Halo kak ${targetOrder.buyer_name || ''}, status pesanan Anda (${itemName}) dengan kode ${orderCode} kini telah diperbarui menjadi: *${statusText.toUpperCase()}*.`;
        if (currentResi && (status === 'dikirim' || status === 'selesai')) {
          pesanWa += ` Nomor resi pengiriman Anda: *${currentResi}*.`;
        }
        pesanWa += ` Terima kasih sudah berbelanja di Lapak Ara!`;

        const urlWa = `https://wa.me/${cleanWa}?text=${encodeURIComponent(pesanWa)}`;
        window.open(urlWa, '_blank');
      }

      loadOrders();
      alert('Status dan resi pesanan berhasil diperbarui, serta membuka WhatsApp untuk mengirim notifikasi ke pembeli!');
    } catch (err) {
      alert('Gagal memperbarui status pesanan: ' + err.message);
    }
  }

  if (loading) return <div className="page" style={{ padding: 16, color: '#FFFFFF' }}><Loader text="Memuat daftar pesanan..." />Delo Bos</div>;

  return (
   <div style={{ maxWidth: 700, margin: '0 auto', padding: 16 }}>
      <div style={{ 
        background: '#fdfbf7', 
        border: '2px solid #1A1714', 
        boxShadow: '4px 4px 0px #1A1714', 
        padding: '16px 20px', 
        borderRadius: '8px',
        marginBottom: 16 
      }}>
        <h1 style={{ fontSize: 20, fontWeight: '800', margin: 0, color: '#1A1714', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Urusi Dagangane
        </h1>
      </div>
      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
          <p style={{ fontWeight: '700', color: '#1A1714', margin: 0 }}>Belum ada pesanan masuk.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map((o) => {
            const dateObj = new Date(o.created_at);
            const formattedDate = dateObj.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            // Format nomor WA untuk link langsung
            const cleanWa = o.buyer_whatsapp ? o.buyer_whatsapp.replace(/\D/g, '') : '';
            const waUrl = cleanWa.startsWith('0') 
              ? `https://wa.me/62${cleanWa.slice(1)}?text=Halo%20kak,%20terkait%20pesanan%20dengan%20kode%20${o.order_code}`
              : `https://wa.me/${cleanWa}?text=Halo%20kak,%20terkait%20pesanan%20dengan%20kode%20${o.order_code}`;

            return (
              <div key={o.order_code} className="card" style={{ padding: 16, background: '#FFF5E6', border: '1px solid #8C755B', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#1A1714' }}>
                    Kode: {o.order_code} <span style={{ fontWeight: 400, opacity: 0.7, fontSize: 11 }}>({formattedDate})</span>
                  </p>
                  <span style={{ 
                    fontWeight: 700, 
                    fontSize: '11px', 
                    padding: '3px 8px', 
                    borderRadius: 4, 
                    background: o.status === 'selesai' ? '#d4edda' : '#fff3cd',
                    color: o.status === 'selesai' ? '#155724' : '#856404',
                    textTransform: 'capitalize' 
                  }}>
                    {o.status || 'Baru'}
                  </span>
                </div>

                <p style={{ margin: '4px 0 2px', fontSize: 14, fontWeight: 800, color: 'var(--terracotta)' }}>
                  📦 {o.items?.name || 'Barang Loak'}
                </p>

                <p style={{ margin: '4px 0', fontSize: 13, fontWeight: 700, color: '#1A1714' }}>
                  Pembeli: {o.buyer_name || 'Tanpa Nama'} 
                  <span style={{ fontWeight: 400, fontSize: 12, opacity: 0.8 }}> — {o.buyer_whatsapp || '-'}</span>
                </p>

                {o.address && (
                  <p style={{ margin: '2px 0 6px', fontSize: 12, color: '#1A1714', opacity: 0.85 }}>
                    📍 Alamat: {o.address}
                  </p>
                )}

                {/* Bagian Tampilan Bukti Transfer */}
                {o.payment_proof_url ? (
                  <div style={{ margin: '8px 0', padding: 8, background: '#fff', borderRadius: 6, border: '1px solid #d5ccc2' }}>
                    <p style={{ fontSize: 12, fontWeight: '700', marginBottom: 4, color: '#1A1714' }}>Bukti Transfer:</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <a href={o.payment_proof_url} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={o.payment_proof_url} 
                          alt="Bukti Transfer" 
                          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, border: '1px solid #ccc' }} 
                        />
                      </a>
                      <a 
                        href={o.payment_proof_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#0056b3', fontWeight: '700', textDecoration: 'underline' }}
                      >
                        🖼️ Perbesar Gambar Bukti Transfer
                      </a>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: '#b33939', fontStyle: 'italic', margin: '6px 0' }}>
                    ⚠️ Pembeli belum mengupload bukti transfer.
                  </p>
                )}

                {o.buyer_whatsapp && (
                  <div style={{ margin: '6px 0 10px' }}>
                    <a 
                      href={waUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontSize: 12, color: 'var(--terracotta)', fontWeight: '700', textDecoration: 'none' }}
                    >
                      💬 Chat Pembeli via WhatsApp
                    </a>
                  </div>
                )}

                {/* Input Nomor Resi Pengiriman */}
                <div style={{ margin: '10px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 12, fontWeight: '700', color: '#1A1714' }}>Nomor Resi Pengiriman:</label>
                  <input 
                    type="text"
                    placeholder="Masukkan nomor resi (jika sudah dikirim)"
                    value={resiInputs[o.order_code] ?? ''}
                    onChange={(e) => setResiInputs({ ...resiInputs, [o.order_code]: e.target.value })}
                    style={{ padding: 8, fontSize: 12, borderRadius: 6, border: '1px solid #8C755B', background: '#FFF' }}
                  />
                </div>

                <div style={{ borderTop: '1px solid #D8C3A5', paddingTop: 10, marginTop: 8 }}>
                  <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: '700', color: '#1A1714' }}>Ubah Status Pesanan:</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['menunggu-verifikasi', 'diverifikasi', 'dikemas', 'dikirim', 'selesai'].map((s) => {
                      const isActive = o.status === s;
                      return (
                        <button 
                          key={s} 
                          className={isActive ? 'btn-primary' : 'btn-secondary'} 
                          style={{ fontSize: 11, padding: '4px 8px', textTransform: 'capitalize' }} 
                          onClick={() => updateStatusDanResi(o.order_code, s)}
                        >
                          {s.replace('-', ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
   </div>
  );
}