// Shared helpers for Shime serverless functions.
// Files prefixed with "_" are NOT exposed as routes by Vercel.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

// Format a Date as YYYY-MM-DD (UTC).
export function formatDateISO(d) {
  return d.toISOString().split("T")[0];
}

// Send a WhatsApp message through CallMeBot.
// Note: CallMeBot only delivers to a phone number that has personally
// registered with CallMeBot and whose apikey is used here (typically the
// business owner's own number).
export async function sendWhatsApp(phone, apikey, text) {
  if (!phone || !apikey) return { ok: false, reason: "missing phone or apikey" };
  const clean = String(phone).replace(/[^0-9]/g, "");
  const url =
    `https://api.callmebot.com/whatsapp.php?phone=${clean}` +
    `&text=${encodeURIComponent(text)}&apikey=${apikey}`;
  try {
    const r = await fetch(url);
    const body = await r.text();
    const ok = r.ok && !/error|invalid|not found/i.test(body);
    return { ok, reason: ok ? "sent" : body.slice(0, 200) };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

// Fetch all bookings for a given event_date (YYYY-MM-DD).
export async function fetchBookingsOnDate(dateStr) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  const url =
    `${SUPABASE_URL}/rest/v1/shime_bookings` +
    `?select=*&event_date=eq.${dateStr}`;
  const r = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!r.ok) return [];
  return await r.json();
}

// Mark a booking (by booking_ref) as having had its reminder sent.
export async function markReminderSent(bookingRef) {
  if (!SUPABASE_URL || !SUPABASE_KEY || !bookingRef) return;
  const url =
    `${SUPABASE_URL}/rest/v1/shime_bookings` +
    `?booking_ref=eq.${encodeURIComponent(bookingRef)}`;
  await fetch(url, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ reminder_sent: true }),
  });
}
