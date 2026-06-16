// Instant owner notification — called by the public site right after a
// booking is saved. Sends the business owner a WhatsApp (via CallMeBot)
// with the new booking's details so they know immediately.

import { sendWhatsApp } from "./_lib.js";

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const b = req.body || {};
    const ownerPhone = process.env.CALLMEBOT_PHONE;
    const ownerKey = process.env.CALLMEBOT_APIKEY;
    if (!ownerPhone || !ownerKey) {
      // Not configured — succeed quietly so the booking flow is never blocked
      return res.status(200).json({ ok: false, reason: "CallMeBot not configured" });
    }

    const dash = (v) => (v === 0 || v ? String(v) : "—");
    const money = (v) =>
      v === 0 || v ? `ETB ${Number(v).toLocaleString("en-US")}` : "—";

    const location =
      [b.eventLocation, b.eventCity, b.eventCountry].filter(Boolean).join(", ") ||
      "—";
    const dateTime =
      [b.eventDate, b.eventTime].filter(Boolean).join(" at ") || "—";

    const msg =
      `🎉 *NEW BOOKING — Shime Events*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `👤 *CLIENT*\n` +
      `• Name: ${dash(b.fullName)}\n` +
      `• Phone: ${dash(b.phoneNumber)}\n` +
      `• Email: ${dash(b.email)}\n` +
      `• Residence: ${dash(b.residency)}\n` +
      `• Preferred contact: ${dash(b.contactMethod)}\n\n` +
      `🎊 *EVENT*\n` +
      `• Type: ${dash(b.eventType)}\n` +
      `• Package: ${dash(b.plan)}\n` +
      `• Guests: ${dash(b.guestCount)}\n` +
      `• Date: ${dateTime}\n` +
      `• Location: ${location}\n` +
      `• Theme: ${dash(b.specialTheme)}\n\n` +
      `💰 *PAYMENT*\n` +
      `• Booking fee (non-refundable): ${money(b.bookingFee)}\n` +
      `• Next: contact the client with the full service price.\n` +
      `• Service price: 50% at least 15 days before the event, remaining 50% on the event day.\n\n` +
      `🔖 *REFERENCE*\n` +
      `• Booking Ref: ${dash(b.bookingRef)}\n` +
      `• Verification PIN: ${dash(b.verificationPin)}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `— Shime Events & Planning`;

    const r = await sendWhatsApp(ownerPhone, ownerKey, msg);
    return res.status(200).json({ ok: r.ok, reason: r.reason });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
