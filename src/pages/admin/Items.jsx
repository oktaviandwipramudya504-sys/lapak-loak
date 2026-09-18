import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import Loader from '../../components/Loader';

export default function AdminItems() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', starting_price: '', condition_notes: '' });
  const [photoFiles, setPhotoFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    setLoadingItems(true);
    // Ambil data items beserta data negotiations untuk mendeteksi apakah barang sedang ditawar/nego
    const { data: itemData } = await supabase.from('items').select('*').order('created_at', { ascending: false });
    const { data: negoData } = await supabase.from('negotiations').select('*');

    // Gabungkan informasi status nego ke item jika ada negosiasi aktif/berlangsung
    const merged = (itemData ?? []).map((item) => {
      const activeNego = (negoData ?? []).find(
        (n) => n.item_id === item.id && n.status === 'aktif'
      );
      return {
        ...item,
        isNegotiating: !!activeNego,
      };
    });

    setItems(merged);
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
      const videoUrls = await Promise.all(videoFiles.map((f) => uploadFile(f, 'videos')));

      await supabase.from('items').insert({
        ...form,
        photos: photoUrls,
        videos: videoUrls,
        status: 'tersedia',
      });

      setForm({ name: '', starting_price: '', condition_notes: '' });
      setPhotoFiles([]);
      setVideoFiles([]);
      setShowForm(false);
      loadItems();
    } catch (err) {
      setErrMsg('Gagal upload: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function hapusBarang(id) {
    if (!window.confirm('Yakin ingin menghapus barang ini?')) return;
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (!error) {
      loadItems();
    } else {
      alert('Gagal menghapus: ' + error.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ background: '#fdfbf7', border: '2px solid #1A1714', padding: '16px 20px' }}>
        <h1 style={{ fontSize: 20, fontWeight: '800', margin: 0 }}>Kelola Barang</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ marginTop: 10 }}>
          {showForm ? 'Tutup Form' : '+ Tambah Barang'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input placeholder="Nama barang" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Harga awal" type="number" value={form.starting_price} onChange={(e) => setForm({ ...form, starting_price: e.target.value })} />
          <textarea placeholder="Catatan kondisi" value={form.condition_notes} onChange={(e) => setForm({ ...form, condition_notes: e.target.value })} />

          <div>
            <label style={{ fontSize: 12 }}>Foto Barang (Bisa pilih banyak dari galeri)</label>
            <input type="file" multiple accept="image/*" onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))} />
          </div>

          <div>
            <label style={{ fontSize: 12 }}>Video Kondisi (Bisa pilih banyak dari galeri)</label>
            <input type="file" multiple accept="video/*" onChange={(e) => setVideoFiles(Array.from(e.target.files || []))} />
          </div>

          {errMsg && <p style={{ color: 'red', fontSize: 13 }}>{errMsg}</p>}
          {uploading ? <Loader text="Mengunggah..." /> : <button className="btn-primary" onClick={tambahBarang}>Simpan Barang</button>}
        </div>
      )}

      {/* Menampilkan daftar barang di POV Admin */}
      {loadingItems ? (
        <Loader text="Memuat daftar barang..." />
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>Belum ada barang.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item) => {
            const isTerjual = item.status === 'terjual';
            const isNego = item.isNegotiating;

            return (
              <div 
                key={item.id} 
                className="card" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  padding: 10,
                  background: isTerjual ? '#f3f4f6' : '#fdfbf7'
                }}
              >
                {item.photos?.[0] && (
                  <img src={item.photos[0]} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{item.name}</p>
                  <p style={{ fontSize: 13, margin: '2px 0 0' }}>Rp{Number(item.starting_price).toLocaleString('id-ID')}</p>
                  
                  {/* Status otomatis pada informasi barang */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                    {isTerjual ? (
                      <span style={{ fontSize: 11, background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 'bold' }}>
                        Terjual
                      </span>
                    ) : isNego ? (
                      <span style={{ fontSize: 11, background: '#f59e0b', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 'bold' }}>
                        Amankan
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>Status: {item.status}</span>
                    )}
                  </div>
                </div>

                {/* Tombol Hapus di sebelah kanan */}
                <button
                  onClick={() => hapusBarang(item.id)}
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: 12,
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
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