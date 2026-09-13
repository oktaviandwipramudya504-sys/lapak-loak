// src/lib/recommendation.js

// Fungsi pembantu untuk memecah teks menjadi token/kata-kata unik (TF sederhana)
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .split(/\s+/)
    .filter(word => word.length > 2); // Abaikan kata terlalu pendek
}

// Menghitung Cosine Similarity sederhana antara dua teks produk
function calculateCosineSimilarity(text1, text2) {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);
  
  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  const frequency1 = {};
  const frequency2 = {};

  tokens1.forEach(word => frequency1[word] = (frequency1[word] || 0) + 1);
  tokens2.forEach(word => frequency2[word] = (frequency2[word] || 0) + 1);

  const uniqueWords = new Set([...Object.keys(frequency1), ...Object.keys(frequency2)]);
  
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  uniqueWords.forEach(word => {
    const v1 = frequency1[word] || 0;
    const v2 = frequency2[word] || 0;
    dotProduct += v1 * v2;
    magnitude1 += v1 * v1;
    magnitude2 += v2 * v2;
  });

  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

/**
 * Mendapatkan produk yang mirip berdasarkan currentItem dari daftar semua produk
 * @param {Object} currentItem - Produk yang sedang dilihat
 * @param {Array} allItems - Semua daftar produk dari database
 * @param {Number} limit - Batas jumlah rekomendasi (default 3)
 */
export function getRecommendedItems(currentItem, allItems, limit = 3) {
  if (!currentItem || !allItems || allItems.length === 0) return [];

  // Filter agar produk saat ini tidak masuk dalam rekomendasi
  const otherItems = allItems.filter(item => item.id !== currentItem.id);

  // Hitung skor kemiripan untuk setiap produk lain
  const scoredItems = otherItems.map(item => {
    // Gabungkan judul, kategori, dan deskripsi sebagai bahan komparasi teks
    const textA = `${currentItem.title || ''} ${currentItem.category || ''} ${currentItem.description || ''}`;
    const textB = `${item.title || ''} ${item.category || ''} ${item.description || ''}`;
    
    const score = calculateCosineSimilarity(textA, textB);
    return { ...item, score };
  });

  // Urutkan dari skor kemiripan tertinggi ke terendah
  scoredItems.sort((a, b) => b.score - a.score);

  // Ambil sejumlah limit teratas yang skornya > 0, jika kurang ambil produk acak terdekat
  const filtered = scoredItems.filter(item => item.score > 0);
  
  if (filtered.length < limit) {
    // Jika kurang, lengkapi dengan produk lain yang tersedia
    const remaining = scoredItems.filter(item => item.score === 0);
    return [...filtered, ...remaining].slice(0, limit);
  }

  return filtered.slice(0, limit);
}