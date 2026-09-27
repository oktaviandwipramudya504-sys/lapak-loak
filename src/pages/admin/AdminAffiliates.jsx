import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import Loader from '../../components/Loader';

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'affiliate',
    affiliate_url: '',
    wa_number: '',
    wa_message: '',
    description: '',
  });
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

  function resetForm() {
    setForm({ title: '', type: 'affiliate', affiliate_url: '', wa_number: '', wa_message: '', description: '' });
    setPhotoFiles([]);
    setVideoFiles([]);
  }

  async function tambahAffiliate() {
    if (!form.title) {
      setErrMsg('Judul wajib diisi.');
      return;
    }
    if (form.type === 'affiliate' && !form.affiliate_url) {
      setErrMsg('Link Affiliate wajib diisi untuk tipe Affiliate.');
      return;
    }
    if (form.type === 'request' && !form.wa_number) {
      setErrMsg('Nomor WhatsApp wajib diisi untuk tipe Request Barang.');
      return;
    }

    setUploading(true);
    setErrMsg('');
    try {
      const photoUrls = await Promise.all(photoFiles.map((f) => uploadFile(f, 'affiliate_photos')));
      const videoUrls = await Promise.all(videoFiles.map((f) => uploadFile(f, 'affiliate_videos')));

      // Bersihkan nomor WA: hanya angka, ganti awalan 0 jadi 62
      const cleanWaNumber = form.wa_number
        ? form.wa_number.replace(/\D/g, '').replace(/^0/, '62')
        : null;

      const { error } = await supabase.from('affiliates').insert({
        title: form.title,
        description: form.description,
        type: form.type,
        affiliate_url: form.type === 'affiliate' ? form.affiliate_url : null,
        wa_number: form.type === 'request' ? cleanWaNumber : null,
        wa_message: form.type === 'request' ? form.wa_message : null,
        photos: photoUrls,
        videos: videoUrls,
      });

      if (error) throw error;

      resetForm();
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

          <div style={{ display: 'flex', gap: 8 }}>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="radio"
                name="type"
                checked={form.type === 'affiliate'}
                onChange={() => setForm({ ...form, type: 'affiliate' })}
              />
              Affiliate (link keluar)
            </label>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="radio"
                name="type"
                checked={form.type === 'request'}
                onChange={() => setForm({ ...form, type: 'request' })}
              />
              Request Barang (klik → WA)
            </label>
          </div>

          {form.type === 'affiliate' ? (
            <input
              placeholder="Link Affiliate URL"
              value={form.affiliate_url}
              onChange={(e) => setForm({ ...form, affiliate_url: e.target.value })}
            />
          ) : (
            <>
              <input
                placeholder="Nomor WhatsApp (contoh: 081234567890)"
                value={form.wa_number}
                onChange={(e) => setForm({ ...form, wa_number: e.target.value })}
              />
              <input
                placeholder="Pesan default (opsional, kosongkan untuk otomatis)"
                value={form.wa_message}
                onChange={(e) => setForm({ ...form, wa_message: e.target.value })}
              />
            </>
          )}

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
                    <span style={{
                      display: 'inline-block',
                      padding: '1px 6px',
                      borderRadius: 4,
                      fontSize: 11,
                      marginRight: 6,
                      background: aff.type === 'request' ? '#DCFCE7' : '#E0E7FF',
                      color: aff.type === 'request' ? '#166534' : '#3730A3',
                    }}>
                      {aff.type === 'request' ? 'Request → WA' : 'Affiliate'}
                    </span>
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