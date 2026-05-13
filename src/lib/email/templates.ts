import "server-only";
import { formatNaira } from "@/lib/utils";

type OrderLine = {
  productName: string;
  variantSize: string;
  quantity: number;
  unitPriceNGN: number;
};

type OrderForEmail = {
  orderNumber: string;
  totalNGN: number;
  subtotalNGN: number;
  shippingNGN: number;
  items: OrderLine[];
  customer: { firstName: string; lastName: string; email: string; phone: string | null };
  address: {
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postal: string | null;
  } | null;
};

// Plain-HTML templates. Kept inline (no external renderer) to avoid pulling
// in @react-email/* just for two emails. Inline styles only — most email
// clients strip <style> blocks.
const WRAP_OPEN = `<!doctype html><html><body style="margin:0;padding:0;background:#f6f4ee;font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;background:#fff;padding:32px 28px;">`;
const WRAP_CLOSE = `  </div></body></html>`;

function itemsTable(items: OrderLine[]) {
  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;">
          <div style="font-size:15px;">${escapeHtml(i.productName)}</div>
          <div style="font-size:13px;color:#888;">${escapeHtml(i.variantSize)} × ${i.quantity}</div>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;">
          ${formatNaira(i.unitPriceNGN * i.quantity)}
        </td>
      </tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;">${rows}</table>`;
}

function addressBlock(o: OrderForEmail) {
  if (!o.address) return "";
  const parts = [
    `${escapeHtml(o.customer.firstName)} ${escapeHtml(o.customer.lastName)}`,
    escapeHtml(o.address.line1),
    o.address.line2 ? escapeHtml(o.address.line2) : null,
    `${escapeHtml(o.address.city)}, ${escapeHtml(o.address.state)}${
      o.address.postal ? ` ${escapeHtml(o.address.postal)}` : ""
    }`,
  ].filter(Boolean);
  return `<p style="margin:6px 0;line-height:1.5;">${parts.join("<br>")}</p>`;
}

export function customerOrderConfirmation(o: OrderForEmail) {
  const subject = `Order ${o.orderNumber} confirmed — Shoptees`;
  const html = `${WRAP_OPEN}
    <p style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#888;margin:0 0 10px;">Receipt</p>
    <h1 style="font-size:30px;margin:0 0 6px;letter-spacing:-0.02em;">Thank you, ${escapeHtml(o.customer.firstName)}.</h1>
    <p style="color:#555;margin:0 0 24px;">Order <strong>${o.orderNumber}</strong> is confirmed.</p>

    <h2 style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#888;margin:24px 0 8px;">Items</h2>
    ${itemsTable(o.items)}

    <table style="width:100%;border-collapse:collapse;margin-top:12px;">
      <tr><td style="padding:4px 0;color:#666;">Subtotal</td><td style="text-align:right;font-variant-numeric:tabular-nums;">${formatNaira(o.subtotalNGN)}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Shipping</td><td style="text-align:right;color:#666;">Paid on delivery</td></tr>
      <tr><td style="padding:10px 0 0;font-size:18px;font-weight:600;">Total</td><td style="padding:10px 0 0;text-align:right;font-size:18px;font-weight:600;font-variant-numeric:tabular-nums;">${formatNaira(o.totalNGN)}</td></tr>
    </table>

    ${o.address ? `
      <h2 style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#888;margin:28px 0 8px;">Delivery</h2>
      ${addressBlock(o)}
    ` : ""}

    <p style="margin:28px 0 0;color:#555;line-height:1.55;">
      We'll reach out on WhatsApp once your order ships. Lagos orders usually leave the studio within 48 hours.
    </p>
    <p style="margin:18px 0 0;color:#999;font-size:13px;">— The Shoptees team</p>
  ${WRAP_CLOSE}`;

  const text = [
    `Order ${o.orderNumber} confirmed — Shoptees`,
    ``,
    `Thank you, ${o.customer.firstName}.`,
    ``,
    `Items:`,
    ...o.items.map((i) => `  · ${i.productName} (${i.variantSize}) × ${i.quantity} — ${formatNaira(i.unitPriceNGN * i.quantity)}`),
    ``,
    `Subtotal: ${formatNaira(o.subtotalNGN)}`,
    `Shipping: paid on delivery`,
    `Total:    ${formatNaira(o.totalNGN)}`,
    ``,
    o.address
      ? [
          `Delivery to:`,
          `  ${o.customer.firstName} ${o.customer.lastName}`,
          `  ${o.address.line1}`,
          o.address.line2 ? `  ${o.address.line2}` : null,
          `  ${o.address.city}, ${o.address.state}${o.address.postal ? ` ${o.address.postal}` : ""}`,
        ]
          .filter(Boolean)
          .join("\n")
      : ``,
    ``,
    `We'll reach out on WhatsApp once your order ships.`,
    `— The Shoptees team`,
  ].join("\n");

  return { subject, html, text };
}

export function adminNewOrderNotification(o: OrderForEmail, opts: { siteUrl: string }) {
  const subject = `New paid order: ${o.orderNumber} · ${formatNaira(o.totalNGN)}`;
  const orderLink = `${opts.siteUrl}/admin/orders`;

  const html = `${WRAP_OPEN}
    <p style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#888;margin:0 0 10px;">New order</p>
    <h1 style="font-size:26px;margin:0 0 6px;letter-spacing:-0.02em;">${o.orderNumber}</h1>
    <p style="color:#555;margin:0 0 24px;">
      ${escapeHtml(o.customer.firstName)} ${escapeHtml(o.customer.lastName)} ·
      <a href="mailto:${escapeHtml(o.customer.email)}">${escapeHtml(o.customer.email)}</a>
      ${o.customer.phone ? ` · ${escapeHtml(o.customer.phone)}` : ""}
    </p>

    ${itemsTable(o.items)}

    <p style="margin:14px 0 0;font-size:18px;font-weight:600;">Total: ${formatNaira(o.totalNGN)}</p>

    ${o.address ? `
      <h2 style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#888;margin:24px 0 8px;">Deliver to</h2>
      ${addressBlock(o)}
    ` : ""}

    <p style="margin:28px 0 0;">
      <a href="${escapeHtml(orderLink)}" style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;padding:12px 18px;font-size:14px;letter-spacing:0.04em;">View in admin →</a>
    </p>
  ${WRAP_CLOSE}`;

  const text = [
    `New paid order: ${o.orderNumber}`,
    ``,
    `${o.customer.firstName} ${o.customer.lastName} · ${o.customer.email}${o.customer.phone ? ` · ${o.customer.phone}` : ""}`,
    ``,
    `Items:`,
    ...o.items.map((i) => `  · ${i.productName} (${i.variantSize}) × ${i.quantity} — ${formatNaira(i.unitPriceNGN * i.quantity)}`),
    ``,
    `Total: ${formatNaira(o.totalNGN)}`,
    ``,
    o.address
      ? [
          `Deliver to:`,
          `  ${o.customer.firstName} ${o.customer.lastName}`,
          `  ${o.address.line1}`,
          o.address.line2 ? `  ${o.address.line2}` : null,
          `  ${o.address.city}, ${o.address.state}${o.address.postal ? ` ${o.address.postal}` : ""}`,
        ]
          .filter(Boolean)
          .join("\n")
      : ``,
    ``,
    `Admin: ${orderLink}`,
  ].join("\n");

  return { subject, html, text };
}

export function contactFormToAdmin(args: {
  name: string;
  email: string;
  message: string;
}) {
  const subject = `Contact form — ${args.name}`;
  const safeMsg = escapeHtml(args.message).replace(/\n/g, "<br>");
  const html = `${WRAP_OPEN}
    <p style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#888;margin:0 0 10px;">New message</p>
    <h1 style="font-size:22px;margin:0 0 6px;letter-spacing:-0.01em;">${escapeHtml(args.name)}</h1>
    <p style="margin:0 0 20px;color:#555;">
      <a href="mailto:${escapeHtml(args.email)}">${escapeHtml(args.email)}</a>
    </p>
    <div style="border-left:3px solid #1a1a1a;padding:8px 14px;color:#222;line-height:1.55;">
      ${safeMsg}
    </div>
    <p style="margin:24px 0 0;font-size:13px;color:#999;">Reply directly to this email to respond.</p>
  ${WRAP_CLOSE}`;

  const text = [
    `New contact-form message`,
    ``,
    `From: ${args.name} <${args.email}>`,
    ``,
    args.message,
    ``,
    `Reply directly to this email to respond.`,
  ].join("\n");

  return { subject, html, text };
}

export function newsletterWelcome() {
  const subject = "You're on the list — Shoptees";
  const html = `${WRAP_OPEN}
    <p style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#888;margin:0 0 10px;">Letters · 01</p>
    <h1 style="font-size:30px;margin:0 0 6px;letter-spacing:-0.02em;">You're on the list.</h1>
    <p style="color:#555;line-height:1.6;margin:14px 0 0;">
      Drops, restocks, a few photographs. Never more than four times a year — and
      no fluff in between.
    </p>
    <p style="margin:24px 0 0;color:#999;font-size:13px;">— The Shoptees team</p>
  ${WRAP_CLOSE}`;

  const text = [
    `You're on the list — Shoptees`,
    ``,
    `Drops, restocks, a few photographs. Never more than four times a year.`,
    ``,
    `— The Shoptees team`,
  ].join("\n");

  return { subject, html, text };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
