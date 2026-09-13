import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';
import { APP_CONFIG, getWhatsAppLink } from '../../lib/config';

// Bikin ID pesanan acak & panjang, susah ditebak (bukan angka urut).
function buatOrderCode() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let code = 'ord-';
  for (let i = 0; i < 10; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function Checkout() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    nama: '', 
    whatsapp: '', 
    alamat: '', 
    kecamatan: '', 
    kota: '', 
    kodePos: '', 
    jasaKirim: 'JNE' // Default pilihan jasa pengiriman
  });

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function submitCheckout() {
    if (!form.nama || !form.whatsapp || !form.alamat) {
      alert('Mohon isi nama, nomor WhatsApp, dan alamat dengan lengkap ya!');
      return;
    }

    const orderCode = buatOrderCode();
    // Ongkir diatur manual oleh admin nanti setelah verifikasi berat & alamat
    const flatShipping = 0;

    const { error } = await supabase.from('orders').insert({
      order_code: orderCode,
      item_id: itemId,
      buyer_name: form.nama,
      buyer_whatsapp: form.whatsapp,
      address: `${form.alamat}, ${form.kecamatan}, ${form.kota} ${form.kodePos} (Kurir Pilihan: ${form.jasaKirim})`,
      shipping_cost: flatShipping,
      status: 'dibuat',
    });

    if (error) {
      console.error('Gagal checkout:', error);
      alert('Terjadi kesalahan saat checkout.');
      return;
    }

    // Integrasi instan ke WhatsApp Admin saat checkout dengan info pilihan jasa kirim menggunakan APP_CONFIG
    const pesan = `Halo Admin Lapak Loak, saya ingin konfirmasi pesanan baru (Kode: *${orderCode}*). Nama: ${form.nama}, No WA: ${form.whatsapp}, Jasa Kirim Pilihan: ${form.jasaKirim}. Mohon cek ongkir dan proses pesanan saya ya kak!`;
    const urlWa = getWhatsAppLink(APP_CONFIG.ADMIN_WHATSAPP, pesan);
    window.open(urlWa, '_blank');

    navigate(`/bayar/${orderCode}`);
  }

  return (
    <div className="page" style={{ maxWidth: 500, margin: '20px auto', padding: 16 }}>
      <h1 style={{ fontSize: 18, marginBottom: 16, color: '#fcfbfa', fontWeight: '800' }}>Checkout Pesanan</h1>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#FFF5E6', border: '2px solid #8C755B', padding: 16 }}>
        <input placeholder="Nama Lengkap" value={form.nama} onChange={update('nama')} style={{ padding: 10, borderRadius: 6, border: '1px solid #8C755B', background: '#FFF' }} />
        <input placeholder="Nomor WhatsApp (Contoh: 081234...)" value={form.whatsapp} onChange={update('whatsapp')} style={{ padding: 10, borderRadius: 6, border: '1px solid #8C755B', background: '#FFF' }} />
        <input placeholder="Alamat Jalan / Patokan" value={form.alamat} onChange={update('alamat')} style={{ padding: 10, borderRadius: 6, border: '1px solid #8C755B', background: '#FFF' }} />
        <input placeholder="Kecamatan" value={form.kecamatan} onChange={update('kecamatan')} style={{ padding: 10, borderRadius: 6, border: '1px solid #8C755B', background: '#FFF' }} />
        <input placeholder="Kota/Kabupaten" value={form.kota} onChange={update('kota')} style={{ padding: 10, borderRadius: 6, border: '1px solid #8C755B', background: '#FFF' }} />
        <input placeholder="Kode Pos" value={form.kodePos} onChange={update('kodePos')} style={{ padding: 10, borderRadius: 6, border: '1px solid #8C755B', background: '#FFF' }} />
        
        {/* Pilihan Jasa Pengiriman */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 13, fontWeight: '700', color: '#1A1714' }}>Pilih Jasa Pengiriman:</label>
          <select 
            value={form.jasaKirim} 
            onChange={update('jasaKirim')} 
            style={{ padding: 10, borderRadius: 6, border: '1px solid #8C755B', background: '#FFF', fontSize: 14 }}
          >
            <option value="JNE">JNE</option>
            <option value="J&T">J&T Express</option>
            <option value="SiCepat">SiCepat</option>
            <option value="AnterAja">AnterAja</option>
            <option value="GoSend">GoSend Instant</option>
            <option value="GrabExpress">GrabExpress</option>
          </select>
        </div>

        <button className="btn-primary" onClick={submitCheckout} style={{ marginTop: 6 }}>Lanjut ke pembayaran & Konfirmasi WA</button>
      </div>
    </div>
  );
}