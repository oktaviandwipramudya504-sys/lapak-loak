import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Star, MessageSquare, Send, X, Plus } from 'lucide-react';

export default function BuyerStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newStory, setNewStory] = useState({
    name: '',
    item_bought: '',
    rating: 5,
    story: ''
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
    if (!newStory.name || !newStory.story) {
      alert('Nama dan ulasan wajib diisi ya!');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('buyer_stories')
        .insert([newStory]);

      if (error) throw error;

      setNewStory({
        name: '',
        item_bought: '',
        rating: 5,
        story: ''
      });
      setShowForm(false);
      fetchStories();
    } catch (error) {
      console.error('Error submitting story:', error.message);
      alert('Gagal mengirim ulasan, silahkan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Card - Gaya Neo Brutalism */}
      <div className="bg-white text-gray-900 rounded-xl p-6 mb-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black mb-1 tracking-tight">CERITA PEMBELI (BUYER STORIES)</h1>
          <p className="text-gray-700 text-sm font-medium">Kumpulan ulasan dan pengalaman berbelanja dari para pembeli.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#ffde59] hover:bg-[#ffd000] text-black font-bold px-5 py-2.5 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center gap-2"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Tutup Form' : 'Beri Ulasan'}
        </button>
      </div>

      {/* Form Input Ulasan Card - Gaya Neo Brutalism */}
      {showForm && (
        <div className="bg-white text-gray-900 rounded-xl p-6 mb-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-black" />
            TULIS ULASAN KAMU
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Nama</label>
              <input
                type="text"
                value={newStory.name}
                onChange={(e) => setNewStory({ ...newStory, name: e.target.value })}
                placeholder="Nama kamu"
                className="w-full px-3 py-2 bg-gray-50 border-2 border-black rounded-lg focus:outline-none focus:ring-0 text-black font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Barang yang Dibeli (Opsional)</label>
              <input
                type="text"
                value={newStory.item_bought}
                onChange={(e) => setNewStory({ ...newStory, item_bought: e.target.value })}
                placeholder="Contoh: Barang loak"
                className="w-full px-3 py-2 bg-gray-50 border-2 border-black rounded-lg focus:outline-none focus:ring-0 text-black font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Rating</label>
              <select
                value={newStory.rating}
                onChange={(e) => setNewStory({ ...newStory, rating: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 border-2 border-black rounded-lg focus:outline-none focus:ring-0 text-black font-medium"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (Sangat Puas)</option>
                <option value={4}>⭐⭐⭐⭐ (Puas)</option>
                <option value={3}>⭐⭐⭐ (Cukup)</option>
                <option value={2}>⭐⭐ (Kurang)</option>
                <option value={1}>⭐ (Buruk)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Ulasan / Cerita</label>
              <textarea
                rows={4}
                value={newStory.story}
                onChange={(e) => setNewStory({ ...newStory, story: e.target.value })}
                placeholder="Ceritakan pengalamanmu..."
                className="w-full px-3 py-2 bg-gray-50 border-2 border-black rounded-lg focus:outline-none focus:ring-0 text-black font-medium"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#ffde59] hover:bg-[#ffd000] text-black font-bold py-2.5 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Menyimpan...' : 'Simpan Ulasan'}
            </button>
          </form>
        </div>
      )}

      {/* Daftar Ulasan Cards - Gaya Neo Brutalism */}
      <h2 className="text-xl font-black text-white mb-4 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">ULASAN PEMBELI</h2>
      {loading ? (
        <div className="text-center py-12 text-gray-900 bg-white rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold">Memuat ulasan...</div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12 text-gray-900 bg-white rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold">
          Belum ada ulasan. Jadilah yang pertama memberikan ulasan!
        </div>
      ) : (
        <div className="space-y-6">
          {stories.map((story) => (
            <div key={story.id} className="bg-white text-gray-900 rounded-xl p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-black text-lg text-black">{story.name || story.buyer_name}</h3>
                  {story.item_bought && (
                    <span className="inline-block mt-1 bg-yellow-100 text-black text-xs font-bold px-2.5 py-1 rounded border-2 border-black">
                      Membeli: {story.item_bought}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-lg border-2 border-black">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < story.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-800 mb-4 whitespace-pre-line leading-relaxed font-medium">{story.story || story.comment}</p>
              <div className="text-xs text-gray-600 font-bold pt-3 border-t-2 border-black">
                {story.created_at ? new Date(story.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : 'Baru saja'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}