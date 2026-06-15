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

    const location = [b.eventCity, b.eventCountry].filter(Boolean).join(", ") || "—";
    const msg =
      `🎉 NEW BOOKING — Shime Events\n\n` +
      `👤 Client: ${b.fullName || "—"}\n` +
      `📞 Phone: ${b.phoneNumber || "—"}\n` +
      `✉️ Email: ${b.email || "—"}\n` +
      `🎊 Event: ${b.eventType || "—"}\n` +
      `📦 Package: ${b.plan || "—"}\n` +
      `📅 Date: ${b.eventDate || "—"} at ${b.eventTime || "—"}\n` +
      `📍 Location: ${location}\n` +
      `🔖 Ref: ${b.bookingRef || "—"}\n` +
      `🔐 PIN: ${b.verificationPin || "—"}\n\n` +
      `— Shime Events & Planning`;

    const r = await sendWhatsApp(ownerPhone, ownerKey, msg);
    return res.status(200).json({ ok: r.ok, reason: r.reason });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
