import "server-only";
import { formatNaira } from "@/lib/utils";
import { formatStored } from "@/lib/currency";
import { siteConfig } from "@/config/site";

type OrderLine = {
  productName: string;
  variantSize: string;
  quantity: number;
  unitPriceNGN: number;
  unitPriceMinor?: number | null;
};

type OrderForEmail = {
  orderNumber: string;
  totalNGN: number;
  subtotalNGN: number;
  shippingNGN: number;
  // Presentment currency and the figures the customer actually saw. Absent
  // (or "NGN") means a naira order and the *NGN fields stand on their own.
  currency?: string;
  fxRateNgnPerUnit?: number | null;
  totalMinor?: number | null;
  subtotalMinor?: number | null;
  shippingMinor?: number | null;
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

// ─── Design tokens (inline only — email clients strip <style>) ─────────────
const C = {
  ink:       "#16110f",
  paper:     "#ffffff",
  paperDeep: "#f4ece1",
  vermillion:"#6d071a", // burgundy — brand accent
  tan:       "#c19a6b",
  muted:     "#6b5b52",
  line:      "#e6dbcc",
  lineLight: "#f0e8dd",
};

const LOGO_URL = `${siteConfig.url}/logo.png`;

// ─── Shell ─────────────────────────────────────────────────────────────────

function shell(body: string): string {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${C.paperDeep};font-family:Arial,Helvetica,sans-serif;color:${C.ink};-webkit-font-smoothing:antialiased;">
  <div style="max-width:580px;margin:0 auto;padding:24px 16px;">

    <!-- Logo header — light so the black logo reads -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:0;">
      <tr>
        <td style="background:${C.paper};border:3px solid ${C.ink};border-bottom:2px solid ${C.ink};padding:20px 28px;">
          <img src="${LOGO_URL}" alt="Shoptees" height="52" style="display:block;border:0;max-height:52px;width:auto;" />
        </td>
        <td style="background:${C.paper};border:3px solid ${C.ink};border-left:0;border-bottom:2px solid ${C.ink};padding:20px 28px;text-align:right;vertical-align:middle;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:${C.vermillion};font-weight:700;">Lagos, NG</span>
        </td>
      </tr>
    </table>

    <!-- Body card -->
    <div style="background:${C.paper};border-left:3px solid ${C.ink};border-right:3px solid ${C.ink};border-bottom:3px solid ${C.ink};padding:32px 28px;">
      ${body}
    </div>

    <!-- Footer strip -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:0;">
      <tr>
        <td style="background:${C.paperDeep};border-top:3px solid ${C.vermillion};padding:14px 28px;">
          <p style="margin:0;font-size:11px;color:${C.muted};font-family:Arial,Helvetica,sans-serif;">
            © ${new Date().getFullYear()} Shoptees · Lagos, Nigeria ·
            <a href="${siteConfig.url}" style="color:${C.muted};text-decoration:underline;">shoptees.ng</a>
          </p>
        </td>
      </tr>
    </table>

  </div>
</body>
</html>`;
}

// ─── Reusable pieces ────────────────────────────────────────────────────────

function stamp(text: string): string {
  return `<span style="display:inline-block;font-family:monospace,'Courier New',Courier;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${C.vermillion};border:1.5px solid ${C.vermillion};padding:2px 7px;font-weight:700;">${escapeHtml(text)}</span>`;
}

function sectionLabel(text: string): string {
  return `<p style="margin:28px 0 8px;font-family:monospace,'Courier New',Courier;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${C.muted};font-weight:700;border-bottom:2px solid ${C.ink};padding-bottom:5px;">${escapeHtml(text)}</p>`;
}

/** Format an order amount in the currency the customer checked out in. */
function money(o: OrderForEmail, amountNGN: number, amountMinor?: number | null): string {
  return formatStored(amountNGN, amountMinor, o.currency ?? "NGN");
}

function lineTotal(o: OrderForEmail, item: OrderLine): string {
  return money(
    o,
    item.unitPriceNGN * item.quantity,
    item.unitPriceMinor == null ? null : item.unitPriceMinor * item.quantity,
  );
}

function isForeign(o: OrderForEmail): boolean {
  return Boolean(o.currency && o.currency !== "NGN" && o.totalMinor != null);
}

/** Merchant-facing note: naira is the book, this is what the customer saw. */
function presentmentNote(o: OrderForEmail): string {
  if (!isForeign(o)) return "";
  return `<p style="margin:6px 0 0;font-family:monospace,'Courier New',Courier;font-size:12px;color:${C.muted};">
    Customer paid ${money(o, o.totalNGN, o.totalMinor)} · rate ₦${o.fxRateNgnPerUnit}/${escapeHtml(o.currency ?? "")}
  </p>`;
}

function itemsTable(o: OrderForEmail): string {
  const items = o.items;
  const rows = items.map((item, idx) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${C.lineLight};font-family:monospace,'Courier New',Courier;font-size:11px;color:${C.muted};vertical-align:top;width:28px;">
        ${String(idx + 1).padStart(2, "0")}
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid ${C.lineLight};vertical-align:top;">
        <div style="font-size:16px;font-weight:700;color:${C.ink};font-family:Arial,Helvetica,sans-serif;">${escapeHtml(item.productName)}</div>
        <div style="font-size:12px;color:${C.muted};margin-top:2px;font-family:monospace,'Courier New',Courier;letter-spacing:0.05em;">SIZE ${escapeHtml(item.variantSize)} × ${item.quantity}</div>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid ${C.lineLight};text-align:right;white-space:nowrap;font-family:monospace,'Courier New',Courier;font-size:13px;font-weight:700;vertical-align:top;">
        ${lineTotal(o, item)}
      </td>
    </tr>`).join("");

  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows}</table>`;
}

function totalBlock(o: OrderForEmail): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:4px;">
    <tr>
      <td style="padding:6px 0;font-family:monospace,'Courier New',Courier;font-size:12px;color:${C.muted};">Subtotal</td>
      <td style="padding:6px 0;text-align:right;font-family:monospace,'Courier New',Courier;font-size:12px;color:${C.muted};">${money(o, o.subtotalNGN, o.subtotalMinor)}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;font-family:monospace,'Courier New',Courier;font-size:12px;color:${C.muted};">Shipping</td>
      <td style="padding:6px 0;text-align:right;font-family:monospace,'Courier New',Courier;font-size:12px;color:${C.muted};">Paid on delivery</td>
    </tr>
    <tr>
      <td style="padding:12px 0 0;border-top:2px solid ${C.ink};font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">Total</td>
      <td style="padding:12px 0 0;border-top:2px solid ${C.ink};text-align:right;font-family:monospace,'Courier New',Courier;font-size:20px;font-weight:700;">${money(o, o.totalNGN, o.totalMinor)}</td>
    </tr>
  </table>`;
}

function addressBlock(o: OrderForEmail): string {
  if (!o.address) return "";
  const lines = [
    `${escapeHtml(o.customer.firstName)} ${escapeHtml(o.customer.lastName)}`,
    escapeHtml(o.address.line1),
    o.address.line2 ? escapeHtml(o.address.line2) : null,
    `${escapeHtml(o.address.city)}, ${escapeHtml(o.address.state)}${o.address.postal ? ` ${escapeHtml(o.address.postal)}` : ""}`,
  ].filter(Boolean);
  return `<p style="margin:6px 0 0;line-height:1.7;font-family:monospace,'Courier New',Courier;font-size:13px;color:${C.ink};">${lines.join("<br>")}</p>`;
}

function ctaButton(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:${C.ink};color:${C.paper};text-decoration:none;padding:13px 22px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-top:24px;">${escapeHtml(label)} →</a>`;
}

// ─── Templates ──────────────────────────────────────────────────────────────

export function customerOrderConfirmation(o: OrderForEmail) {
  const subject = `Order ${o.orderNumber} confirmed — Shoptees`;

  const body = `
    ${stamp("Receipt")}
    <h1 style="margin:16px 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:34px;font-weight:900;letter-spacing:-0.02em;line-height:1.1;color:${C.ink};">
      Thank you,<br>${escapeHtml(o.customer.firstName)}.
    </h1>
    <p style="margin:8px 0 0;font-family:monospace,'Courier New',Courier;font-size:12px;color:${C.muted};">
      ORDER ${escapeHtml(o.orderNumber)}
    </p>

    ${sectionLabel("Items")}
    ${itemsTable(o)}
    <div style="margin-top:8px;">${totalBlock(o)}</div>

    ${o.address ? `
      ${sectionLabel("Deliver to")}
      ${addressBlock(o)}
    ` : ""}

    ${sectionLabel("What's next")}
    <p style="margin:0;font-size:14px;color:${C.muted};line-height:1.7;font-family:Arial,Helvetica,sans-serif;">
      We'll reach out on WhatsApp once your order is packed and ready to ship.
      Lagos orders usually leave the studio within <strong style="color:${C.ink};">48 hours</strong>.
    </p>

    <p style="margin:28px 0 0;border-top:1px dashed ${C.line};padding-top:20px;font-family:monospace,'Courier New',Courier;font-size:11px;color:${C.muted};">
      — The Shoptees team · <a href="${siteConfig.url}/shop" style="color:${C.vermillion};text-decoration:none;">shoptees.ng/shop</a>
    </p>`;

  const html = shell(body);

  const text = [
    `Order ${o.orderNumber} confirmed — Shoptees`,
    ``,
    `Thank you, ${o.customer.firstName}.`,
    ``,
    `Items:`,
    ...o.items.map((i) => `  ${String(o.items.indexOf(i) + 1).padStart(2, "0")}  ${i.productName} (SIZE ${i.variantSize}) × ${i.quantity} — ${lineTotal(o, i)}`),
    ``,
    `Subtotal: ${money(o, o.subtotalNGN, o.subtotalMinor)}`,
    `Shipping: Paid on delivery`,
    `Total:    ${money(o, o.totalNGN, o.totalMinor)}`,
    ``,
    o.address
      ? [
          `Deliver to:`,
          `  ${o.customer.firstName} ${o.customer.lastName}`,
          `  ${o.address.line1}`,
          o.address.line2 ? `  ${o.address.line2}` : null,
          `  ${o.address.city}, ${o.address.state}${o.address.postal ? ` ${o.address.postal}` : ""}`,
        ].filter(Boolean).join("\n")
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

  const body = `
    ${stamp("New order")}
    <h1 style="margin:16px 0 4px;font-family:monospace,'Courier New',Courier;font-size:28px;font-weight:700;color:${C.ink};">
      ${escapeHtml(o.orderNumber)}
    </h1>
    <p style="margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${C.muted};">
      ${escapeHtml(o.customer.firstName)} ${escapeHtml(o.customer.lastName)} ·
      <a href="mailto:${escapeHtml(o.customer.email)}" style="color:${C.vermillion};text-decoration:none;">${escapeHtml(o.customer.email)}</a>
      ${o.customer.phone ? ` · <a href="https://wa.me/${o.customer.phone.replace(/\D/g, "")}" style="color:${C.muted};text-decoration:none;">${escapeHtml(o.customer.phone)}</a>` : ""}
    </p>

    ${sectionLabel("Items")}
    ${itemsTable(o)}
    <p style="margin:12px 0 0;font-family:monospace,'Courier New',Courier;font-size:18px;font-weight:700;color:${C.ink};">Total: ${formatNaira(o.totalNGN)}</p>
    ${presentmentNote(o)}

    ${o.address ? `
      ${sectionLabel("Deliver to")}
      ${addressBlock(o)}
    ` : ""}

    ${ctaButton("View in admin", orderLink)}`;

  const html = shell(body);

  const text = [
    `New paid order: ${o.orderNumber}`,
    ``,
    `${o.customer.firstName} ${o.customer.lastName} · ${o.customer.email}${o.customer.phone ? ` · ${o.customer.phone}` : ""}`,
    ``,
    `Items:`,
    ...o.items.map((i) => `  ${i.productName} (SIZE ${i.variantSize}) × ${i.quantity} — ${lineTotal(o, i)}`),
    ``,
    `Total: ${formatNaira(o.totalNGN)}`,
    ...(isForeign(o) ? [`Customer paid: ${money(o, o.totalNGN, o.totalMinor)} at ₦${o.fxRateNgnPerUnit}/${o.currency}`] : []),
    ``,
    o.address
      ? [
          `Deliver to:`,
          `  ${o.customer.firstName} ${o.customer.lastName}`,
          `  ${o.address.line1}`,
          o.address.line2 ? `  ${o.address.line2}` : null,
          `  ${o.address.city}, ${o.address.state}${o.address.postal ? ` ${o.address.postal}` : ""}`,
        ].filter(Boolean).join("\n")
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

  const body = `
    ${stamp("New message")}
    <h1 style="margin:16px 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:900;letter-spacing:-0.02em;color:${C.ink};">
      ${escapeHtml(args.name)}
    </h1>
    <p style="margin:4px 0 0;font-family:monospace,'Courier New',Courier;font-size:12px;">
      <a href="mailto:${escapeHtml(args.email)}" style="color:${C.vermillion};text-decoration:none;">${escapeHtml(args.email)}</a>
    </p>

    ${sectionLabel("Message")}
    <div style="border-left:3px solid ${C.vermillion};padding:10px 16px;color:${C.ink};line-height:1.65;font-family:Arial,Helvetica,sans-serif;font-size:14px;">
      ${safeMsg}
    </div>

    <p style="margin:24px 0 0;font-family:monospace,'Courier New',Courier;font-size:11px;color:${C.muted};">
      Reply directly to this email to respond.
    </p>`;

  const html = shell(body);

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

  const body = `
    ${stamp("Dispatch list · 01")}
    <h1 style="margin:16px 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:36px;font-weight:900;letter-spacing:-0.02em;line-height:1.1;color:${C.ink};">
      You're on<br>the list.
    </h1>

    <p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:${C.muted};font-family:Arial,Helvetica,sans-serif;">
      Drops, restocks, a few photographs. Never more than four times a year —
      and no fluff in between.
    </p>

    <div style="margin:28px 0;border-top:2px solid ${C.ink};border-bottom:2px solid ${C.ink};padding:14px 0;">
      <p style="margin:0;font-family:monospace,'Courier New',Courier;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${C.muted};">
        What to expect: drops · restocks · limited releases
      </p>
    </div>

    <a href="${siteConfig.url}/shop" style="display:inline-block;background:${C.vermillion};color:${C.paper};text-decoration:none;padding:13px 22px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
      Browse the shop →
    </a>

    <p style="margin:28px 0 0;font-family:monospace,'Courier New',Courier;font-size:11px;color:${C.muted};">
      — The Shoptees team
    </p>`;

  const html = shell(body);

  const text = [
    `You're on the list — Shoptees`,
    ``,
    `Drops, restocks, a few photographs. Never more than four times a year.`,
    ``,
    `Browse the shop: ${siteConfig.url}/shop`,
    ``,
    `— The Shoptees team`,
  ].join("\n");

  return { subject, html, text };
}

export function adminInviteEmail(args: {
  inviteUrl: string;
  invitedByName: string;
  brandName: string;
}) {
  const subject = `You've been invited to the ${args.brandName} admin`;

  const body = `
    ${stamp("Studio access")}
    <h1 style="margin:16px 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:32px;font-weight:900;letter-spacing:-0.02em;line-height:1.1;color:${C.ink};">
      You're invited.
    </h1>
    <p style="margin:10px 0 0;font-size:14px;line-height:1.7;color:${C.muted};font-family:Arial,Helvetica,sans-serif;">
      <strong style="color:${C.ink};">${escapeHtml(args.invitedByName)}</strong> has invited you to join
      the <strong style="color:${C.ink};">${escapeHtml(args.brandName)}</strong> admin.
      Click below to set your password and get started — the link expires in <strong style="color:${C.ink};">7 days</strong>.
    </p>

    ${ctaButton("Accept invitation", args.inviteUrl)}

    <p style="margin:24px 0 0;font-family:monospace,'Courier New',Courier;font-size:11px;color:${C.muted};word-break:break-all;">
      Or paste this link:<br>${escapeHtml(args.inviteUrl)}
    </p>`;

  const html = shell(body);

  const text = [
    `You're invited to the ${args.brandName} admin`,
    ``,
    `${args.invitedByName} has invited you to join the admin.`,
    `Set your password and get started (link expires in 7 days):`,
    args.inviteUrl,
  ].join("\n");

  return { subject, html, text };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
