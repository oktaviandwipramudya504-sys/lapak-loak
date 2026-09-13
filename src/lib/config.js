// Konfigurasi global Lapak Ara
export const APP_CONFIG = {
  // Ganti nomor di bawah ini dengan nomor WhatsApp admin yang asli (pakai 62 di depan, contoh: 628123456789)
  ADMIN_WHATSAPP: '62882006296949', 
};

// Fungsi helper otomatis untuk membuat link WhatsApp siap klik
export function getWhatsAppLink(phone, message) {
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}