import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Loader from '../../components/Loader'

export default function BuyerStories() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStories() {
      setLoading(true)
      const { data, error } = await supabase
        .from('buyer_stories')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Gagal memuat cerita:', error)
      } else {
        setStories(data ?? [])
      }
      setLoading(false)
    }

    fetchStories()
  }, [])

  if (loading) return <div className="app-shell" data-area="buyer" style={{ padding: 16 }}><Loader text="Memuat cerita..." /></div>

  return (
    <div className="app-shell" data-area="buyer" style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
      <div style={{ 
        background: '#fdfbf7', 
        border: '2px solid #1A1714', 
        boxShadow: '4px 4px 0px #1A1714', 
        padding: '16px 20px', 
        borderRadius: '8px',
        marginBottom: 16 
      }}>
        <h1 style={{ fontSize: 18, fontWeight: '800', margin: 0, color: '#1A1714', textTransform: 'uppercase' }}>
          Cerita Mereka
        </h1>
        <p style={{ fontSize: 13, color: '#1A1714', opacity: 0.8, margin: '4px 0 0' }}>
          Pengalaman nyata dari teman-teman yang sudah berbelanja dan berselancar di Lapak Ara.
        </p>
      </div>

      {stories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', background: '#FFF5E6', border: '2px solid #8C755B', borderRadius: 8 }}>
          <p style={{ fontWeight: '700', color: '#1A1714', margin: 0 }}>Belum ada cerita yang dibagikan.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {stories.map((s) => {
            const dateObj = new Date(s.created_at)
            const formattedDate = dateObj.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })

            return (
              <div key={s.id} style={{ padding: 16, background: '#FFF5E6', border: '1px solid #8C755B', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#1A1714' }}>
                    {s.buyer_name || 'Pembeli Setia'}
                  </span>
                  <span style={{ fontSize: 12, opacity: 0.7, color: '#1A1714' }}>
                    {formattedDate}
                  </span>
                </div>

                <div style={{ color: 'var(--amber)', fontSize: 16, marginBottom: 6 }}>
                  {'★'.repeat(s.rating || 5)}{'☆'.repeat(5 - (s.rating || 5))}
                </div>

                <p style={{ margin: 0, fontSize: 14, color: '#1A1714', lineHeight: 1.4 }}>
                  "{s.comment}"
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}