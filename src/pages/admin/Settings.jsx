import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';
import Loader from '../../components/Loader';

// Jantung template: semua yang beda per klien diatur dari sini,
// bukan ditulis manual di kode.
const FIELDS = [
  ['store_name', 'Nama toko'],
  ['tagline', 'Tagline'],
  ['bank_account', 'Rekening bank'],
  ['flat_shipping_rate', 'Ongkir flat (Rp)'],
];

export default function AdminSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      const { data } = await supabase.from('settings').select('*');
      const obj = {};
      (data ?? []).forEach((row) => { obj[row.key] = row.value; });
      setSettings(obj);
      setLoading(false);
    }
    loadSettings();
  }, []);

  async function simpan(key) {
    setSavingKey(key);
    await supabase.from('settings').upsert({ key, value: settings[key] });
    setSavingKey(null);
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/login');
    } else {
      alert('Gagal keluar: ' + error.message);
    }
  }

  return (
    <div>
     <div style={{ 
  background: '#fdfbf7', 
  border: '2px solid #1A1714', 
  boxShadow: '4px 4px 0px #1A1714', 
  padding: '16px 20px', 
  borderRadius: '8px',
  marginBottom: 16,
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center' 
}}>
  <h1 style={{ fontSize: 20, fontWeight: '800', margin: 0, color: '#1A1714', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
    Pengaturan toko
  </h1>
  <button 
    onClick={handleLogout}
    style={{ 
      padding: '8px 14px', 
      fontSize: 12, 
      fontWeight: 'bold', 
      background: '#ff6b6b', 
      color: '#fff', 
      border: '2px solid #1A1714', 
      boxShadow: '2px 2px 0px #1A1714', 
      borderRadius: '4px', 
      cursor: 'pointer' 
    }}
  >
    Logout
  </button>
</div>
      
      {loading ? (
        <Loader text="Lagi ngambil data pengaturan toko..." />
      ) : (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FIELDS.map(([key, label]) => (
            <div key={key}>
              <label style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={settings[key] ?? ''}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                />
                <button 
                  className="btn-secondary" 
                  onClick={() => simpan(key)}
                  disabled={savingKey === key}
                >
                  {savingKey === key ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}