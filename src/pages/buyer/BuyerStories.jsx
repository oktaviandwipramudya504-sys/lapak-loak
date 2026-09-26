import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Star, MessageSquare, ThumbsUp, Send, Image as ImageIcon } from 'lucide-react';

export default function BuyerStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStory, setNewStory] = useState({
    name: '',
    item_bought: '',
    rating: 5,
    story: '',
    image_url: ''
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
      alert('Nama dan cerita wajib diisi!');
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
        story: '',
        image_url: ''
      });
      fetchStories();
      alert('Cerita berhasil dibagikan!');
    } catch (error) {
      console.error('Error submitting story:', error.message);
      alert('Gagal membagikan cerita. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cerita Pembeli (Buyer Stories)</h1>
        <p className="text-gray-600">Bagikan pengalaman seru dan barang loak impian yang kamu dapatkan di sini!</p>
      </div>

      {/* Form Bagikan Cerita */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-12 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          Tulis Cerita Belanjamu
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kamu</label>
              <input
                type="text"
                value={newStory.name}
                onChange={(e) => setNewStory({ ...newStory, name: e.target.value })}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Barang yang Dibeli</label>
              <input
                type="text"
                value={newStory.item_bought}
                onChange={(e) => setNewStory({ ...newStory, item_bought: e.target.value })}
                placeholder="Contoh: Kamera Sony A6000"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
              <select
                value={newStory.rating}
                onChange={(e) => setNewStory({ ...newStory, rating: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (Sangat Puas)</option>
                <option value={4}>⭐⭐⭐⭐ (Puas)</option>
                <option value={3}>⭐⭐⭐ (Cukup)</option>
                <option value={2}>⭐⭐ (Kurang)</option>
                <option value={1}>⭐ (Buruk)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Foto (Opsional)</label>
              <input
                type="url"
                value={newStory.image_url}
                onChange={(e) => setNewStory({ ...newStory, image_url: e.target.value })}
                placeholder="https://example.com/foto.jpg"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cerita / Review</label>
            <textarea
              rows={4}
              value={newStory.story}
              onChange={(e) => setNewStory({ ...newStory, story: e.target.value })}
              placeholder="Ceritakan pengalamanmu berbelanja di sini..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Mengirim...' : 'Kirim Cerita'}
          </button>
        </form>
      </div>

      {/* Daftar Cerita */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Cerita dari Pembeli Lain</h2>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Memuat cerita...</div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
          Belum ada cerita pembeli. Jadilah yang pertama membagikannya!
        </div>
      ) : (
        <div className="space-y-6">
          {stories.map((story) => (
            <div key={story.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{story.name}</h3>
                  {story.item_bought && (
                    <p className="text-sm text-indigo-600 font-medium">Membeli: {story.item_bought}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < story.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 whitespace-pre-line">{story.story}</p>
              {story.image_url && (
                <div className="mb-4">
                  <img
                    src={story.image_url}
                    alt="Buyer story upload"
                    className="max-h-64 rounded-lg object-cover border"
                  />
                </div>
              )}
              <div className="text-xs text-gray-400">
                {new Date(story.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}