const items = [
  "FREE SHIPPING WITHIN LAGOS ON ORDERS ABOVE ₦50,000",
  "·",
  "NEW DROP — [PLACEHOLDER: collection name] LIVE",
  "·",
  "PAY ON DELIVERY UNAVAILABLE — PAYSTACK ONLY",
  "·",
  "WORLDWIDE SHIPPING VIA DHL",
  "·",
];

export function AnnouncementBar() {
  // 4× repeat so the seamless -50% translate has enough content
  const reel = Array.from({ length: 4 }).flatMap(() => items);

  return (
    <div
      role="region"
      aria-label="Site announcements"
      className="bg-ink text-paper py-2 overflow-hidden border-b border-ink"
    >
      <div className="flex animate-marquee whitespace-nowrap will-change-transform">
        {reel.map((t, i) => (
          <span
            key={i}
            className="font-mono-tight px-4 inline-flex items-center text-[0.68rem] text-paper/85"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
