import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from './Loader';

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    }
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="page"><Loader text="Memeriksa akses admin..." /></div>;
  }

  // Jika belum login, arahkan ke halaman login admin (atau halaman utama jika belum ada rute login khusus)
  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}