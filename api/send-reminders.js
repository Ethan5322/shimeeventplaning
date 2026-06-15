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

function formatBooking(b, i) {
  const location = [b.event_city, b.event_country].filter(Boolean).join(", ") || "—";
  return (
    `${i}. ${b.full_name || "—"}\n` +
    `   🎊 ${b.event_type || "—"} • ${b.plan || "—"}\n` +
    `   📅 ${b.event_date || "—"} at ${b.event_time || "—"}\n` +
    `   📍 ${location}\n` +
    `   📞 ${b.phone_number || "—"}  •  🔖 ${b.booking_ref || "—"}`
  );
}

// Build ONE digest message for all bookings due — CallMeBot's free tier
// rate-limits multiple sends, so a single message is far more reliable.
function buildDigest(bookings) {
  const header =
    `⏰ EVENT REMINDER — Shime Events\n\n` +
    `${bookings.length} event(s) coming up in ${REMINDER_DAYS_AHEAD} days:\n\n`;
  const body = bookings.map((b, idx) => formatBooking(b, idx + 1)).join("\n\n");
  return header + body + `\n\n— Shime Events & Planning`;
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

    // Send a single digest (CallMeBot free tier rate-limits multiple sends)
    const r = await sendWhatsApp(ownerPhone, ownerKey, buildDigest(pending));

    if (r.ok) {
      // Mark all as reminded only if the digest went through
      for (const b of pending) {
        await markReminderSent(b.booking_ref);
      }
    }

    return res.status(200).json({
      ok: r.ok,
      date: dateStr,
      found: pending.length,
      sent: r.ok ? pending.length : 0,
      reason: r.reason,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
