import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import Loader from '../../components/Loader';

export default function AdminItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    starting_price: '',
    description: '',
    status: 'tersedia'
  });
  const [photoFiles, setPhotoFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setItems(data ?? []);
    setLoading(false);
  }

  function updateField(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function uploadPhotos() {
    const urls = [];
    for (let i = 0; i < photoFiles.length; i++) {
      const file = photoFiles[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `item_${Date.now()}_${i}.${fileExt}`;
      const filePath = `images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Gagal upload foto:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.starting_price) {
      alert('Nama barang dan harga awal wajib diisi ya, bos!');
      return;
    }

    setSubmitting(true);
    try {
      let photoUrls = [];
      if (photoFiles.length > 0) {
        photoUrls = await uploadPhotos();
      }

      const { error } = await supabase.from('items').insert({
        name: form.name,
        starting_price: Number(form.starting_price),
        description: form.description,
        status: form.status,
        photos: photoUrls
      });

      if (error) throw error;

      setForm({ name: '', starting_price: '', description: '', status: 'tersedia' });
      setPhotoFiles([]);
      fetchItems();
      alert('Barang baru berhasil ditambahkan ke lapak!');
    } catch (err) {
      console.error('Gagal menyimpan barang:', err);
      alert('Terjadi kesalahan saat menyimpan data atau upload foto.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(id, newStatus) {
    const { error } = await supabase
      .from('items')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
    } else {
      alert('Gagal memperbarui status barang.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus barang ini dari lapak?')) return;

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(items.filter(item => item.id !== id));
      alert('Barang berhasil dihapus!');
    } catch (err) {
      console.error('Gagal menghapus barang:', err);
      alert('Gagal menghapus barang: ' + err.message);
    }
  }

  if (loading) return <div className="page"><Loader text="Memuat daftar barang lapak..." /></div>;

  return (
    <div className="page" style={{ maxWidth: 600, margin: '20px auto', padding: 16 }}>
      <h1 style={{ fontSize: 18, marginBottom: 16, color: '#1A1714', fontWeight: '800' }}>Kelola Barang Lapak 📦</h1>

      {/* Form Tambah Barang */}
      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, padding: 16, background: '#FFF5E6', border: '2px solid #8C755B' }}>
        <h2 style={{ fontSize: 14, fontWeight: '800', margin: 0 }}>Tambah Barang Baru</h2>
        
        <div>
          <label style={{ fontSize: 12, fontWeight: '700', display: 'block', marginBottom: 4 }}>Nama Barang:</label>
          <input 
            placeholder="Contoh: Jaket Vintage Thrift" 
            value={form.name} 
            onChange={updateField('name')} 
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #8C755B', background: '#FFF' }} 
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: '700', display: 'block', marginBottom: 4 }}>Harga Awal (Rp):</label>
          <input 
            type="number"
            placeholder="Contoh: 150000" 
            value={form.starting_price} 
            onChange={updateField('starting_price')} 
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #8C755B', background: '#FFF' }} 
          />
        </div>
        
        <div>
          <label style={{ fontSize: 12, fontWeight: '700', display: 'block', marginBottom: 4 }}>Deskripsi & Detail:</label>
          <textarea 
            placeholder="Kondisi, minus, ukuran, dll..." 
            value={form.description} 
            onChange={updateField('description')} 
            rows={3}
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #8C755B', background: '#FFF', fontFamily: 'inherit' }} 
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: '700', display: 'block', marginBottom: 4 }}>Upload Foto Barang (Bisa banyak):</label>
          <input 
            type="file" 
            accept="image/*"
            multiple
            onChange={(e) => setPhotoFiles(e.target.files)} 
            style={{ width: '100%', padding: 8, background: '#FFF', borderRadius: 6, border: '1px solid #8C755B', fontSize: 12 }} 
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: '700', display: 'block', marginBottom: 4 }}>Status Awal:</label>
          <select 
            value={form.status} 
            onChange={updateField('status')}
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #8C755B', background: '#FFF' }}
          >
            <option value="tersedia">Tersedia</option>
            <option value="ditawar">Lagi Ditawar</option>
            <option value="terjual">Terjual</option>
          </select>
        </div>
        
        <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: 6 }}>
          {submitting ? 'Sedang Mengunggah & Menyimpan...' : 'Simpan Barang ke Lapak'}
        </button>
      </form>

      {/* Daftar Barang & Pengaturan Status */}
      <h2 style={{ fontSize: 15, fontWeight: '800', marginBottom: 10 }}>Daftar Inventaris Barang</h2>
      {items.length === 0 ? (
        <p style={{ fontSize: 12, opacity: 0.7 }}>Belum ada barang di database lapak.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: '#FFF', border: '1px solid #8C755B', borderRadius: 8, gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                {item.photos?.[0] ? (
                  <img src={item.photos[0]} alt={item.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 50, height: 50, background: '#D8C3A5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>No Img</div>
                )}
                <div style={{ overflow: 'hidden' }}>
                  <h3 style={{ fontSize: 13, fontWeight: '700', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{item.name}</h3>
                  <p style={{ fontSize: 12, margin: '2px 0', fontWeight: '600' }}>Rp{Number(item.starting_price).toLocaleString('id-ID')}</p>
                  
                  {/* Dropdown cepat ganti status */}
                  <select 
                    value={item.status} 
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, border: '1px solid #8C755B', background: '#F9F6F0', fontWeight: 'bold' }}
                  >
                    <option value="tersedia">Tersedia</option>
                    <option value="ditawar">Ditawar</option>
                    <option value="terjual">Terjual</option>
                  </select>
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