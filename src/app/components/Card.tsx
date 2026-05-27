interface CardProps {
  title: string;
  children: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div 
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-8)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--space-6)'
      }}
    >
      <h2 
        style={{
          fontFamily: 'var(--font-title)',
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--color-text)',
          marginBottom: 'var(--space-6)',
          marginTop: 0
        }}
      >
        {title}
      </h2>
      <div>{children}</div>
    </div>
  );
}
