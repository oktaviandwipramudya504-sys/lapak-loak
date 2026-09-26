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
      {/* Header Card */}
      <div className="bg-[#fcf7ee] rounded-2xl shadow-xl p-6 mb-6 border-2 border-[#b58b53] flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Cerita Pembeli (Buyer Stories)</h1>
          <p className="text-gray-700 text-sm">Kumpulan ulasan dan pengalaman berbelanja dari para pembeli.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#a04010] hover:bg-[#8b350d] text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 border border-[#7a2e0a]"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Tutup Form' : 'Beri Ulasan'}
        </button>
      </div>

      {/* Form Input Ulasan Card */}
      {showForm && (
        <div className="bg-[#fcf7ee] rounded-2xl shadow-xl p-6 mb-8 border-2 border-[#b58b53] transition-all">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#8b4513]" />
            Tulis Ulasan Kamu
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Nama</label>
              <input
                type="text"
                value={newStory.name}
                onChange={(e) => setNewStory({ ...newStory, name: e.target.value })}
                placeholder="Nama kamu"
                className="w-full px-3 py-2 bg-white border border-[#b58b53] rounded-md focus:ring-2 focus:ring-[#8b4513] focus:outline-none text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Barang yang Dibeli (Opsional)</label>
              <input
                type="text"
                value={newStory.item_bought}
                onChange={(e) => setNewStory({ ...newStory, item_bought: e.target.value })}
                placeholder="Contoh: Barang loak"
                className="w-full px-3 py-2 bg-white border border-[#b58b53] rounded-md focus:ring-2 focus:ring-[#8b4513] focus:outline-none text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Rating</label>
              <select
                value={newStory.rating}
                onChange={(e) => setNewStory({ ...newStory, rating: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-[#b58b53] rounded-md focus:ring-2 focus:ring-[#8b4513] focus:outline-none text-gray-800"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (Sangat Puas)</option>
                <option value={4}>⭐⭐⭐⭐ (Puas)</option>
                <option value={3}>⭐⭐⭐ (Cukup)</option>
                <option value={2}>⭐⭐ (Kurang)</option>
                <option value={1}>⭐ (Buruk)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Ulasan / Cerita</label>
              <textarea
                rows={4}
                value={newStory.story}
                onChange={(e) => setNewStory({ ...newStory, story: e.target.value })}
                placeholder="Ceritakan pengalamanmu..."
                className="w-full px-3 py-2 bg-white border border-[#b58b53] rounded-md focus:ring-2 focus:ring-[#8b4513] focus:outline-none text-gray-800"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#a04010] hover:bg-[#8b350d] text-white font-semibold py-2.5 rounded-lg shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 border border-[#7a2e0a]"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Menyimpan...' : 'Simpan Ulasan'}
            </button>
          </form>
        </div>
      )}

      {/* Daftar Ulasan Cards */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Ulasan Pembeli</h2>
      {loading ? (
        <div className="text-center py-12 text-gray-800 bg-[#fcf7ee] rounded-2xl border-2 border-[#b58b53]">Memuat ulasan...</div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12 text-gray-700 bg-[#fcf7ee] rounded-2xl shadow-xl border-2 border-[#b58b53]">
          Belum ada ulasan. Jadilah yang pertama memberikan ulasan!
        </div>
      ) : (
        <div className="space-y-6">
          {stories.map((story) => (
            <div key={story.id} className="bg-[#fcf7ee] rounded-2xl shadow-xl p-6 border-2 border-[#b58b53]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{story.name || story.buyer_name}</h3>
                  {story.item_bought && (
                    <p className="text-sm text-[#8b4513] font-semibold">Membeli: {story.item_bought}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
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
              <p className="text-gray-800 mb-4 whitespace-pre-line leading-relaxed">{story.story || story.comment}</p>
              <div className="text-xs text-gray-500 font-medium pt-3 border-t border-[#dfd3c3]">
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