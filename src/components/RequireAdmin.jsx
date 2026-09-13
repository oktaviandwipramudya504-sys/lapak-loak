import { Navigate } from 'react-router-dom'

// Kerangka sederhana. Ganti pengecekan ini dengan Supabase Auth
// (supabase.auth.getSession()) begitu login admin sungguhan dipasang.
export default function RequireAdmin({ children }) {
  const isLoggedIn = Boolean(localStorage.getItem('lapak_admin_session'))

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}
