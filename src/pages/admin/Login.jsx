import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';
import Loader from '../../components/Loader';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function login(e) {
    if (e) e.preventDefault();
    setErrMsg('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setErrMsg('Email atau kata sandi salah.');
      setLoading(false);
    } else {
      localStorage.setItem('lapak_admin_session', '1');
      navigate('/admin');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--ink)' }}>Lapak Ara</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Masukin dulu bos 👉🏻👌🏻</p>
        </div>

        {loading ? (
          <Loader text="Lagi ngecek izin masuk, sebentar ya..." />
        ) : (
          <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Email</label>
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 14, background: '#fff' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Kata sandi</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 14, background: '#fff' }}
              />
            </div>

            {errMsg && (
              <div style={{ fontSize: 12, color: 'var(--danger)', background: '#FDE8E0', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                {errMsg}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: 8 }}
            >
              Awww Masuk
            </button>
          </form>
        )}
      </div>
    </div>
  );
}