import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Star, MessageSquare, Send, X, Plus } from 'lucide-react';

export default function BuyerStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newStory, setNewStory] = useState({
    name: '',
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
      
      // Kirim hanya kolom yang pasti ada di database (name, rating, story)
      const payload = {
        name: newStory.name,
        rating: newStory.rating,
        story: newStory.story
      };

      const { error } = await supabase
        .from('buyer_stories')
        .insert([payload]);

      if (error) throw error;

      setNewStory({
        name: '',
        rating: 5,
        story: ''
      });
      setShowForm(false);
      fetchStories();
      alert('Ulasan berhasil dikirim!');
    } catch (error) {
      console.error('Error submitting story:', error);
      alert('Gagal: ' + (error.message || JSON.stringify(error)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* SATU CARD UTAMA NEO BRUTALISM */}
      <div className="bg-white text-black rounded-xl p-6 md:p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Header di dalam card */}
        <div className="flex justify-between items-center flex-wrap gap-4 pb-6 border-b-4 border-black">
          <div>
            <h1 className="text-2xl font-black mb-1 tracking-tight">CERITA PEMBELI (BUYER STORIES)</h1>
            <p className="text-gray-800 text-sm font-bold">Kumpulan ulasan dan pengalaman berbelanja dari para pembeli.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#ffde59] hover:bg-[#ffd000] text-black font-black px-5 py-2.5 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center gap-2"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? 'Tutup Form' : 'Beri Ulasan'}
          </button>
        </div>

        {/* Form Input Ulasan */}
        {showForm && (
          <div className="my-6 p-6 bg-yellow-50 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-lg font-black mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-black" />
              TULIS ULASAN KAMU
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1">Nama</label>
                <input
                  type="text"
                  value={newStory.name}
                  onChange={(e) => setNewStory({ ...newStory, name: e.target.value })}
                  placeholder="Nama kamu"
                  className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg focus:outline-none text-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Rating</label>
                <select
                  value={newStory.rating}
                  onChange={(e) => setNewStory({ ...newStory, rating: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg focus:outline-none text-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (Sangat Puas)</option>
                  <option value={4}>⭐⭐⭐⭐ (Puas)</option>
                  <option value={3}>⭐⭐⭐ (Cukup)</option>
                  <option value={2}>⭐⭐ (Kurang)</option>
                  <option value={1}>⭐ (Buruk)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Ulasan / Cerita</label>
                <textarea
                  rows={4}
                  value={newStory.story}
                  onChange={(e) => setNewStory({ ...newStory, story: e.target.value })}
                  placeholder="Ceritakan pengalamanmu..."
                  className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg focus:outline-none text-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#ffde59] hover:bg-[#ffd000] text-black font-black py-2.5 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Menyimpan...' : 'Simpan Ulasan'}
              </button>
            </form>
          </div>
        )}

        {/* Bagian Daftar Ulasan */}
        <div className="mt-6">
          <h2 className="text-xl font-black text-black mb-4 tracking-tight">ULASAN PEMBELI</h2>
          
          {loading ? (
            <div className="text-center py-10 text-black font-black bg-gray-100 rounded-lg border-2 border-black">
              Memuat ulasan...
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-10 text-black font-bold bg-gray-50 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              Belum ada ulasan. Jadilah yang pertama memberikan ulasan!
            </div>
          ) : (
            <div className="space-y-4">
              {stories.map((story) => (
                <div key={story.id} className="bg-white rounded-lg p-5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-black text-base text-black">{story.name || story.buyer_name}</h3>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded border-2 border-black">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < story.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-black text-sm mb-3 whitespace-pre-line leading-relaxed font-medium">
                    {story.story || story.comment}
                  </p>
                  <div className="text-xs text-gray-700 font-bold pt-2 border-t-2 border-black">
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

      </div>
    </div>
  );
}