import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import Loader from '../../components/Loader';

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', affiliate_url: '', description: '' });
  const [photoFiles, setPhotoFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => { loadAffiliates(); }, []);

  async function loadAffiliates() {
    setLoading(true);
    const { data, error } = await supabase.from('affiliates').select('*').order('created_at', { ascending: false });
    if (error) {
      setErrMsg('Gagal memuat data: ' + error.message);
    }
    setAffiliates(data ?? []);
    setLoading(false);
  }

  async function uploadFile(file, folder) {
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '-');
    const path = `${folder}/${Date.now()}-${cleanName}`;
    const { error } = await supabase.storage.from('media').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    return data.publicUrl;
  }

  async function tambahAffiliate() {
    if (!form.title || !form.affiliate_url) {
      setErrMsg('Judul dan Link Affiliate wajib diisi.');
      return;
    }
    setUploading(true);
    setErrMsg('');
    try {
      const photoUrls = await Promise.all(photoFiles.map((f) => uploadFile(f, 'affiliate_photos')));
      const videoUrls = await Promise.all(videoFiles.map((f) => uploadFile(f, 'affiliate_videos')));

      const { error } = await supabase.from('affiliates').insert({
        ...form,
        photos: photoUrls,
        videos: videoUrls,
      });

      if (error) throw error;

      setForm({ title: '', affiliate_url: '', description: '' });
      setPhotoFiles([]);
      setVideoFiles([]);
      setShowForm(false);
      loadAffiliates();
    } catch (err) {
      setErrMsg('Gagal menyimpan: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function hapusAffiliate(id) {
    if (!window.confirm('Yakin mau hapus affiliate ini?')) return;
    const { error } = await supabase.from('affiliates').delete().eq('id', id);
    if (error) {
      setErrMsg('Gagal menghapus: ' + error.message);
      return;
    }
    loadAffiliates();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ background: '#fdfbf7', border: '2px solid #1A1714', padding: '16px 20px' }}>
        <h1 style={{ fontSize: 20, fontWeight: '800', margin: 0 }}>Kelola Affiliate</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ marginTop: 10 }}>
          {showForm ? 'Tutup Form' : '+ Tambah Affiliate'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input placeholder="Nama Barang" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Link Affiliate URL" value={form.affiliate_url} onChange={(e) => setForm({ ...form, affiliate_url: e.target.value })} />
          <textarea placeholder="Deskripsi produk" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <div>
            <label style={{ fontSize: 12 }}>Foto Produk (Bisa pilih banyak dari galeri)</label>
            <input type="file" multiple accept="image/*" onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))} />
          </div>

          <div>
            <label style={{ fontSize: 12 }}>Video Produk (Bisa pilih banyak dari galeri)</label>
            <input type="file" multiple accept="video/*" onChange={(e) => setVideoFiles(Array.from(e.target.files || []))} />
          </div>

          {errMsg && <p style={{ color: 'red', fontSize: 13 }}>{errMsg}</p>}
          {uploading ? <Loader text="Mengunggah..."/> : <button className="btn-primary" onClick={tambahAffiliate}>Simpan Affiliate</button>}
        </div>
      )}

      {loading ? (
        <Loader text="Memuat..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {affiliates.length === 0 && (
            <p style={{ fontSize: 13, opacity: 0.7 }}>Belum ada affiliate.</p>
          )}
          {affiliates.map((aff) => {
            const thumb = aff.photos?.[0] || aff.image_url || aff.image || null;
            return (
              <div key={aff.id} className="card" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 56, height: 56, borderRadius: 6, overflow: 'hidden', background: '#EEE7DA', flexShrink: 0 }}>
                  {thumb ? (
                    <img src={thumb} alt={aff.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#999' }}>
                      No Foto
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, margin: 0 }}>{aff.title}</p>
                  <p style={{ fontSize: 12, opacity: 0.7, margin: '4px 0 0' }}>
                    {aff.photos?.length ?? 0} foto &bull; {aff.videos?.length ?? 0} video
                  </p>
                </div>
                <button
                  onClick={() => hapusAffiliate(aff.id)}
                  style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}
                >
                  Hapus
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}