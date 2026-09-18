import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';
import Loader from '../../components/Loader';

const FILTERS = ['Semua', 'Terbaru', 'Sedang Ramai', 'Banyak Ditawar', 'Di bawah 100rb'];

export default function Home() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [lightbox, setLightbox] = useState(null);

  // Helper untuk memastikan URL foto/video valid (mendukung path relatif Supabase atau URL eksternal)
  const getMediaUrl = (url) => {
    if (!url) return '';
    // Jika sudah berupa URL eksternal lengkap (http/https), langsung gunakan
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Jika berupa path di Supabase Storage, ambil public URL-nya
    // Asumsi bucket yang digunakan bernama 'affiliates' atau 'items'. Sesuaikan jika berbeda.
    const { data } = supabase.storage
      .from('affiliates') 
      .getPublicUrl(url);
    
    return data?.publicUrl || url;
  };

  useEffect(() => {
    async function fetchData() {
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('*')
        .neq('status', 'terjual')
        .order('created_at', { ascending: false });
      if (!itemError) setItems(itemData ?? []);

      const { data: affData, error: affError } = await supabase
        .from('affiliates')
        .select('*')
        .order('created_at', { ascending: false });
      if (!affError) {
        setAffiliates(affData ?? []);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredItems = items.filter((item) => {
    if (activeFilter === 'Semua') return true;
    if (activeFilter === 'Terbaru') return item.status === 'tersedia';
    if (activeFilter === 'Sedang Ramai') return item.status === 'tersedia' || item.is_popular;
    if (activeFilter === 'Banyak Ditawar') return item.status === 'ditawar';
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

      {/* Fitur Iklan / Rekomendasi Mandiri */}
      <div style={{ margin: '16px 0' }}>
        <div className="text-white-override" style={{ marginBottom: 8 }}>
          <h2 style={{ fontSize: 15, fontWeight: '700', margin: 0 }}>Rekomendasi Spesial</h2>
        </div>

        {affiliates.map((aff) => {
          let photoList = [];
          try {
            if (Array.isArray(aff.photos) && aff.photos.length > 0) photoList = aff.photos;
            else if (Array.isArray(aff.images) && aff.images.length > 0) photoList = aff.images;
            else if (typeof aff.photos === 'string' && aff.photos) photoList = JSON.parse(aff.photos);
            else if (typeof aff.images === 'string' && aff.images) photoList = JSON.parse(aff.images);
          } catch (e) {
            if (aff.photos) photoList = [aff.photos];
            else if (aff.images) photoList = [aff.images];
          }
          if (photoList.length === 0 && (aff.image_url || aff.image)) {
            photoList = [aff.image_url || aff.image];
          }

          let videoList = [];
          try {
            if (Array.isArray(aff.videos)) videoList = aff.videos;
            else if (typeof aff.videos === 'string') videoList = JSON.parse(aff.videos);
          } catch (e) {
            if (aff.videos) videoList = [aff.videos];
          }
          if (videoList.length === 0 && aff.video_url) {
            videoList = [aff.video_url];
          }

          const mediaList = [
            ...videoList.map((url) => ({ type: 'video', url: getMediaUrl(url) })),
            ...photoList.map((url) => ({ type: 'photo', url: getMediaUrl(url) })),
          ];

          return (
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
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              {/* Carousel Media */}
              {mediaList.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    borderRadius: 'var(--radius-sm)',
                    background: '#000',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  {mediaList.map((media, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightbox(media)}
                      style={{
                        flex: '0 0 100%',
                        scrollSnapAlign: 'start',
                        height: 200,
                        position: 'relative',
                        cursor: 'pointer',
                      }}
                    >
                      {media.type === 'video' ? (
                        <>
                          <video
                            src={media.url}
                            muted
                            playsInline
                            preload="metadata"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 40,
                              color: '#fff',
                              textShadow: '0 2px 6px rgba(0,0,0,0.6)',
                              pointerEvents: 'none',
                            }}
                          >
                            ▶
                          </div>
                        </>
                      ) : (
                        <img
                          src={media.url}
                          alt={`${aff.title} - ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {mediaList.length > 1 && (
                <p style={{ fontSize: 11, textAlign: 'center', margin: 0, color: '#1A1714', opacity: 0.6 }}>
                  Geser untuk lihat {mediaList.length} media &bull; ketuk untuk perbesar
                </p>
              )}

              {/* Konten Teks: Judul & Deskripsi */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <p style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#1A1714' }}>{aff.title}</p>
                {aff.description && (
                  <p style={{ fontSize: 13, margin: 0, color: '#1A1714', opacity: 0.85, lineHeight: 1.4 }}>
                    {aff.description}
                  </p>
                )}
              </div>

              {/* Tombol Link Tujuan Iklan */}
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
                  Cek Link Di Sini
                </a>
              )}
            </div>
          );
        })}
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
                  <img src={getMediaUrl(item.photos[0])} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

      {/* Lightbox: tampilan detail foto/video yang diperbesar */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: 28,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
          {lightbox.type === 'video' ? (
            <video
              src={lightbox.url}
              controls
              autoPlay
              playsInline
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }}
            />
          ) : (
            <img
              src={lightbox.url}
              alt="Detail"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }}
            />
          )}
        </div>
      )}
    </div>
  );
}