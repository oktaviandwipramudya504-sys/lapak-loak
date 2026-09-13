export default function LoadingEmoji({ text = "Memuat..." }) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '30px 20px', 
      gap: '8px',
      width: '100%'
    }}>
      <div style={{ 
        fontSize: '36px', 
        display: 'inline-block',
        animation: 'cartoonBounce 0.8s ease-in-out infinite' 
      }}>
        🤪
      </div>
      <p style={{ 
        fontWeight: '800', 
        color: '#1A1714', 
        fontSize: '14px', 
        animation: 'pulseGlow 1.2s ease-in-out infinite',
        margin: 0,
        textAlign: 'center'
      }}>
        {text}
      </p>
    </div>
  );
}