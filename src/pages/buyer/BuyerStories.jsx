import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Star, MessageSquare, Send, X, Plus, Package } from 'lucide-react';

export default function BuyerStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newStory, setNewStory] = useState({
    order_code: '',
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('buyer_stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newStory.order_code || !newStory.comment) {
      alert('Kode Pesanan dan Ulasan wajib diisi ya!');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('buyer_stories')
        .insert([newStory]);

      if (error) throw error;

      setNewStory({ order_code: '', rating: 5, comment: '' });
      setShowForm(false);
      fetchStories();
      alert('Ulasan berhasil dikirim!');
    } catch (error) {
      console.error('Error submitting story:', error);
      alert('Gagal: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* KARTU UTAMA DENGAN BACKGROUND PUTIH SOLID DAN BORDER NEO-BRUTALISM */}
      <div className="bg-white text-black rounded-2xl p-6 md:p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center flex-wrap gap-4 pb-6 border-b-4 border-black">
          <div>
            <h1 className="text-2xl md:text-3xl font-black mb-1 tracking-tight text-black">
              CERITA PEMBELI <span className="text-amber-500 underline decoration-black decoration-2"></span>
            </h1>
            <p className="text-gray-700 text-sm md:text-base font-bold">
              Kumpulan ulasan dan pengalaman berbelanja dari para pembeli setia.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#ffde59] hover:bg-[#ffd000] text-black font-black px-5 py-3 rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition flex items-center gap-2 cursor-pointer"
          >
            {showForm ? <X className="w-5 h-5 stroke-[3]" /> : <Plus className="w-5 h-5 stroke-[3]" />}
            {showForm ? 'Tutup Form' : 'Beri Ulasan'}
          </button>
        </div>

        {/* FORM INPUT ULASAN */}
        {showForm && (
          <div className="my-6 p-6 bg-[#fff9db] rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-fadeIn">
            <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-black">
              <MessageSquare className="w-5 h-5 stroke-[3]" />
              TULIS ULASAN KAMU
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-black text-black mb-1">Kode Pesanan / Nama</label>
                <input
                  type="text"
                  value={newStory.order_code}
                  onChange={(e) => setNewStory({ ...newStory, order_code: e.target.value })}
                  placeholder="Contoh: TRILOGY-001 atau Nama Kamu"
                  className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl focus:outline-none text-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-black text-black mb-1">Rating</label>
                <select
                  value={newStory.rating}
                  onChange={(e) => setNewStory({ ...newStory, rating: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl focus:outline-none text-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (Sangat Puas)</option>
                  <option value={4}>⭐⭐⭐⭐ (Puas)</option>
                  <option value={3}>⭐⭐⭐ (Cukup)</option>
                  <option value={2}>⭐⭐ (Kurang)</option>
                  <option value={1}>⭐ (Buruk)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-black mb-1">Ulasan / Komentar</label>
                <textarea
                  rows={4}
                  value={newStory.comment}
                  onChange={(e) => setNewStory({ ...newStory, comment: e.target.value })}
                  placeholder="Ceritakan pengalamanmu berbelanja di sini..."
                  className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl focus:outline-none text-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#ffde59] hover:bg-[#ffd000] text-black font-black py-3 rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-5 h-5 stroke-[3]" />
                {submitting ? 'Menyimpan...' : 'Kirim Ulasan'}
              </button>
            </form>
          </div>
        )}

        {/* DAFTAR ULASAN */}
        <div className="mt-8">
          <h2 className="text-xl font-black text-black mb-6 tracking-tight flex items-center gap-2">
            <span className="w-3 h-3 bg-black inline-block rounded-xs"></span>
            DAFTAR ULASAN PEMBELI
          </h2>
          
          {loading ? (
            <div className="text-center py-12 text-black font-black bg-gray-50 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Memuat ulasan...
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12 text-black font-bold bg-gray-50 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Belum ada ulasan. Jadilah yang pertama memberikan ulasan!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {stories.map((story) => (
                <div 
                  key={story.id} 
                  className="bg-white rounded-xl p-5 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#ffde59] p-2 rounded-lg border-2 border-black">
                        <Package className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Order ID</span>
                        <h3 className="font-black text-base text-black">{story.order_code}</h3>
                      </div>
                    </div>
                    
                    {/* Bintang Rating yang Terisi */}
                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-xl border-2 border-black">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < story.rating 
                              ? 'text-yellow-500 fill-yellow-400 stroke-black stroke-[1]' 
                              : 'text-gray-300 stroke-black stroke-[1]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-black text-base mb-4 whitespace-pre-line leading-relaxed font-semibold bg-gray-50 p-4 rounded-xl border-2 border-black">
                    "{story.comment}"
                  </p>

                  <div className="text-xs text-gray-600 font-bold pt-2 border-t-2 border-dashed border-gray-300 flex justify-between items-center">
                    <span>Dipublikasikan</span>
                    <span>
                      {story.created_at ? new Date(story.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'Baru saja'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}