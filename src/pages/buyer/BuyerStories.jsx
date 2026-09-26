import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Star, MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BuyerStories() {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [buyerName, setBuyerName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('buyer_stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (err) {
      console.error('Gagal memuat cerita:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    try {
      const { error } = await supabase.from('buyer_stories').insert([
        {
          order_code: 'PUBLIK-' + Date.now().toString().slice(-6),
          buyer_name: buyerName.trim() || 'Pengunjung Setia',
          rating: rating,
          comment: comment.trim() || 'Memberikan rating bintang ' + rating + ' tanpa ulasan teks.'
        }
      ]);

      if (error) throw error;

      setSuccessMsg('Terima kasih! Cerita atau rating kamu berhasil dibagikan.');
      setBuyerName('');
      setComment('');
      setRating(5);
      fetchStories();
    } catch (err) {
      alert('Gagal mengirim ulasan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Hitung rata-rata rating dan total ulasan
  const totalReviews = stories.length;
  const averageRating = totalReviews > 0 
    ? (stories.reduce((acc, curr) => acc + (curr.rating || 5), 0) / totalReviews).toFixed(1) 
    : '5.0';

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Tombol Kembali & Header */}
        <div className="mb-6 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-stone-400 hover:text-stone-100 transition-colors bg-stone-800/60 px-4 py-2 rounded-xl border border-stone-700 text-sm"
          >
            <ArrowLeft size={18} /> Kembali
          </button>
        </div>

        {/* Banner Header */}
        <div className="bg-gradient-to-r from-stone-800 to-stone-800/60 border border-stone-700/80 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-100 mb-2">
                Cerita & Ulasan Pengunjung
              </h1>
              <p className="text-stone-400 text-sm sm:text-base max-w-xl">
                Bagikan pengalaman, ulasan, atau rating kamu setelah berselancar dan berbelanja di Lapak Ara. Pendapatmu sangat berharga bagi kami!
              </p>
            </div>

            {/* Statistik Ringkas Rating */}
            <div className="bg-stone-900/80 border border-stone-700 rounded-2xl p-4 flex items-center gap-4 min-w-[180px] justify-center shadow-inner">
              <div className="text-center">
                <div className="text-3xl font-black text-amber-400">{averageRating}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={`${i < Math.round(Number(averageRating)) ? 'text-amber-400 fill-amber-400' : 'text-stone-600'}`} 
                    />
                  ))}
                </div>
                <div className="text-xs text-stone-400 mt-1">{totalReviews} Ulasan Publik</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Tulis Cerita / Beri Rating Cepat */}
        <div className="bg-stone-800/80 border border-stone-700/80 rounded-2xl p-6 sm:p-8 mb-10 shadow-lg">
          <h2 className="text-lg font-semibold text-stone-200 mb-4 flex items-center gap-2">
            <MessageSquare size={20} className="text-amber-400" /> Tulis Cerita atau Beri Rating Kamu
          </h2>

          {successMsg && (
            <div className="mb-4 p-4 bg-emerald-900/40 border border-emerald-700 text-emerald-300 rounded-xl text-sm">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1 uppercase tracking-wider">Nama Kamu (Opsional)</label>
                <input 
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1 uppercase tracking-wider">Beri Rating Bintang</label>
                <div className="flex items-center gap-1.5 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className="focus:outline-none transition-transform hover:scale-110"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star
                        size={26}
                        className={`${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-stone-600'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-semibold text-amber-400">({rating}/5)</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1 uppercase tracking-wider">Cerita / Komentar (Opsional jika hanya ingin beri rating)</label>
              <textarea 
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Bagaimana pengalamanmu mengunjungi web ini? (Boleh dikosongkan jika hanya ingin mengirim rating bintang)"
                className="w-full bg-stone-900 border border-stone-700 rounded-xl p-4 text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Send size={16} /> {submitting ? 'Mengirim...' : 'Kirim Ulasan / Rating'}
            </button>
          </form>
        </div>

        {/* Daftar Cerita & Ulasan */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-stone-200 mb-4">Semua Ulasan Pengunjung</h3>

          {loading ? (
            <div className="text-center py-12 text-stone-500">Memuat cerita...</div>
          ) : stories.length === 0 ? (
            <div className="bg-stone-800/40 border border-stone-700/60 rounded-2xl p-12 text-center">
              <MessageSquare size={48} className="mx-auto text-stone-600 mb-3" />
              <p className="text-stone-400 font-medium">Belum ada cerita atau rating yang dibagikan.</p>
              <p className="text-stone-500 text-sm mt-1">Jadilah yang pertama memberikan ulasan di web ini!</p>
            </div>
          ) : (
            stories.map((story) => (
              <div 
                key={story.id} 
                className="bg-stone-800/60 border border-stone-700/80 rounded-2xl p-5 sm:p-6 shadow-md hover:border-stone-600 transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-400 text-sm">
                      {story.buyer_name ? story.buyer_name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-200 text-sm sm:text-base">
                        {story.buyer_name || 'Pengunjung Publik'}
                      </h4>
                      <span className="text-xs text-stone-500">
                        {new Date(story.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-stone-900/60 px-3 py-1.5 rounded-full border border-stone-700/60">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={`${
                          i < (story.rating || 5)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-stone-600'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-amber-400 ml-1.5">{story.rating || 5}/5</span>
                  </div>
                </div>

                <p className="text-stone-300 text-sm sm:text-base leading-relaxed pl-13 sm:pl-0">
                  {story.comment}
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}