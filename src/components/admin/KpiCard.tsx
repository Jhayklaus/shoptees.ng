type Props = {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
};

export function KpiCard({ label, value, hint, accent }: Props) {
  return (
    <div
      className={[
        "p-5 border",
        accent ? "bg-ink text-paper border-ink" : "bg-paper border-line",
      ].join(" ")}
    >
      <p className={accent ? "font-mono-tight text-paper/55" : "font-mono-tight text-ink/55"}>
        {label}
      </p>
      <p className="font-display text-4xl tracking-tight mt-1 leading-none">
        {value}
      </p>
      {hint && (
        <p
          className={[
            "font-italic-accent text-sm mt-2",
            accent ? "text-paper/70" : "text-ink/55",
          ].join(" ")}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
