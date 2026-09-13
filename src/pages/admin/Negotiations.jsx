import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';

export default function AdminNegotiations() {
  const [negotiations, setNegotiations] = useState([]);
  const [counterInput, setCounterInput] = useState({});
  const [activeCounterId, setActiveCounterId] = useState(null);

  async function fetchNegotiations() {
    const { data } = await supabase
      .from('negotiations')
      .select('*, items(name), offers(amount, sender, created_at)')
      .eq('status', 'aktif')
      .order('created_at', { ascending: false });
    setNegotiations(data ?? []);
  }

  useEffect(() => {
    fetchNegotiations();
  }, []);

  async function terima(neg) {
    try {
      const tawaranTerakhir = neg.offers?.[neg.offers.length - 1];
      const dealAmount = Number(tawaranTerakhir?.amount ?? 0);
      const itemName = neg.items?.name ?? 'Barang Loak';
      const buyerWhatsapp = neg.buyer_whatsapp ?? '-';

      // 1. Simpan data ke tabel orders otomatis saat Deal agar pembeli bisa langsung checkout/bayar
      const orderCode = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      const { error: orderError } = await supabase.from('orders').insert({
        order_code: orderCode,
        item_id: neg.item_id,
        buyer_name: 'Pembeli Nego',
        buyer_whatsapp: buyerWhatsapp,
        address: 'Alamat dari ruang tawar',
        shipping_cost: 0,
        status: 'dibuat'
      });

      if (orderError) throw orderError;

      // 2. Set negosiasi ini jadi menang
      await supabase.from('negotiations').update({ status: 'menang' }).eq('id', neg.id);
      
      // 3. Tutup/kalah negosiasi lain untuk barang yang sama
      await supabase.from('negotiations').update({ status: 'kalah' }).eq('item_id', neg.item_id).neq('id', neg.id);
      
      // 4. Amankan status barang
      await supabase.from('items').update({ status: 'terjual' }).eq('id', neg.item_id);

      alert(`Tawaran berhasil diterima (Deal)! Pesanan dibuat dengan kode ${orderCode}.`);
      fetchNegotiations();
    } catch (err) {
      console.error('Gagal memproses deal:', err);
      alert('Terjadi kesalahan saat memproses deal.');
    }
  }

  async function kirimCounter(negotiationId) {
    const amount = counterInput[negotiationId];
    if (!amount) {
      alert('Masukkan nominal harga counter dulu!');
      return;
    }

    try {
      // Ubah 'seller' menjadi 'admin' agar lolos check constraint database
      const { error } = await supabase.from('offers').insert({
        negotiation_id: negotiationId,
        sender: 'admin',
        amount: Number(amount),
      });

      if (error) throw error;

      // Kirim pesan WhatsApp otomatis ke pembeli
      const targetNeg = negotiations.find(n => n.id === negotiationId);
      if (targetNeg && targetNeg.buyer_whatsapp) {
        let nomorWa = targetNeg.buyer_whatsapp.replace(/\D/g, '');
        if (nomorWa.startsWith('0')) {
          nomorWa = '62' + nomorWa.slice(1);
        }

        const pesanWa = `Halo kak, admin Lapak Ara sudah mengirimkan harga tawar balik (counter) sebesar Rp${Number(amount).toLocaleString('id-ID')}. Silakan cek ruang tawar di web ya!`;
        const urlWa = `https://wa.me/${nomorWa}?text=${encodeURIComponent(pesanWa)}`;
        window.open(urlWa, '_blank');
      }

      setCounterInput({ ...counterInput, [negotiationId]: '' });
      setActiveCounterId(null);
      alert('Harga tawar balik (counter) berhasil dikirim ke pembeli!');
      fetchNegotiations();
    } catch (err) {
      console.error('Gagal mengirim counter:', err);
      alert('Gagal mengirim harga tawar balik.');
    }
  }

 return (
    <div className="page" style={{ maxWidth: 600, margin: '20px auto', padding: 16 }}>
      <div style={{ 
        background: '#fdfbf7', 
        border: '2px solid #1A1714', 
        boxShadow: '4px 4px 0px #1A1714', 
        padding: '16px 20px', 
        borderRadius: '8px',
        marginBottom: 16 
      }}>
        <h1 style={{ fontSize: 20, fontWeight: '800', margin: 0, color: '#1A1714', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Nego Neng Kene
        </h1>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {negotiations.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <p style={{ fontWeight: '700', color: '#1A1714', margin: 0 }}>Urong Ono Wong Ngenyang Sementara.</p>
          </div>
        ) : (
          negotiations.map((n) => {
            const tawaranTerakhir = n.offers?.[n.offers.length - 1];
            const isCountering = activeCounterId === n.id;

            return (
              <div key={n.id} className="card" style={{ padding: 16 }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: '#1A1714' }}>{n.items?.name}</p>
                <p style={{ margin: '4px 0 8px', fontSize: 12, color: '#1A1714', opacity: 0.8 }}>WhatsApp Pembeli: <strong>{n.buyer_whatsapp}</strong></p>
                <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: '700', color: 'var(--terracotta)' }}>
                  Tawaran terakhir: Rp{Number(tawaranTerakhir?.amount ?? 0).toLocaleString('id-ID')} ({tawaranTerakhir?.sender === 'buyer' ? 'Pembeli' : 'Admin'})
                </p>

                {/* Form Input Counter */}
                {isCountering && (
                  <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                    <input
                      type="number"
                      placeholder="Nominal harga counter..."
                      value={counterInput[n.id] || ''}
                      onChange={(e) => setCounterInput({ ...counterInput, [n.id]: e.target.value })}
                      style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #8C755B', background: '#FFF5E6' }}
                    />
                    <button className="btn-primary" onClick={() => kirimCounter(n.id)} style={{ padding: '0 12px', fontSize: '13px' }}>
                      Kirim
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    className="btn-secondary" 
                    style={{ flex: 1 }}
                    onClick={() => setActiveCounterId(isCountering ? null : n.id)}
                  >
                    {isCountering ? 'Batal' : 'Counter'}
                  </button>
                  <button 
                    className="btn-primary" 
                    style={{ flex: 1 }} 
                    onClick={() => terima(n)}
                  >
                    Terima (Deal)
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}