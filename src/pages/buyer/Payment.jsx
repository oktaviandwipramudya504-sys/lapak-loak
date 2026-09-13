import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';

export default function Payment() {
  const { orderCode } = useParams();
  const [whatsappInput, setWhatsappInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // State rekening disesuaikan dengan key 'bank_account' dari AdminSettings.jsx
  const [bankAccountInfo, setBankAccountInfo] = useState('BCA 1234567890 a.n. Lapak Ara');

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  async function fetchPaymentSettings() {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*');
      
      if (!error && data) {
        const settingsMap = {};
        data.forEach(item => {
          settingsMap[item.key] = item.value;
        });

        if (settingsMap['bank_account']) {
          setBankAccountInfo(settingsMap['bank_account']);
        }
      }
    } catch (err) {
      console.error('Gagal memuat pengaturan rekening:', err);
    }
  }

  async function verifyWhatsApp(e) {
    e.preventDefault();
    setErrorMsg('');

    const { data, error } = await supabase
      .from('orders')
      .select('*, items(starting_price, name)')
      .eq('order_code', orderCode)
      .single();

    if (error || !data) {
      setErrorMsg('Pesanan tidak ditemukan.');
      return;
    }

    const cleanInput = whatsappInput.replace(/\D/g, '');
    const cleanDb = data.buyer_whatsapp.replace(/\D/g, '');

    if (cleanInput === cleanDb) {
      setOrderData(data);
      setIsVerified(true);
      if (['menunggu-verifikasi', 'diverifikasi', 'dikemas', 'dikirim', 'selesai'].includes(data.status)) {
        setUploaded(true);
      }
    } else {
      setErrorMsg('Nomor WhatsApp tidak cocok dengan data pesanan ini.');
    }
  }

  async function uploadBukti() {
    if (!file) return;
    const path = `bukti-transfer/${orderCode}-${file.name}`;
    const { error } = await supabase.storage.from('media').upload(path, file);
    if (!error) {
      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(path);
      const publicUrl = publicUrlData?.publicUrl || '';

      await supabase.from('orders').update({ 
        status: 'menunggu-verifikasi',
        payment_proof_url: publicUrl 
      }).eq('order_code', orderCode);
      
      setUploaded(true);
      alert('Bukti transfer berhasil dikirim! Menunggu verifikasi admin.');
    } else {
      alert('Gagal mengupload bukti transfer.');
    }
  }

  if (!isVerified) {
    return (
      <div className="page" style={{ maxWidth: 400, margin: '40px auto', padding: 20 }}>
        <h1 style={{ fontSize: 18, marginBottom: 8, color: 'var(--text-main, #fefdfc)' }}>Verifikasi Keamanan</h1>
        <p style={{ fontSize: 13, color: 'var(--muted, #7c6f68)', marginBottom: 16 }}>
          Masukkan nomor WhatsApp yang kamu gunakan saat checkout untuk melihat detail pembayaran.
        </p>
        <form onSubmit={verifyWhatsApp} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="text"
            placeholder="Contoh: 08123456789"
            value={whatsappInput}
            onChange={(e) => setWhatsappInput(e.target.value)}
            style={{ padding: 10, borderRadius: 6, border: '1px solid #d5ccc2' }}
          />
          {errorMsg && <p style={{ fontSize: 12, color: '#b33939' }}>{errorMsg}</p>}
          <button type="submit" className="btn-primary" style={{ padding: 10 }}>Verifikasi & Lanjut</button>
        </form>
      </div>
    );
  }

  const hargaBarang = Number(orderData.items?.starting_price || 0);
  const biayaOngkir = Number(orderData.shipping_cost || 0);
  const totalTagihan = hargaBarang + biayaOngkir;

  return (
    <div className="page" style={{ maxWidth: 500, margin: '20px auto', padding: 16 }}>
      <h1 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text-main)' }}>Pembayaran Pesanan</h1>
      
      <div className="card" style={{ background: '#fdfbf7', border: '1px solid #e6decb', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Transfer Tujuan:</p>
        <p style={{ fontWeight: 600, fontSize: 15, margin: '4px 0 12px 0' }}>
          {bankAccountInfo}
        </p>
        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '8px 0' }} />
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0' }}>Kode Pesanan: <b>{orderCode}</b></p>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0' }}>Status Pesanan: <span style={{ fontWeight: 'bold', textTransform: 'capitalize', color: 'var(--terracotta)' }}>{orderData.status || 'Baru'}</span></p>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0' }}>Barang: <b>{orderData.items?.name || '-'}</b></p>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0' }}>Alamat & Pengiriman: <b>{orderData.address || '-'}</b></p>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0' }}>Harga Barang: <b>Rp{hargaBarang.toLocaleString('id-ID')}</b></p>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0' }}>Ongkos Kirim: <b>Rp{biayaOngkir.toLocaleString('id-ID')}</b></p>
        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '8px 0' }} />
        <p style={{ fontSize: 14, color: 'var(--text-main)', margin: '4px 0', fontWeight: 'bold' }}>
          Total Tagihan: <span style={{ color: 'var(--terracotta)' }}>Rp{totalTagihan.toLocaleString('id-ID')}</span>
        </p>
      </div>

      <div className="card" style={{ background: '#fdfbf7', border: '1px solid #e6decb', padding: 16, borderRadius: 8 }}>
        <p style={{ fontSize: 13, fontWeight: 500, marginTop: 0 }}>Upload bukti transfer:</p>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} style={{ marginBottom: 10 }} />
        <button 
          className="btn-primary" 
          style={{ width: '100%', padding: 10, opacity: uploaded ? 0.7 : 1 }} 
          onClick={uploadBukti} 
          disabled={uploaded}
        >
          {uploaded ? 'Bukti terkirim / Pesanan diproses' : 'Kirim bukti'}
        </button>
      </div>
    </div>
  );
}