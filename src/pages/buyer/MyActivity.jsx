import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';
import Loader from '../../components/Loader';

export default function MyActivity() {
  const navigate = useNavigate();
  const [whatsapp, setWhatsapp] = useState('');
  const [inputWa, setInputWa] = useState('');
  const [negotiations, setNegotiations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedWa = localStorage.getItem('buyer_whatsapp');
    if (savedWa) {
      setWhatsapp(savedWa);
      loadData(savedWa);
    }
  }, []);

  async function loadData(waNumber) {
    setLoading(true);
    const cleanWa = waNumber.trim();

    // 1. Ambil data negosiasi berdasarkan nomor WA pembeli
    const { data: negoData } = await supabase
      .from('negotiations')
      .select('*, items(name, starting_price, photos), offers(amount, sender, created_at)')
      .eq('buyer_whatsapp', cleanWa)
      .order('created_at', { ascending: false });

    // 2. Ambil data pesanan/orders berdasarkan nomor WA pembeli
    const { data: orderData } = await supabase
      .from('orders')
      .select('*, items(name, starting_price, photos)')
      .eq('buyer_whatsapp', cleanWa)
      .order('created_at', { ascending: false });

    setNegotiations(negoData ?? []);
    setOrders(orderData ?? []);
    setLoading(false);
  }

  function handleSaveWa(e) {
    e.preventDefault();
    if (!inputWa.trim()) return;
    localStorage.setItem('buyer_whatsapp', inputWa.trim());
    setWhatsapp(inputWa.trim());
    loadData(inputWa.trim());
  }

  function gantiNomor() {
    localStorage.removeItem('buyer_whatsapp');
    setWhatsapp('');
    setInputWa('');
    setNegotiations([]);
    setOrders([]);
  }

  // Jika nomor WhatsApp belum terekam di browser, minta input dulu
  if (!whatsapp) {
    return (
      <div className="page" style={{ maxWidth: 400, margin: '40px auto', padding: 20, textAlign: 'center' }}>
        <h1 style={{ fontSize: 18, marginBottom: 8, color: '#f4f0eb', fontWeight: '800' }}>Cek Aktivitas Saya</h1>
        <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 16, color:'#FFFFFF' }}>
          Masukkan nomor WhatsApp yang pernah kamu gunakan untuk menawar atau checkout barang.
        </p>
        <form onSubmit={handleSaveWa} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="tel"
            placeholder="Contoh: 08123456789"
            value={inputWa}
            onChange={(e) => setInputWa(e.target.value)}
            style={{ padding: 10, borderRadius: 6, border: '1px solid #8C755B', background: '#FFF5E6' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: 10 }}>Lihat Aktivitas</button>
        </form>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 600, margin: '20px auto', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
       <div style={{ 
  background: '#fdfbf7', 
  border: '2px solid #1A1714', 
  boxShadow: '4px 4px 0px #1A1714', 
  padding: '16px 20px', 
  borderRadius: '8px',
  marginBottom: 16 
}}>
  <h1 style={{ fontSize: 20, fontWeight: '800', margin: 0, color: '#1A1714', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
    Aktivitas Saya
  </h1>
  <p style={{ fontSize: 13, color: '#1A1714', margin: '4px 0 0' }}>No. WA: <strong>{whatsapp}</strong></p>
</div>
        <button onClick={gantiNomor} className="btn-secondary" style={{ fontSize: 11, padding: '6px 10px' }}>
          Ganti Nomor
        </button>
      </div>

      {loading ? (
        <Loader text="Memuat daftar aktivitas..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* BAGIAN 1: DAFTAR NEGOSIASI */}
          <div>
            <div style={{ 
  background: '#fdfbf7', 
  border: '2px solid #1A1714', 
  boxShadow: '4px 4px 0px #1A1714', 
  padding: '16px 20px', 
  borderRadius: '8px',
  marginBottom: 16 
}}>
  <h2 style={{ fontSize: 16, fontWeight: '800', margin: 0, color: '#1A1714', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
    🤝 Barang yang Sedang Ditawar ({negotiations.length})
  </h2>
</div>
            {negotiations.length === 0 ? (
              <div className="card" style={{ padding: 16, textAlign: 'center', opacity: 0.7, fontSize: 13 }}>
                Belum ada riwayat tawar-menawar.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {negotiations.map((n) => {
                  const photos = n.items?.photos ?? [];
                  const tawaranTerakhir = n.offers?.[n.offers.length - 1];
                  return (
                    <div key={n.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#FFF', border: '1px solid #8C755B', borderRadius: 8 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', overflow: 'hidden' }}>
                        {photos[0] ? (
                          <img src={photos[0]} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                        ) : (
                          <div style={{ width: 48, height: 48, background: '#EEE7DA', borderRadius: 6 }} />
                        )}
                        <div>
                          <h3 style={{ fontSize: 13, fontWeight: '700', margin: 0, color: '#1A1714' }}>{n.items?.name || 'Produk'}</h3>
                          <p style={{ fontSize: 12, fontWeight: '800', color: 'var(--terracotta)', margin: '2px 0' }}>
                            Tawaran: Rp{Number(tawaranTerakhir?.amount || 0).toLocaleString('id-ID')} ({tawaranTerakhir?.sender === 'buyer' ? 'Kamu' : 'Admin'})
                          </p>
                          <span style={{ fontSize: 10, padding: '2px 6px', background: n.status === 'menang' ? '#d4edda' : '#fff3cd', color: n.status === 'menang' ? '#155724' : '#856404', borderRadius: 4, fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {n.status}
                          </span>
                        </div>
                      </div>
                      <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px', whiteSpace: 'nowrap' }} onClick={() => navigate(`/tawar/${n.id}`)}>
                        Buka Ruang Tawar
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* BAGIAN 2: DAFTAR PESANAN / CHECKOUT */}
          <div>
           <div style={{ 
  background: '#fdfbf7', 
  border: '2px solid #1A1714', 
  boxShadow: '4px 4px 0px #1A1714', 
  padding: '16px 20px', 
  borderRadius: '8px',
  marginBottom: 16 
}}>
  <h2 style={{ fontSize: 16, fontWeight: '800', margin: 0, color: '#1A1714', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
    📦 Riwayat Pesanan & Pembelian ({orders.length})
  </h2>
</div>
            {orders.length === 0 ? (
              <div className="card" style={{ padding: 16, textAlign: 'center', opacity: 0.7, fontSize: 13 }}>
                Belum ada pesanan atau barang yang di-checkout.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {orders.map((o) => {
                  const photos = o.items?.photos ?? [];
                  return (
                    <div key={o.order_code} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: '#FFF5E6', border: '1px solid #8C755B', borderRadius: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', overflow: 'hidden' }}>
                          {photos[0] ? (
                            <img src={photos[0]} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                          ) : (
                            <div style={{ width: 48, height: 48, background: '#EEE7DA', borderRadius: 6 }} />
                          )}
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 'bold', opacity: 0.7, margin: 0 }}>Kode: {o.order_code}</p>
                            <h3 style={{ fontSize: 13, fontWeight: '700', margin: '2px 0', color: '#1A1714' }}>{o.items?.name || 'Produk'}</h3>
                            <span style={{ fontSize: 10, padding: '2px 6px', background: '#e2d9c8', color: '#1A1714', borderRadius: 4, fontWeight: 'bold', textTransform: 'capitalize' }}>
                              Status: {o.status}
                            </span>
                          </div>
                        </div>
                        <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px', whiteSpace: 'nowrap' }} onClick={() => navigate(`/bayar/${o.order_code}`)}>
                          Cek Pembayaran
                        </button>
                      </div>

                      {/* Tampilkan Resi & Tombol Lacak jika sudah diisi admin */}
                      {o.resi && (
                        <div style={{ background: '#FFF', padding: 8, borderRadius: 6, border: '1px dashed #8C755B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: 11, color: '#666', display: 'block' }}>Nomor Resi Pengiriman:</span>
                            <strong style={{ fontSize: 13, color: '#1A1714' }}>{o.resi}</strong>
                          </div>
                          <a 
                            href={`https://www.google.com/search?q=cek+resi+${encodeURIComponent(o.resi)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-secondary"
                            style={{ fontSize: 11, padding: '4px 8px', textDecoration: 'none' }}
                          >
                            🔍 Lacak Paket
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}