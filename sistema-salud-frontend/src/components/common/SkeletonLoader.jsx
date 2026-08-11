export default function SkeletonLoader({ count = 3, height = '80px' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height,
            background: 'linear-gradient(90deg, var(--color-stone) 25%, var(--color-parchment-dark) 50%, var(--color-stone) 75%)',
            backgroundSize: '200% 100%',
            borderRadius: '10px',
            animation: 'shimmer 1.5s ease-in-out infinite',
          }}
        />
      ))}
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}
