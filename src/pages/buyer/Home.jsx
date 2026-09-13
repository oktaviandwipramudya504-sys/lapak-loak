import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';
import Loader from '../../components/Loader';

const FILTERS = ['Semua', 'Baru nongol', 'Lagi rame', 'Lagi ditawar', 'Di bawah 100rb'];

// Data cadangan (fallback) jika belum ada iklan/rekomendasi yang dibuat admin di database
const FALLBACK_AFFILIATES = [
  {
    id: 1,
    title: "Rekomendasi Spesial Partner",
    description: "Koleksi pilihan unik & estetik untuk gaya harianmu.",
    image_url: "/backdrop-ara.jpg",
    video_url: null,
    affiliate_url: "https://example.com"
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Semua');

  useEffect(() => {
    async function fetchData() {
      // 1. Ambil data barang lapak dari Supabase
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('*')
        .neq('status', 'terjual')
        .order('created_at', { ascending: false });
      
      if (!itemError) setItems(itemData ?? []);

      // 2. Ambil data rekomendasi / iklan banner dari tabel 'affiliates'
      const { data: affData, error: affError } = await supabase
        .from('affiliates')
        .select('*')
        .order('created_at', { ascending: false });

      if (!affError && affData && affData.length > 0) {
        setAffiliates(affData);
      } else {
        setAffiliates(FALLBACK_AFFILIATES);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredItems = items.filter((item) => {
    if (activeFilter === 'Semua') return true;
    if (activeFilter === 'Baru nongol') return item.status === 'tersedia';
    if (activeFilter === 'Lagi rame') return item.status === 'tersedia' || item.is_popular;
    if (activeFilter === 'Lagi ditawar') return item.status === 'ditawar';
    if (activeFilter === 'Di bawah 100rb') return Number(item.starting_price) < 100000;
    return true;
  });

  return (
    <div className="page">
      {/* Tombol Akses Aktivitas Saya */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 4px 0' }}>
        <button 
          className="btn-secondary" 
          style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '20px' }}
          onClick={() => navigate('/aktivitas-saya')}
        >
          📦 Aktivitas Saya
        </button>
      </div>

      {/* HEADER: LOGO DAN TEKS PUTIH */}
      <header style={{ 
        position: 'relative', 
        padding: '12px 16px', 
        background: 'transparent', 
        border: 'none', 
        boxShadow: 'none',
        marginBottom: 8,
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <img 
            src="/logo-ara.png" 
            alt="Lapak Ara Logo" 
            style={{ 
              width: '110px', 
              height: '110px', 
              borderRadius: '50%', 
              objectFit: 'cover',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }} 
          />
        </div>

        <div className="text-white-override">
          <p style={{ 
            fontSize: '15px', 
            fontWeight: '900', 
            fontStyle: 'italic', 
            margin: '6px 0 0 0', 
            textShadow: 'none' 
          }}>
            "Cari yang unik, berani nawar, kalau cocok gaskeun."
          </p>
        </div>
      </header>

      {/* Filter Kategori Interaktif */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '12px 0', paddingBottom: 4 }}>
        {FILTERS.map((f) => {
          const isActive = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={isActive ? 'btn-primary' : 'btn-secondary'}
              style={{
                whiteSpace: 'nowrap',
                fontSize: 13,
                padding: '6px 14px',
                borderRadius: '20px'
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Fitur Iklan / Rekomendasi Mandiri (Foto, Video, Deskripsi, Link) */}
      <div style={{ margin: '16px 0' }}>
        <div className="text-white-override" style={{ marginBottom: 8 }}>
          <h2 style={{ fontSize: 15, fontWeight: '700', margin: 0 }}>Rekomendasi Spesial</h2>
        </div>
        
        {affiliates.map((aff) => (
          <div 
            key={aff.id} 
            className="card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 10, 
              padding: 14, 
              marginBottom: 10, 
              background: '#fdfbf7',
              border: '2px solid #1A1714',
              boxShadow: '4px 4px 0px #1A1714',
              borderRadius: '8px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '4px 8px 0px #1A1714';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '4px 4px 0px #1A1714';
            }}
          >
            
            {/* Media Banner: Video (jika ada) atau Foto */}
            {aff.video_url ? (
              <video 
                src={aff.video_url} 
                controls 
                style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} 
              />
            ) : aff.image_url ? (
              <div style={{ width: '100%', height: 160, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#EEE7DA' }}>
                <img src={aff.image_url} alt={aff.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : null}

            {/* Konten Teks: Judul & Deskripsi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#1A1714' }}>{aff.title}</p>
              {aff.description && (
                <p style={{ fontSize: 13, margin: 0, color: '#1A1714', opacity: 0.85, lineHeight: 1.4 }}>
                  {aff.description}
                </p>
              )}
            </div>

            {/* Tombol Link Tujuan Iklan (Dengan penanganan protokol otomatis agar membuka web eksternal dengan benar) */}
            {aff.affiliate_url && (
              <a 
                href={aff.affiliate_url.startsWith('http') ? aff.affiliate_url : `https://${aff.affiliate_url}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  textAlign: 'center', 
                  padding: '10px 16px', 
                  fontSize: '14px', 
                  textDecoration: 'none', 
                  display: 'block', 
                  marginTop: 4,
                  background: '#f59e0b',
                  color: '#ffffff',
                  border: '2px solid #1A1714',
                  boxShadow: '2px 2px 0px #1A1714',
                  fontWeight: '900',
                  borderRadius: '4px'
                }}
              >
                Cek aja jangan malu-malu
              </a>
            )}
          </div>
        ))}
      </div>

      {loading ? (
        <Loader text="Lagi bongkar kardus Lapak Ara, sebentar ya..." />
      ) : filteredItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '24px', margin: '20px 0' }}>
          <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🥲</span>
          <p style={{ fontWeight: '700', margin: 0, color: '#1A1714' }}>Wah, barangnya belum ada nih!</p>
          <p style={{ fontSize: '12px', marginTop: '4px', color: '#1A1714', opacity: 0.85 }}>Coba pilih kategori filter yang lain ya, bos.</p>
        </div>
      ) : (
        <div className="item-grid">
          {filteredItems.map((item) => (
            <Link key={item.id} to={`/barang/${item.id}`} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ aspectRatio: '1/1', background: '#EEE7DA', position: 'relative' }}>
                {item.photos?.[0] && (
                  <img src={item.photos[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ padding: 10 }}>
                <p style={{ fontSize: 13, margin: '0 0 4px', color: '#000000', fontWeight: '600' }}>{item.name}</p>
                <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#000000' }}>
                  Rp{Number(item.starting_price).toLocaleString('id-ID')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
  </div>
  );
}