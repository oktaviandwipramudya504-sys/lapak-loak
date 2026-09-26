import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

export default function BuyerStoryForm() {
  const { orderCode } = useParams()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!comment.trim()) {
      alert('Tuliskan cerita pengalamanmu dulu ya kak!')
      return
    }

    setLoading(true)
    try {
      // Mengambil nama pembeli dari tabel orders berdasarkan order_code
      const { data: orderData } = await supabase
        .from('orders')
        .select('buyer_name')
        .eq('order_code', orderCode)
        .single()

      const buyerName = orderData?.buyer_name || 'Pembeli Setia'

      // Menyimpan data ke tabel buyer_stories sesuai alur aslimu + buyer_name
      const { error } = await supabase.from('buyer_stories').insert({ 
        order_code: orderCode, 
        buyer_name: buyerName, 
        rating, 
        comment 
      })

      if (error) throw error
      setSent(true)
    } catch (err) {
      console.error('Gagal mengirim ulasan:', err)
      alert('Gagal mengirim cerita, silahkan coba lagi ya.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="app-shell" data-area="buyer" style={{ padding: 16 }}>
        <p>Makasih ceritanya! 🎉</p>
      </div>
    )
  }

  return (
    <div className="app-shell" data-area="buyer" style={{ padding: 16 }}>
      <h1 style={{ fontSize: 16 }}>Bagaimana pengalamanmu?</h1>
      <div style={{ fontSize: 24, margin: '10px 0' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            onClick={() => setRating(n)}
            style={{ cursor: 'pointer', color: n <= rating ? 'var(--amber)' : 'var(--border)' }}
          >
            ★
          </span>
        ))}
      </div>
      <textarea
        placeholder="Ceritakan pengalamanmu..."
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        style={{ marginBottom: 10, width: '100%', padding: 8 }}
      />
      <button className="btn-primary" onClick={submit} disabled={loading}>
        {loading ? 'Mengirim...' : 'Kirim cerita'}
      </button>
    </div>
  )
}