import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import Loader from '../../components/Loader';

export default function AdminItems() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', starting_price: '', condition_notes: '' });
  const [photoFiles, setPhotoFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    setLoadingItems(true);
    const { data } = await supabase.from('items').select('*').order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoadingItems(false);
  }

  async function uploadFile(file, folder) {
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '-');
    const path = `${folder}/${Date.now()}-${cleanName}`;
    const { error } = await supabase.storage.from('media').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    return data.publicUrl;
  }

  async function tambahBarang() {
    if (!form.name || !form.starting_price) {
      setErrMsg('Nama dan harga awal wajib diisi.');
      return;
    }
    setUploading(true);
    setErrMsg('');
    try {
      const photoUrls = await Promise.all(photoFiles.map((f) => uploadFile(f, 'photos')));
      const videoUrl = videoFile ? await uploadFile(videoFile, 'videos') : null;

      await supabase.from('items').insert({
        ...form,
        photos: photoUrls,
        video_url: videoUrl,
        status: 'tersedia',
      });

      setForm({ name: '', starting_price: '', condition_notes: '' });
      setPhotoFiles([]);
      setVideoFile(null);
      setShowForm(false);
      loadItems();
    } catch (err) {
      setErrMsg('Gagal upload: ' + err.message + ' (cek bucket "media" sudah dibuat & public)');
    } finally {
      setUploading(false);
    }
  }

  async function hapusBarang(id) {
    if (!window.confirm('Yakin ingin menghapus barang ini dari lapak?')) return;
    
    try {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) throw error;
      loadItems();
    } catch (err) {
      alert('Gagal menghapus barang: ' + err.message);
    }
  }

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
          Adol Opo meneh?
        </h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Tutup Form' : '+ Tambah'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          <input placeholder="Nama barang" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Harga awal" type="number" value={form.starting_price} onChange={(e) => setForm({ ...form, starting_price: e.target.value })} />
          <textarea placeholder="Catatan kondisi (jujur ya)" value={form.condition_notes} onChange={(e) => setForm({ ...form, condition_notes: e.target.value })} />

          <div>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Foto barang (bisa pilih lebih dari 1, atau langsung dari kamera HP)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={(e) => setPhotoFiles(Array.from(e.target.files))}
            />
            {photoFiles.length > 0 && (
              <p style={{ fontSize: 12, color: 'var(--sage)' }}>{photoFiles.length} foto dipilih</p>
            )}
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Video kondisi (opsional)</label>
            <input
              type="file"
              accept="video/*"
              capture="environment"
              onChange={(e) => setVideoFile(e.target.files[0] ?? null)}
            />
            {videoFile && <p style={{ fontSize: 12, color: 'var(--sage)' }}>{videoFile.name}</p>}
          </div>

          {errMsg && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{errMsg}</p>}

          {uploading ? (
            <Loader text="Lagi ngunggah foto & data barang ke lapak..." />
          ) : (
            <button className="btn-primary" onClick={tambahBarang}>
              Simpan Barang
            </button>
          )}
        </div>
      )}

      {loadingItems ? (
        <Loader text="Lagi bongkar kardus inventaris barang..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: '#EEE7DA', overflow: 'hidden', flexShrink: 0 }}>
                {item.photos?.[0] && (
                  <img src={item.photos[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{item.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>Rp{Number(item.starting_price).toLocaleString('id-ID')}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge badge-${item.status}`}>{item.status}</span>
                <button 
                  onClick={() => hapusBarang(item.id)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4 }}
                  title="Hapus barang"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}