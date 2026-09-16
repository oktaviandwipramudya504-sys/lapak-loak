import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';

// Ruang tawar privat: cuma pembeli ini & admin yang bisa lihat.
export default function Negotiation() {
  const { negotiationId } = useParams();
  const [offers, setOffers] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [justSent, setJustSent] = useState(false);

  useEffect(() => {
    async function load() {
      // Mengambil data riwayat tawar berdasarkan negotiation_id
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('negotiation_id', negotiationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Gagal memuat riwayat tawar:', error);
      } else {
        setOffers(data ?? []);
      }
    }
    
    if (negotiationId) {
      load();
    }

    // Supabase Realtime subscription agar update otomatis tanpa refresh manual
    const channel = supabase
      .channel(`public:offers:negotiation_id=eq.${negotiationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'offers',
          filter: `negotiation_id=eq.${negotiationId}`,
        },
        (payload) => {
          setOffers((prev) => {
            if (prev.some((item) => item.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [negotiationId]);

  async function kirimTawaran(e) {
    if (e) e.preventDefault();
    if (!amount || loading) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('offers').insert({
        negotiation_id: negotiationId,
        sender: 'buyer',
        amount: Number(amount),
      });

      if (error) throw error;
      
      const nominalTawaran = amount;
      setAmount('');
      setJustSent(true);
      setTimeout(() => setJustSent(false), 3000); // Teks status terkirim hilang otomatis setelah 3 detik

      // Integrasi instan ke WhatsApp Admin
      const nomorAdmin = "62882006296949";
      const pesan = `Halo Admin Lapak Loak, saya baru saja mengirim tawaran sebesar Rp${Number(nominalTawaran).toLocaleString('id-ID')} di ruang tawar. Mohon dicek ya kak!`;
      const urlWa = `https://wa.me/${nomorAdmin}?text=${encodeURIComponent(pesan)}`;
      window.open(urlWa, '_blank');

    } catch (err) {
      console.error('Gagal mengirim tawaran:', err);
      alert('Gagal mengirim tawaran, coba periksa koneksi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 500, margin: '20px auto', padding: 16 }}>
      <h1 style={{ fontSize: 18, marginBottom: 16, color: '#fcfbfa', fontWeight: '800' }}>Ruang tawar kamu</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, minHeight: 200, maxHeight: 400, overflowY: 'auto', paddingRight: 4 }}>
        {offers.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '24px', margin: '10px 0' }}>
            <span style={{ fontSize: '28px', display: 'block', marginBottom: '6px' }}>🥲</span>
            <p style={{ fontWeight: '700', margin: 0, color: '#f7f5f3', fontSize: '13px' }}>Belum ada riwayat tawaran nih!</p>
            <p style={{ fontSize: '11px', marginTop: '2px', color: '#1A1714', opacity: 0.85 }}>Mulai tawar harga barang impianmu sekarang.</p>
          </div>
        ) : (
          offers.map((o) => (
            <div
              key={o.id}
              className="card"
              style={{
                alignSelf: o.sender === 'buyer' ? 'flex-end' : 'flex-start',
                backgroundColor: o.sender === 'buyer' ? 'var(--terracotta)' : '#D8C3A5',
                color: o.sender === 'buyer' ? '#FFF' : '#1A1714',
                maxWidth: '75%',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 14,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                border: o.sender === 'buyer' ? 'none' : '2px solid #8C755B'
              }}
            >
              <div style={{ fontSize: 10, opacity: 0.85, marginBottom: 2, fontWeight: '700' }}>
                {o.sender === 'buyer' ? 'Kamu' : 'Penjual'}
              </div>
              <div style={{ fontWeight: '800' }}>
                Rp{Number(o.amount).toLocaleString('id-ID')}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={kirimTawaran} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="number"
            placeholder="Tulis tawaranmu..."
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #8C755B', background: '#FFF5E6', color: '#1A1714' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 16px' }} disabled={loading}>
            {loading ? '...' : 'Kirim'}
          </button>
        </div>
        
        {/* Indikator Status Terkirim */}
        {justSent && (
          <span style={{ fontSize: 11, color: 'green', fontWeight: '700', textAlign: 'center' }}>
            ✓ Tawaran berhasil terkirim ke penjual! Membuka WhatsApp...
          </span>
        )}
      </form>

      <p style={{ fontSize: 11, color: '#1A1714', opacity: 0.8, marginTop: 10, textAlign: 'center' }}>
        Cuma kamu dan penjual yang bisa lihat obrolan ini.
      </p>
    </div>
  );
}