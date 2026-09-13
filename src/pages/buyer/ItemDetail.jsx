import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';
import Loader from '../../components/Loader';
import { getRecommendedItems } from '../../lib/recommendation.js';

export default function ItemDetail() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [whatsapp, setWhatsapp] = useState('');
  const [showTawarForm, setShowTawarForm] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 1. Cek apakah nomor WhatsApp sudah tersimpan di browser sebelumnya
    const savedWa = localStorage.getItem('buyer_whatsapp');
    if (savedWa) {
      setWhatsapp(savedWa);
    }

    async function fetchItemAndRecommendations() {
      setLoading(true);
      try {
        // 2. Ambil detail barang saat ini
        const { data: currentItem, error: itemError } = await supabase
          .from('items')
          .select('*')
          .eq('id', itemId)
          .single();
        
        if (itemError) throw itemError;
        setItem(currentItem);

        // 3. Ambil semua barang untuk dihitung rekomendasinya
        const { data: allItems, error: listError } = await supabase
          .from('items')
          .select('*');

        if (!listError && allItems) {
          const similar = getRecommendedItems(currentItem, allItems, 3);
          setRecommendations(similar);
        }
      } catch (err) {
        console.error('Gagal memuat detail barang:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchItemAndRecommendations();
    window.scrollTo(0, 0); // Scroll kembali ke atas saat ganti produk rekomendasi
  }, [itemId]);

  async function mulaiTawar() {
    const cleanWa = whatsapp.trim();
    if (!cleanWa) {
      alert('Masukkan nomor WhatsApp dulu ya, bos!');
      return;
    }

    // Simpan nomor WhatsApp ke localStorage agar pembeli tidak perlu input ulang di produk lain
    localStorage.setItem('buyer_whatsapp', cleanWa);

    setSubmitting(true);
    try {
      // 1. Cek apakah sudah ada sesi negosiasi aktif untuk item dan nomor WA ini
      const { data: existingNego, error: checkError } = await supabase
        .from('negotiations')
        .select('id')
        .eq('item_id', itemId)
        .eq('buyer_whatsapp', cleanWa)
        .eq('status', 'aktif')
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingNego) {
        // Jika sudah ada, langsung arahkan ke ruang tawar yang lama
        navigate(`/tawar/${existingNego.id}`);
        return;
      }

      // 2. Jika belum ada, buat sesi negosiasi baru
      const { data, error } = await supabase
        .from('negotiations')
        .insert({ 
          item_id: itemId, 
          buyer_whatsapp: cleanWa, 
          status: 'aktif' 
        })
        .select()
        .single();

      if (error) throw error;

      // 3. Masukkan tawaran awal (starting_price) ke tabel offers agar langsung muncul riwayat tawar
      const { error: offerError } = await supabase.from('offers').insert({
        negotiation_id: data.id,
        sender: 'buyer',
        amount: Number(item.starting_price),
      });

      if (offerError) throw offerError;

      await supabase
        .from('items')
        .update({ status: 'ditawar' })
        .eq('id', itemId);

      navigate(`/tawar/${data.id}`);
    } catch (err) {
      console.error('Gagal memulai negosiasi:', err);
      alert('Gagal memulai negosiasi, periksa kembali koneksi.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="page"><Loader text="Membuka laci barang..." /></div>;
  if (!item) return (
    <div className="page" style={{ textAlign: 'center', padding: '40px' }}>
      <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🥲</span>
      <p style={{ fontWeight: '700', color: '#1A1714' }}>Barangnya tidak ditemukan nih!</p>
    </div>
  );

  const photos = item.photos ?? [];

  return (
    <div className="page" style={{ maxWidth: 600, margin: '20px auto', padding: 16 }}>
      <div style={{ aspectRatio: '4/3', background: '#EEE7DA', borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
        {photos[activePhoto] && (
          <img
            src={photos[activePhoto]}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        {item.status && item.status !== 'tersedia' && (
          <span style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'var(--terracotta)',
            color: '#FFF',
            fontSize: '11px',
            fontWeight: '800',
            padding: '4px 10px',
            borderRadius: '6px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
          }}>
            {item.status.toUpperCase()}
          </span>
        )}
      </div>

      {photos.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {photos.map((url, i) => (
            <button
              key={url}
              onClick={() => setActivePhoto(i)}
              style={{
                width: 56,
                height: 56,
                borderRadius: 8,
                overflow: 'hidden',
                padding: 0,
                border: i === activePhoto ? '2px solid var(--terracotta)' : '1px solid #D8C3A5',
                flexShrink: 0,
                background: '#EEE7DA',
                cursor: 'pointer'
              }}
            >
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}

      {item.video_url && (
        <video
          src={item.video_url}
          controls
          style={{ width: '100%', borderRadius: 12, marginTop: 10 }}
        />
      )}

      <h1 style={{ fontSize: 18, margin: '14px 0 4px', color: '#fffefc', fontWeight: '900' }}>{item.name}</h1>
      <p style={{ fontSize: 13, color: '#fefefe', opacity: 0.85, whiteSpace: 'pre-line' }}>{item.condition_notes || item.description}</p>
      <p style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', margin: '8px 0 16px' }}>
        Rp{Number(item.starting_price).toLocaleString('id-ID')}
      </p>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-primary" style={{ flex: 1, padding: '12px' }} onClick={() => navigate(`/checkout/${item.id}`)}>
          Beli langsung
        </button>
        <button className="btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={() => setShowTawarForm(true)}>
          Berani tawar? 🤝
        </button>
      </div>

      {showTawarForm && (
        <div className="card" style={{ marginTop: 14, padding: 16 }}>
          <p style={{ fontSize: 13, marginTop: 0, fontWeight: '700', color: '#1A1714' }}>
            {whatsapp ? 'Nomor WhatsApp kamu sudah tersimpan:' : 'Masukkan nomor WhatsApp buat mulai nego:'}
          </p>
          <input
            type="tel"
            placeholder="Contoh: 08123456789"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 8, border: '1px solid #8C755B', background: '#FFF5E6', color: '#1A1714' }}
          />
          <button className="btn-primary" style={{ width: '100%' }} onClick={mulaiTawar} disabled={submitting}>
            {submitting ? 'Memproses...' : 'Mulai nego sekarang'}
          </button>
        </div>
      )}

      {/* Bagian Rekomendasi Produk Serupa */}
      <div style={{ marginTop: 32, borderTop: '1px solid #D8C3A5', paddingTop: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: '800', color: '#f6f3f1', marginBottom: 12 }}>
          Rekomendasi Produk Serupa 🔍
        </h2>

        {recommendations.length === 0 ? (
          <p style={{ fontSize: 12, opacity: 0.7 }}>Belum ada rekomendasi produk lain saat ini.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recommendations.map((rec) => {
              const recPhotos = rec.photos ?? [];
              return (
                <div 
                  key={rec.id} 
                  className="card" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: 10, 
                    background: '#FFF', 
                    border: '1px solid #8C755B',
                    borderRadius: 8 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                    {recPhotos[0] ? (
                      <img src={recPhotos[0]} alt={rec.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                    ) : (
                      <div style={{ width: 48, height: 48, background: '#D8C3A5', borderRadius: 6 }} />
                    )}
                    <div style={{ overflow: 'hidden' }}>
                      <h3 style={{ fontSize: 13, fontWeight: '700', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {rec.name}
                      </h3>
                      <p style={{ fontSize: 12, fontWeight: '800', color: 'var(--terracotta)', margin: '2px 0 0 0' }}>
                        Rp{Number(rec.starting_price).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <button 
                    className="btn-primary" 
                    style={{ padding: '6px 12px', fontSize: '11px', whiteSpace: 'nowrap' }}
                    onClick={() => navigate(`/barang/${rec.id}`)}
                  >
                    Cek Produk
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}