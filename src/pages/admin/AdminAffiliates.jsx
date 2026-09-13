import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import Loader from '../../components/Loader';

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    affiliate_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAffiliates();
  }, []);

  async function fetchAffiliates() {
    setLoading(true);
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setAffiliates(data ?? []);
    setLoading(false);
  }

  function updateField(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function uploadFileToStorage(file, folder) {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Menggunakan bucket 'media' sesuai yang sudah kamu buat di Supabase
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Gagal upload file:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage.from('media').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.affiliate_url) {
      alert('Nama produk dan Link Tujuan (URL) wajib diisi ya, bos!');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadFileToStorage(imageFile, 'images');
      }

      let videoUrl = null;
      if (videoFile) {
        videoUrl = await uploadFileToStorage(videoFile, 'videos');
      }

      const { error } = await supabase.from('affiliates').insert({
        title: form.title,
        description: form.description,
        image_url: imageUrl,
        video_url: videoUrl,
        affiliate_url: form.affiliate_url,
      });

      if (error) throw error;

      setForm({ title: '', description: '', affiliate_url: '' });
      setImageFile(null);
      setVideoFile(null);
      fetchAffiliates();
      alert('Iklan rekomendasi berhasil ditayangkan!');
    } catch (err) {
      console.error('Gagal menyimpan:', err);
      alert('Terjadi kesalahan saat menyimpan data atau upload file.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus rekomendasi ini?')) return;
    
    const { error } = await supabase.from('affiliates').delete().eq('id', id);
    if (!error) {
      setAffiliates(affiliates.filter(item => item.id !== id));
    } else {
      alert('Gagal menghapus data.');
    }
  }

  if (loading) return <div className="page"><Loader text="Memuat data rekomendasi..." /></div>;

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
      Iklan Saksenengku! 🏷️
    </h1>
  </div>

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, padding: 16, background: '#FFF5E6', border: '2px solid #8C755B' }}>
        <h2 style={{ fontSize: 14, fontWeight: '800', margin: 0 }}>Buat Rekomendasi Baru</h2>
        
        <div>
          <label style={{ fontSize: 12, fontWeight: '700', display: 'block', marginBottom: 4 }}>Nama Produk / Judul Iklan:</label>
          <input 
            placeholder="Contoh: Outfit Estetik Partner" 
            value={form.title} 
            onChange={updateField('title')} 
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #8C755B', background: '#FFF' }} 
          />
        </div>
        
        <div>
          <label style={{ fontSize: 12, fontWeight: '700', display: 'block', marginBottom: 4 }}>Deskripsi Singkat:</label>
          <textarea 
            placeholder="Tulis deskripsi menarik di sini..." 
            value={form.description} 
            onChange={updateField('description')} 
            rows={3}
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #8C755B', background: '#FFF', fontFamily: 'inherit' }} 
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: '700', display: 'block', marginBottom: 4 }}>Upload Foto (Dari Galeri HP):</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])} 
            style={{ width: '100%', padding: 8, background: '#FFF', borderRadius: 6, border: '1px solid #8C755B', fontSize: 12 }} 
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: '700', display: 'block', marginBottom: 4 }}>Upload Video (Opsional, dari HP):</label>
          <input 
            type="file" 
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])} 
            style={{ width: '100%', padding: 8, background: '#FFF', borderRadius: 6, border: '1px solid #8C755B', fontSize: 12 }} 
          />
        </div>
        
        <div>
          <label style={{ fontSize: 12, fontWeight: '700', display: 'block', marginBottom: 4 }}>Link Tujuan (URL Website / Shopee / dll):</label>
          <input 
            placeholder="https://..." 
            value={form.affiliate_url} 
            onChange={updateField('affiliate_url')} 
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #8C755B', background: '#FFF' }} 
          />
        </div>
        
        <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: 6 }}>
          {submitting ? 'Sedang Mengunggah & Menyimpan...' : 'Simpan & Tayangkan Iklan'}
        </button>
      </form>

     <div style={{ 
  background: '#fdfbf7', 
  border: '2px solid #1A1714', 
  boxShadow: '4px 4px 0px #1A1714', 
  padding: '16px 20px', 
  borderRadius: '8px',
  marginBottom: 16 
}}>
  <h2 style={{ fontSize: 16, fontWeight: '800', margin: 0, color: '#1A1714', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
    Iklanku Saiki Iki
  </h2>
</div>
      {affiliates.length === 0 ? (
        <p style={{ fontSize: 12, opacity: 0.7 }}>Belum ada rekomendasi yang dibuat admin.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {affiliates.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: '#FFF', border: '1px solid #8C755B', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }} />
                ) : (
                  <div style={{ width: 50, height: 50, background: '#D8C3A5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>No Img</div>
                )}
                <div style={{ overflow: 'hidden' }}>
                  <h3 style={{ fontSize: 13, fontWeight: '700', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{item.title}</h3>
                  <a href={item.affiliate_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#0066cc', textDecoration: 'underline' }}>
                    Link: {item.affiliate_url}
                  </a>
                </div>
              </div>
              <button onClick={() => handleDelete(item.id)} style={{ background: '#d9534f', color: '#FFF', border: 'none', padding: '6px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}