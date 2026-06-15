// Daily booking reminder — triggered by Vercel Cron (see vercel.json).
// Finds bookings whose event is 3 days away and sends a WhatsApp reminder
// (via CallMeBot) with the full client details, then marks them as reminded
// so they are never sent twice.

import {
  sendWhatsApp,
  fetchBookingsOnDate,
  markReminderSent,
  formatDateISO,
} from "./_lib.js";

const REMINDER_DAYS_AHEAD = 3;

function buildReminderMessage(b) {
  const location = [b.event_city, b.event_country].filter(Boolean).join(", ") || "—";
  return (
    `⏰ EVENT REMINDER — Shime Events\n\n` +
    `An event is coming up in ${REMINDER_DAYS_AHEAD} days:\n\n` +
    `👤 Client: ${b.full_name || "—"}\n` +
    `🎊 Event: ${b.event_type || "—"}\n` +
    `📦 Package: ${b.plan || "—"}\n` +
    `📅 Date: ${b.event_date || "—"} at ${b.event_time || "—"}\n` +
    `📍 Location: ${location}\n` +
    `📞 Client phone: ${b.phone_number || "—"}\n` +
    `🔖 Ref: ${b.booking_ref || "—"}\n\n` +
    `— Shime Events & Planning`
  );
}

export default async (req, res) => {
  // Auth: Vercel Cron automatically sends "Authorization: Bearer <CRON_SECRET>".
  // Also accept ?secret= for manual/local testing.
  const expected = process.env.CRON_SECRET;
  const authHeader = req.headers?.authorization || "";
  const querySecret = req.query?.secret;
  const authorized =
    expected && (authHeader === `Bearer ${expected}` || querySecret === expected);

  if (!authorized) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const target = new Date();
    target.setDate(target.getDate() + REMINDER_DAYS_AHEAD);
    const dateStr = formatDateISO(target);

    const ownerPhone = process.env.CALLMEBOT_PHONE;
    const ownerKey = process.env.CALLMEBOT_APIKEY;
    if (!ownerPhone || !ownerKey) {
      return res.status(500).json({
        error: "CallMeBot not configured (CALLMEBOT_PHONE / CALLMEBOT_APIKEY)",
      });
    }

    const all = await fetchBookingsOnDate(dateStr);
    const pending = all.filter((b) => !b.reminder_sent);

    if (pending.length === 0) {
      return res.status(200).json({
        ok: true,
        date: dateStr,
        found: all.length,
        sent: 0,
        message: "No bookings need a reminder",
      });
    }

    let sent = 0;
    const results = [];
    for (const b of pending) {
      const r = await sendWhatsApp(ownerPhone, ownerKey, buildReminderMessage(b));
      if (r.ok) {
        await markReminderSent(b.booking_ref);
        sent++;
      }
      results.push({ ref: b.booking_ref, ok: r.ok, reason: r.reason });
      // CallMeBot rate-limits; space out sends
      await new Promise((resolve) => setTimeout(resolve, 4000));
    }

    return res.status(200).json({ ok: true, date: dateStr, found: pending.length, sent, results });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
