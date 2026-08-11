export default function LoadingSpinner({ size = 'md', text = 'Cargando...' }) {
  const sizeMap = { sm: '1.25rem', md: '2rem', lg: '3rem' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '2rem' }}>
      <div
        className="spinner-salud"
        style={{ width: sizeMap[size] || sizeMap.md, height: sizeMap[size] || sizeMap.md }}
      />
      {text && <p style={{ color: 'var(--color-warm-gray)', fontSize: '0.875rem', margin: 0 }}>{text}</p>}
    </div>
  );
}
