import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';
import Loader from '../../components/Loader';

export default function Payment() {
  const { orderCode } = useParams();
  const [whatsappInput, setWhatsappInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [bankAccountInfo, setBankAccountInfo] = useState('BCA 1234567890 a.n. Lapak');

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const map = {};
        data.forEach(item => { map[item.key] = item.value; });
        if (map['bank_account']) setBankAccountInfo(map['bank_account']);
      }
    }
    fetchSettings();
  }, []);

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

    if (whatsappInput.replace(/\D/g, '') === data.buyer_whatsapp.replace(/\D/g, '')) {
      setOrderData(data);
      setIsVerified(true);
      if (['menunggu-verifikasi', 'diverifikasi', 'dikemas', 'dikirim', 'selesai'].includes(data.status)) {
        setUploaded(true);
      }
    } else {
      setErrorMsg('Nomor WhatsApp tidak cocok.');
    }
  }

  async function uploadBukti() {
    if (!file) {
      alert('Pilih foto bukti transfer dari galeri dulu ya!');
      return;
    }
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '-');
    const path = `bukti-transfer/${orderCode}-${Date.now()}-${cleanName}`;
    
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
      alert('Gagal mengupload bukti: ' + error.message);
    }
  }

  if (!isVerified) {
    return (
      <div className="page" style={{ maxWidth: 400, margin: '40px auto', padding: 20 }}>
        <h1>Verifikasi Keamanan</h1>
        <p style={{ fontSize: 13 }}>Masukkan nomor WhatsApp saat checkout:</p>
        <form onSubmit={verifyWhatsApp} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="text"
            placeholder="08123456789"
            value={whatsappInput}
            onChange={(e) => setWhatsappInput(e.target.value)}
            style={{ padding: 10 }}
          />
          {errorMsg && <p style={{ color: 'red', fontSize: 12 }}>{errorMsg}</p>}
          <button type="submit" className="btn-primary" style={{ padding: 10 }}>Verifikasi</button>
        </form>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 500, margin: '20px auto', padding: 16 }}>
      <h1>Pembayaran Pesanan</h1>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <p>Transfer Tujuan: <b>{bankAccountInfo}</b></p>
        <p>Kode Pesanan: <b>{orderCode}</b></p>
        <p>Barang: <b>{orderData.items?.name}</b></p>
        <p>Total Tagihan: <b>Rp{Number(orderData.items?.starting_price || 0).toLocaleString('id-ID')}</b></p>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <label style={{ fontSize: 13, fontWeight: '700' }}>Upload Bukti Transfer (dari Galeri HP):</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setFile(e.target.files?.[0])} 
          style={{ margin: '10px 0', fontSize: 13 }} 
        />
        <button 
          className="btn-primary" 
          style={{ width: '100%', padding: 10 }} 
          onClick={uploadBukti} 
          disabled={uploaded}
        >
          {uploaded ? 'Bukti Terkirim / Menunggu Verifikasi' : 'Kirim Bukti Transfer'}
        </button>
      </div>
    </div>
  );
}