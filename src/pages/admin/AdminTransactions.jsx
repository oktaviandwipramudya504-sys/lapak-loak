import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: 0, totalCount: 0 });
  const [trendStatus, setTrendStatus] = useState({ text: 'Stabil', color: '#8C755B' });

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      await supabase
        .from('transactions')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) {
        setTransactions(data);

        const total = data.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        setStats({
          totalRevenue: total,
          totalCount: data.length,
        });

        calculateTrend(data);
      }
      setLoading(false);
    }

    loadData();
  }, []);

  function calculateTrend(data) {
    if (data.length === 0) {
      setTrendStatus({ text: 'Belum ada data', color: '#8C755B' });
      return;
    }

    const midpoint = new Date();
    midpoint.setDate(midpoint.getDate() - 15);

    let firstHalf = 0;
    let secondHalf = 0;

    data.forEach((trx) => {
      const trxDate = new Date(trx.created_at);
      const amount = Number(trx.amount || 0);
      if (trxDate < midpoint) {
        firstHalf += amount;
      } else {
        secondHalf += amount;
      }
    });

    if (firstHalf === 0) {
      setTrendStatus({ text: 'Tren Naik 🚀', color: 'var(--sage)' });
      return;
    }

    const diffPercent = Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
    if (diffPercent > 0) {
      setTrendStatus({ text: `Naik ${diffPercent}% 📈`, color: '#2C5E3B' });
    } else if (diffPercent < 0) {
      setTrendStatus({ text: `Turun ${Math.abs(diffPercent)}% 📉`, color: 'var(--danger)' });
    } else {
      setTrendStatus({ text: 'Stabil ➡️', color: '#8C755B' });
    }
  }

  const groupedByDate = transactions.reduce((acc, curr) => {
    const dateStr = new Date(curr.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    acc[dateStr] = (acc[dateStr] || 0) + Number(curr.amount || 0);
    return acc;
  }, {});

  const chartData = Object.keys(groupedByDate).map((date) => ({
    date,
    amount: groupedByDate[date],
  }));

  const maxAmount = Math.max(...chartData.map((d) => d.amount), 1);

  if (loading) return <div className="page" style={{ padding: 16, color: '#FFFFFF' }}>Memuat data keuangan...</div>;

  return (
   <div className="page" style={{ maxWidth: 700, margin: '20px auto', padding: 16, paddingBottom: 40 }}>
      <div style={{ 
        background: '#fdfbf7', 
        border: '2px solid #1A1714', 
        boxShadow: '4px 4px 0px #1A1714', 
        padding: '16px 20px', 
        borderRadius: '8px',
        marginBottom: 16 
      }}>
        <h1 style={{ fontSize: 20, fontWeight: '800', margin: 0, color: '#1A1714', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Laporan Keuangan & Riwayat Deal (30 Hari Terakhir)
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        <div className="card" style={{ padding: 12, background: '#FFF5E6', border: '2px solid #8C755B' }}>
          <p style={{ fontSize: 11, color: '#1A1714', opacity: 0.8, margin: 0, fontWeight: '700' }}>Total Uang Masuk</p>
          <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--terracotta)', margin: '4px 0 0' }}>
            Rp{stats.totalRevenue.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="card" style={{ padding: 12, background: '#FFF5E6', border: '2px solid #8C755B' }}>
          <p style={{ fontSize: 11, color: '#1A1714', opacity: 0.8, margin: 0, fontWeight: '700' }}>Total Transaksi</p>
          <p style={{ fontSize: 16, fontWeight: 900, color: '#1A1714', margin: '4px 0 0' }}>
            {stats.totalCount} Penjualan
          </p>
        </div>
        <div className="card" style={{ padding: 12, background: '#FFF5E6', border: '2px solid #8C755B' }}>
          <p style={{ fontSize: 11, color: '#1A1714', opacity: 0.8, margin: 0, fontWeight: '700' }}>Performa Bulanan</p>
          <p style={{ fontSize: 15, fontWeight: 900, color: trendStatus.color, margin: '4px 0 0' }}>
            {trendStatus.text}
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 20, background: '#FFF5E6', border: '2px solid #8C755B' }}>
        <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 800, color: '#1A1714' }}>Grafik Tren Pendapatan Harian</p>
        
        {chartData.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#1A1714', opacity: 0.7, fontSize: 12, margin: '16px 0' }}>Belum ada grafik data untuk ditampilkan.</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', height: 120, gap: 8, overflowX: 'auto', paddingBottom: 6, borderBottom: '1px solid #D8C3A5' }}>
            {chartData.map((item, idx) => {
              const barHeight = Math.max((item.amount / maxAmount) * 100, 10);
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 32 }}>
                  <span style={{ fontSize: 8, color: '#1A1714', opacity: 0.7, marginBottom: 4 }}>
                    {item.amount > 0 ? `${Math.round(item.amount / 1000)}k` : ''}
                  </span>
                  <div 
                    style={{ 
                      width: '100%', 
                      height: `${barHeight}%`, 
                      background: 'var(--terracotta)', 
                      borderRadius: '4px 4px 0 0' 
                    }} 
                    title={`${item.date}: Rp${item.amount.toLocaleString('id-ID')}`}
                  />
                  <span style={{ fontSize: 8, color: '#1A1714', marginTop: 4, whiteSpace: 'nowrap' }}>{item.date}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

     <div style={{ 
  background: '#fdfbf7', 
  border: '2px solid #1A1714', 
  boxShadow: '4px 4px 0px #1A1714', 
  padding: '16px 20px', 
  borderRadius: '8px',
  marginBottom: 16 
}}>
  <h2 style={{ fontSize: 16, fontWeight: '800', margin: 0, color: '#1A1714', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
    Riwayat Transaksi Masuk
  </h2>
</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {transactions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <p style={{ fontWeight: '700', color: '#1A1714', margin: 0 }}>Belum ada riwayat transaksi dalam 30 hari ini.</p>
          </div>
        ) : (
          transactions.slice().reverse().map((trx) => {
            const dateObj = new Date(trx.created_at);
            const formattedDate = dateObj.toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <div key={trx.id} className="card" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: '#1A1714' }}>{trx.item_name}</p>
                  <p style={{ margin: '4px 0 2px', fontSize: 11, color: '#1A1714', opacity: 0.8 }}>
                    WhatsApp: <strong>{trx.buyer_whatsapp || 'Pembeli Langsung'}</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: 10, color: '#1A1714', opacity: 0.6 }}>
                    {formattedDate}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: 'var(--terracotta)' }}>
                    +Rp{Number(trx.amount).toLocaleString('id-ID')}
                  </p>
                  <span style={{ fontSize: 10, background: '#D8C3A5', padding: '2px 6px', borderRadius: 4, fontWeight: '700', color: '#1A1714' }}>
                    {trx.type || 'Deal'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}