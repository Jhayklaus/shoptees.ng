export function PageHeader({
  eyebrow,
  title,
  accent,
  actions,
}: {
  eyebrow: React.ReactNode;
  title: string;
  accent?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex items-end justify-between gap-6 px-8 pt-8 pb-6 border-b border-line">
      <div>
        <p className="font-mono-tight text-ink/55">{eyebrow}</p>
        <h1 className="font-display text-5xl md:text-6xl tracking-[-0.025em] leading-none mt-1">
          {title}
          {accent && <span className="font-italic-accent text-vermillion"> {accent}</span>}
        </h1>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
}
