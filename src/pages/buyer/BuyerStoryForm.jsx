import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { MessageSquare, Send } from 'lucide-react'

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
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-[#fcf7ee] rounded-2xl shadow-xl p-8 text-center border-2 border-[#b58b53]">
          <p className="text-xl font-bold text-gray-900">Makasih ceritanya! 🎉</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="bg-[#fcf7ee] rounded-2xl shadow-xl p-6 border-2 border-[#b58b53]">
        <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#8b4513]" />
          Bagaimana pengalamanmu?
        </h1>
        
        <div className="text-2xl mb-4 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              onClick={() => setRating(n)}
              style={{ cursor: 'pointer', color: n <= rating ? '#eab308' : '#d1d5db' }}
              className="text-2xl transition hover:scale-110"
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
          className="w-full px-3 py-2 bg-white border border-[#b58b53] rounded-md focus:ring-2 focus:ring-[#8b4513] focus:outline-none text-gray-800 mb-4"
        />

        <button 
          onClick={submit} 
          disabled={loading}
          className="w-full bg-[#a04010] hover:bg-[#8b350d] text-white font-semibold py-2.5 rounded-lg shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 border border-[#7a2e0a]"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Mengirim...' : 'Kirim cerita'}
        </button>
      </div>
    </div>
  )
}