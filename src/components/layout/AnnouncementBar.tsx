// Ticker above the header. Copy is unchanged from what was here — including
// the shipping line, which I flagged as reading oddly next to the free-Lagos
// line but have deliberately not rewritten, because how shipping is paid for
// is a business fact and not mine to change.
const items = [
  "FREE DELIVERY WITHIN LAGOS ON ORDERS ABOVE ₦50,000",
  "·",
  "STREETWEAR · FOOTBALL JERSEYS · MEN & WOMEN",
  "·",
  "WHOLESALE ENQUIRIES — DM US ON INSTAGRAM",
  "·",
  "PAY ONLINE · SHIPPING SETTLED ON DELIVERY",
  "·",
];

export function AnnouncementBar() {
  // 4× repeat so the seamless -50% translate has enough content
  const reel = Array.from({ length: 8 }).flatMap(() => items);

  return (
    <div
      role="region"
      aria-label="Site announcements"
      data-vt="announcement"
      className="marquee-hover bg-ink text-paper py-2 overflow-hidden"
    >
      <div className="flex animate-marquee whitespace-nowrap will-change-transform">
        {reel.map((t, i) => (
          <span
            key={i}
            className={[
              "font-mono-tight px-5 inline-flex items-center text-[0.7rem]",
              t === "·" ? "text-tan" : "text-paper/85",
            ].join(" ")}
          >
            {t === "·" ? "■" : t}
          </span>
        ))}
      </div>
    </div>
  );
}
