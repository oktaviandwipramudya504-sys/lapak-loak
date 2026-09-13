export default function Loader({ text = "Lagi diproses, sebentar ya..." }) {
  return (
    <div className="loading-cartoon-container">
      <div className="loading-box-icon">🤪</div>
      <p className="loading-text">{text}</p>
    </div>
  );
}