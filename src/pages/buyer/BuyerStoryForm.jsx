import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

export default function BuyerStoryForm() {
  const { orderCode } = useParams()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)

  async function submit() {
    await supabase.from('buyer_stories').insert({ order_code: orderCode, rating, comment })
    setSent(true)
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
        style={{ marginBottom: 10 }}
      />
      <button className="btn-primary" onClick={submit}>Kirim cerita</button>
    </div>
  )
}
