import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "./supabaseClient";

// bookingFee = non-refundable fee to reserve the plan (separate from service price).
const PACKAGES = [
  { name: "Signature", price: 5000, bookingFee: 1500, description: "Basic event planning" },
  { name: "Elegance", price: 10000, bookingFee: 3000, description: "Premium event planning" },
  { name: "Premium", price: 20000, bookingFee: 5000, description: "Exclusive event planning" },
  { name: "Exclusive", price: 40000, bookingFee: 8000, description: "Ultimate event planning" },
];

// ─── PDF Generator ────────────────────────────────────────────────────────────
const generateBookingPDF = (booking) => {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const gold = [212, 175, 55];
  const white = [255, 255, 255];
  const darkBg = [26, 26, 46];

  const pkgInfo = PACKAGES.find(p => p.name === booking.plan);
  const bookingFee = booking.deposit_amount || pkgInfo?.bookingFee || 0;
  const today = new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });

  // Background
  doc.setFillColor(...darkBg);
  doc.rect(0, 0, pw, ph, "F");

  // Header
  doc.setTextColor(...gold);
  doc.setFontSize(28);
  doc.text("SHIME EVENTS & PLANNING", pw / 2, 22, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(...white);
  doc.text("Professional Event Planning & Coordination", pw / 2, 30, { align: "center" });

  doc.setDrawColor(...gold);
  doc.setLineWidth(0.8);
  doc.line(15, 35, pw - 15, 35);

  // Title
  doc.setFontSize(14);
  doc.setTextColor(...gold);
  doc.text("BOOKING CONFIRMATION", pw / 2, 44, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(...white);
  doc.text(`Reference: ${booking.booking_ref || "N/A"}`, pw / 2, 51, { align: "center" });
  doc.text(`Printed: ${today}`, pw / 2, 57, { align: "center" });

  doc.setLineWidth(0.3);
  doc.line(15, 61, pw - 15, 61);

  // Section helper
  let y = 70;
  const sectionTitle = (title) => {
    doc.setFontSize(10);
    doc.setTextColor(...gold);
    doc.text(title, 15, y);
    doc.setLineWidth(0.3);
    doc.line(15, y + 2, pw - 15, y + 2);
    y += 10;
  };
  const row = (label, value) => {
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text(`${label}:`, 20, y);
    doc.setTextColor(...white);
    doc.text(String(value || "N/A"), 70, y);
    y += 7;
  };

  // Personal
  sectionTitle("PERSONAL INFORMATION");
  row("Full Name", booking.full_name);
  row("Email", booking.email);
  row("Phone", booking.phone_number);
  row("Residency", booking.residency);
  y += 4;

  // Event
  sectionTitle("EVENT DETAILS");
  row("Event Type", booking.event_type);
  row("Package", booking.plan);
  row("Date", booking.event_date);
  row("Time", booking.event_time);
  row("Location", `${booking.event_city || ""}, ${booking.event_country || ""}`);
  row("Venue", booking.event_location);
  row("Special Theme", booking.special_theme);
  y += 4;

  // Payment
  sectionTitle("PAYMENT INFORMATION");
  row("Booking Fee (Non-Refundable)", `ETB ${bookingFee.toLocaleString()}`);
  row("Payment Status", booking.payment_status === "completed" || booking.payment_status === "manual" ? "PAID" : "PENDING");
  row("Booking Status", booking.booking_status === "deposit_paid" ? "BOOKING FEE PAID" : "AWAITING");
  row("Verification PIN", booking.verification_pin);
  y += 4;

  // Footer
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.line(15, ph - 25, pw - 15, ph - 25);
  doc.setFontSize(8);
  doc.setTextColor(...gold);
  doc.text("Shime Events & Planning", pw / 2, ph - 18, { align: "center" });
  doc.setTextColor(150, 150, 150);
  doc.text("This document is an official booking confirmation. Keep it for your records.", pw / 2, ph - 12, { align: "center" });

  const filename = `ShimeBooking_${booking.booking_ref || Date.now()}.pdf`;
  doc.save(filename);
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminPanel = ({ onLogout }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [currentScreen, setCurrentScreen] = useState("menu");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Today's bookings
  const [todayBookings, setTodayBookings] = useState([]);
  const [todayLoading, setTodayLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // Verify lookup
  const [verificationCode, setVerificationCode] = useState("");
  const [bookingDetails, setBookingDetails] = useState(null);

  // Manual booking
  const [bookingForm, setBookingForm] = useState({
    fullName: "", email: "", phoneNumber: "",
    residency: "", contactMethod: "phone",
    eventType: "", plan: "", guestCount: "", specialTheme: "",
    eventCountry: "", eventCity: "", eventLocation: "",
    eventDate: "", eventTime: "", paymentType: "manual",
  });
  const [bookingStep, setBookingStep] = useState(1);
  const [savedBooking, setSavedBooking] = useState(null);

  // Block dates
  const [blockedDates, setBlockedDates] = useState([]);
  const [blockedLoading, setBlockedLoading] = useState(false);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");

  const showMsg = (msg, type = "info") => {
    if (type === "success") { setSuccess(msg); setTimeout(() => setSuccess(""), 6000); }
    else { setError(msg); } // errors stay visible until next action
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleAdminLogin = () => {
    const correct = import.meta.env.VITE_ADMIN_PASSWORD;
    if (!correct) { showMsg("Admin password not configured", "error"); return; }
    if (adminPassword === correct) {
      setIsAuthenticated(true);
      setAdminPassword("");
      setPasswordError("");
      setCurrentScreen("menu");
    } else {
      setPasswordError("❌ Invalid admin password. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen("menu");
    setVerificationCode("");
    setBookingDetails(null);
    setAdminPassword("");
    setPasswordError("");
    setSavedBooking(null);
    if (onLogout) onLogout();
  };

  // ── Load Today's Bookings ──────────────────────────────────────────────────
  const loadTodayBookings = async () => {
    if (!supabase) { showMsg("Database not configured", "error"); return; }
    setTodayLoading(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const startOfDay = `${todayStr}T00:00:00.000Z`;
      const endOfDay = `${todayStr}T23:59:59.999Z`;

      const [createdRes, eventRes] = await Promise.all([
        supabase.from("shime_bookings").select("*")
          .gte("created_at", startOfDay).lte("created_at", endOfDay)
          .order("created_at", { ascending: false }),
        supabase.from("shime_bookings").select("*")
          .eq("event_date", todayStr)
          .order("event_time", { ascending: true }),
      ]);

      const combined = [...(createdRes.data || []), ...(eventRes.data || [])];
      const unique = combined.filter((b, i, arr) =>
        arr.findIndex(x => x.id === b.id) === i
      );
      setTodayBookings(unique);
    } catch (err) {
      showMsg(`Error loading bookings: ${err.message}`, "error");
    } finally {
      setTodayLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && currentScreen === "today") {
      loadTodayBookings();
    }
    if (isAuthenticated && currentScreen === "blockdates") {
      loadBlockedDates();
    }
  }, [isAuthenticated, currentScreen]);

  // ── Verify Booking ─────────────────────────────────────────────────────────
  const handleSearchBooking = async () => {
    if (!verificationCode.trim()) { showMsg("Please enter a verification code", "error"); return; }
    if (!supabase) { showMsg("Database not configured", "error"); return; }
    setLoading(true);
    setBookingDetails(null);
    const code = verificationCode.trim().toUpperCase();
    try {
      // Try verification_pin first
      let { data, error: qErr } = await supabase
        .from("shime_bookings")
        .select("*")
        .eq("verification_pin", code)
        .maybeSingle();

      // Fallback: try booking_ref (client may share their reference number)
      if (!data && !qErr) {
        const res = await supabase
          .from("shime_bookings")
          .select("*")
          .eq("booking_ref", code)
          .maybeSingle();
        data = res.data;
        qErr = res.error;
      }

      if (qErr) {
        showMsg(`Error: ${qErr.message}`, "error");
      } else if (data) {
        setBookingDetails(data);
        showMsg("✅ Booking found!", "success");
      } else {
        showMsg("❌ No booking found with this verification code", "error");
      }
    } catch (err) {
      showMsg(`Error: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Block Dates ────────────────────────────────────────────────────────────
  const loadBlockedDates = async () => {
    if (!supabase) { showMsg("Database not configured", "error"); return; }
    setBlockedLoading(true);
    try {
      const { data, error: qErr } = await supabase
        .from("shime_blocked_dates")
        .select("*")
        .order("blocked_date", { ascending: true });
      if (qErr) showMsg(`Error: ${qErr.message}`, "error");
      else setBlockedDates(data || []);
    } catch (err) {
      showMsg(`Error: ${err.message}`, "error");
    } finally {
      setBlockedLoading(false);
    }
  };

  const handleAddBlockedDate = async () => {
    if (!newBlockDate) { showMsg("Please pick a date to block", "error"); return; }
    if (!supabase) { showMsg("Database not configured", "error"); return; }
    if (blockedDates.some((b) => b.blocked_date === newBlockDate)) {
      showMsg("That date is already blocked", "error");
      return;
    }
    setBlockedLoading(true);
    try {
      const { error: insErr } = await supabase
        .from("shime_blocked_dates")
        .insert([{ blocked_date: newBlockDate, reason: newBlockReason.trim() || null, created_at: new Date().toISOString() }]);
      if (insErr) {
        setError(`❌ Could not block date: ${insErr.message} (code: ${insErr.code})`);
      } else {
        showMsg(`✅ ${newBlockDate} blocked — clients can no longer book it`, "success");
        setNewBlockDate("");
        setNewBlockReason("");
        await loadBlockedDates();
      }
    } catch (err) {
      setError(`❌ Unexpected error: ${err.message}`);
    } finally {
      setBlockedLoading(false);
    }
  };

  const handleRemoveBlockedDate = async (id) => {
    if (!supabase) { showMsg("Database not configured", "error"); return; }
    setBlockedLoading(true);
    try {
      const { error: delErr } = await supabase
        .from("shime_blocked_dates")
        .delete()
        .eq("id", id);
      if (delErr) showMsg(`Error: ${delErr.message}`, "error");
      else { showMsg("✅ Date unblocked", "success"); await loadBlockedDates(); }
    } catch (err) {
      showMsg(`Error: ${err.message}`, "error");
    } finally {
      setBlockedLoading(false);
    }
  };

  // ── Save Manual Booking ────────────────────────────────────────────────────
  const handleSaveManualBooking = async () => {
    if (!bookingForm.fullName.trim()) { showMsg("Please enter customer name", "error"); return; }
    if (!bookingForm.email.trim()) { showMsg("Please enter email", "error"); return; }
    if (!bookingForm.phoneNumber.trim()) { showMsg("Please enter phone number", "error"); return; }
    if (!bookingForm.plan) { showMsg("Please select a package plan", "error"); return; }
    if (!bookingForm.eventDate) { showMsg("Please enter event date", "error"); return; }
    if (!bookingForm.eventTime) { showMsg("Please enter event time", "error"); return; }
    if (!supabase) { showMsg("Database not configured", "error"); return; }

    setLoading(true);
    setError("");
    try {
      const verificationPin = `ADM${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const pkgInfo = PACKAGES.find(p => p.name === bookingForm.plan);
      const depositAmount = pkgInfo?.bookingFee || 0; // non-refundable booking fee
      const bookingRef = `SE-${Date.now()}`;

      // Only include columns that exist in the shime_bookings table
      const record = {
        booking_ref: bookingRef,
        verification_pin: verificationPin,
        full_name: bookingForm.fullName.trim(),
        email: bookingForm.email.trim().toLowerCase(),
        phone_number: bookingForm.phoneNumber.trim(),
        residency: bookingForm.residency || null,
        contact_method: bookingForm.contactMethod || "phone",
        event_type: bookingForm.eventType || null,
        plan: bookingForm.plan,
        event_date: bookingForm.eventDate,
        event_time: bookingForm.eventTime,
        event_country: bookingForm.eventCountry || null,
        event_city: bookingForm.eventCity || null,
        event_location: bookingForm.eventLocation || null,
        deposit_amount: depositAmount,
        payment_status: bookingForm.paymentType === "manual" ? "manual" : "pending",
        booking_status: bookingForm.paymentType === "manual" ? "deposit_paid" : "awaiting_payment",
        calendar_type: "gregorian",
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase.from("shime_bookings").insert([record]);

      if (insertError) {
        // Show full error permanently so user can read it
        setError(`❌ Save failed: ${insertError.message} (code: ${insertError.code})`);
      } else {
        // Store display copy with extra fields for PDF (not saved to DB)
        setSavedBooking({
          ...record,
          guest_count: bookingForm.guestCount,
          special_theme: bookingForm.specialTheme,
        });
        setSuccess(`✅ Booking saved! Reference: ${bookingRef} | PIN: ${verificationPin}`);
        setBookingForm({
          fullName: "", email: "", phoneNumber: "",
          residency: "", contactMethod: "phone",
          eventType: "", plan: "", guestCount: "", specialTheme: "",
          eventCountry: "", eventCity: "", eventLocation: "",
          eventDate: "", eventTime: "", paymentType: "manual",
        });
        setBookingStep(5);
      }
    } catch (err) {
      setError(`❌ Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "N/A";
    try { return new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" }); }
    catch { return d; }
  };

  // ── Shared: Alerts ─────────────────────────────────────────────────────────
  const Alerts = () => (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-900 border-2 border-red-500 rounded-lg flex justify-between items-start gap-3">
          <p className="text-red-200 font-semibold text-sm break-all">{error}</p>
          <button onClick={() => setError("")} className="text-red-400 hover:text-white text-lg font-bold shrink-0">✕</button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-900 border-2 border-green-500 rounded-lg text-green-200 font-semibold text-sm">{success}</div>
      )}
    </>
  );

  const HeaderBar = ({ title, subtitle }) => (
    <div className="flex flex-wrap justify-between items-center bg-slate-800 border-2 border-yellow-500 rounded-xl p-4 sm:p-6 shadow-2xl mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400">{title}</h1>
        {subtitle && <p className="text-gray-300 text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="flex gap-2 mt-3 sm:mt-0">
        {currentScreen !== "menu" && (
          <button onClick={() => { setCurrentScreen("menu"); setSavedBooking(null); setBookingStep(1); }}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-bold transition text-sm">
            ← Menu
          </button>
        )}
        <button onClick={handleLogout}
          className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold transition text-sm">
          🔓 Logout
        </button>
      </div>
    </div>
  );

  // ── Detail Card (reused in both sections) ─────────────────────────────────
  const BookingDetailCard = ({ b, accentColor = "yellow" }) => {
    const pkgInfo = PACKAGES.find(p => p.name === b.plan);
    const bookingFee = b.deposit_amount || pkgInfo?.bookingFee || 0;
    const isPaid = b.payment_status === "completed" || b.payment_status === "manual";

    const colorMap = {
      yellow: "border-yellow-500",
      blue: "border-blue-500",
    };
    const borderClass = colorMap[accentColor] || "border-yellow-500";

    return (
      <div className={`bg-slate-900 border-2 ${borderClass} rounded-xl p-5 space-y-5`}>
        {/* Personal */}
        <div>
          <h4 className="text-yellow-400 font-bold mb-3 text-sm uppercase tracking-wide">👤 Personal Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ["Full Name", b.full_name],
              ["Email", b.email],
              ["Phone", b.phone_number],
              ["Residency", b.residency],
            ].map(([label, val]) => (
              <div key={label} className="bg-slate-800 p-3 rounded-lg">
                <p className="text-gray-400 text-xs font-semibold mb-1">{label.toUpperCase()}</p>
                <p className="text-white font-semibold text-sm break-all">{val || "N/A"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Event */}
        <div>
          <h4 className="text-green-400 font-bold mb-3 text-sm uppercase tracking-wide">🎊 Event Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ["Event Type", b.event_type],
              ["Package", b.plan],
              ["Date", formatDate(b.event_date)],
              ["Time", b.event_time],
              ["Guests", b.guest_count],
              ["Special Theme", b.special_theme],
              ["City", b.event_city],
              ["Country", b.event_country],
              ["Venue", b.event_location],
            ].map(([label, val]) => (
              <div key={label} className="bg-slate-800 p-3 rounded-lg">
                <p className="text-gray-400 text-xs font-semibold mb-1">{label.toUpperCase()}</p>
                <p className="text-white font-semibold text-sm">{val || "N/A"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div>
          <h4 className="text-purple-400 font-bold mb-3 text-sm uppercase tracking-wide">💳 Payment Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-800 p-3 rounded-lg">
              <p className="text-gray-400 text-xs font-semibold mb-1">BOOKING FEE (NON-REFUNDABLE)</p>
              <p className="text-yellow-300 font-bold text-lg">ETB {bookingFee.toLocaleString()}</p>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg">
              <p className="text-gray-400 text-xs font-semibold mb-1">PAYMENT STATUS</p>
              <p className={`font-bold text-sm px-2 py-1 rounded text-center inline-block ${isPaid ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"}`}>
                {isPaid ? "✅ PAID" : "⏳ PENDING"}
              </p>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg">
              <p className="text-gray-400 text-xs font-semibold mb-1">BOOKING REFERENCE</p>
              <p className="text-white font-mono font-bold text-sm">{b.booking_ref || "N/A"}</p>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg">
              <p className="text-gray-400 text-xs font-semibold mb-1">VERIFICATION PIN</p>
              <p className="text-yellow-300 font-mono font-bold text-lg tracking-widest">{b.verification_pin || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Download PDF */}
        <button
          onClick={() => generateBookingPDF(b)}
          className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition transform hover:scale-105 text-sm"
        >
          ⬇️ Download Booking PDF
        </button>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 border-2 border-yellow-500 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-4xl font-bold text-yellow-400">ADMIN</h1>
            <p className="text-gray-300 mt-2">Shime Events & Planning</p>
            <p className="text-gray-500 text-xs mt-1">Secure Administrator Portal</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">Admin Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => { setAdminPassword(e.target.value); setPasswordError(""); }}
                onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-30"
                autoFocus
              />
              {passwordError && <p className="text-red-400 text-sm mt-2 font-semibold">{passwordError}</p>}
            </div>

            <button
              onClick={handleAdminLogin}
              className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition transform hover:scale-105 text-lg"
            >
              🔓 LOGIN
            </button>
          </div>

          <p className="text-gray-500 text-xs text-center mt-6">Password protected — authorised personnel only</p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MENU SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (currentScreen === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-8">
        <div className="w-full max-w-3xl mx-auto">
          <HeaderBar title="📊 ADMIN DASHBOARD" subtitle="Shime Events & Planning" />
          <Alerts />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section 1 */}
            <button
              onClick={() => setCurrentScreen("today")}
              className="group bg-gradient-to-br from-slate-800 to-slate-700 border-2 border-green-500 hover:border-green-400 rounded-xl p-8 shadow-2xl transition transform hover:scale-105 text-left"
            >
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">Bookings Today</h3>
              <p className="text-gray-300 text-sm mb-4">View all bookings created or scheduled for today, and manually book a new client.</p>
              <div className="text-green-300 text-xs bg-green-900 bg-opacity-30 p-2 rounded">
                View details • Add manual booking • Download PDF
              </div>
            </button>

            {/* Section 2 */}
            <button
              onClick={() => { setCurrentScreen("verify"); setVerificationCode(""); setBookingDetails(null); }}
              className="group bg-gradient-to-br from-slate-800 to-slate-700 border-2 border-blue-500 hover:border-blue-400 rounded-xl p-8 shadow-2xl transition transform hover:scale-105 text-left"
            >
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-blue-400 mb-2">Check Upcoming Event</h3>
              <p className="text-gray-300 text-sm mb-4">Enter the verification code sent to the client during booking to view their full details.</p>
              <div className="text-blue-300 text-xs bg-blue-900 bg-opacity-30 p-2 rounded">
                Enter PIN • View client details • Download PDF
              </div>
            </button>

            {/* Section 3 */}
            <button
              onClick={() => setCurrentScreen("blockdates")}
              className="group bg-gradient-to-br from-slate-800 to-slate-700 border-2 border-red-500 hover:border-red-400 rounded-xl p-8 shadow-2xl transition transform hover:scale-105 text-left md:col-span-2"
            >
              <div className="text-5xl mb-4">🚫</div>
              <h3 className="text-2xl font-bold text-red-400 mb-2">Block / Unblock Dates</h3>
              <p className="text-gray-300 text-sm mb-4">Mark dates as unavailable so clients can't book them. Booked and blocked dates are hidden from the public booking calendar automatically.</p>
              <div className="text-red-300 text-xs bg-red-900 bg-opacity-30 p-2 rounded">
                Block a date • View blocked dates • Unblock anytime
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TODAY'S BOOKINGS SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (currentScreen === "today") {
    const todayLabel = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-8">
        <div className="w-full max-w-5xl mx-auto">
          <HeaderBar title="📅 BOOKINGS TODAY" subtitle={todayLabel} />
          <Alerts />

          {/* Action bar */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => { setCurrentScreen("book"); setBookingStep(1); setSavedBooking(null); }}
              className="px-5 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition text-sm"
            >
              ✏️ Add Manual Booking
            </button>
            <button
              onClick={loadTodayBookings}
              disabled={todayLoading}
              className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition text-sm disabled:opacity-50"
            >
              {todayLoading ? "🔄 Loading..." : "🔄 Refresh"}
            </button>
          </div>

          {/* Booking list */}
          {todayLoading ? (
            <div className="text-center py-16 text-yellow-400 text-lg font-semibold">🔄 Loading today's bookings...</div>
          ) : todayBookings.length === 0 ? (
            <div className="bg-slate-800 border-2 border-gray-600 rounded-xl p-12 text-center">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-gray-300 text-lg font-semibold">No bookings for today</p>
              <p className="text-gray-500 text-sm mt-2">No bookings were created today and no events are scheduled for today.</p>
              <button
                onClick={() => { setCurrentScreen("book"); setBookingStep(1); setSavedBooking(null); }}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition"
              >
                ✏️ Add First Booking
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">{todayBookings.length} booking{todayBookings.length !== 1 ? "s" : ""} found</p>
              {todayBookings.map((b) => {
                const isPaid = b.payment_status === "completed" || b.payment_status === "manual";
                const isExpanded = expandedId === b.id;
                return (
                  <div key={b.id} className="bg-slate-800 border-2 border-green-500 border-opacity-50 rounded-xl overflow-hidden shadow-lg">
                    {/* Summary row */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : b.id)}
                      className="w-full p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-700 transition text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-slate-900 font-bold text-lg">
                          {(b.full_name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-bold">{b.full_name || "Unknown"}</p>
                          <p className="text-gray-400 text-xs">{b.event_type || "Event"} · {b.plan} · {formatDate(b.event_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${isPaid ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"}`}>
                          {isPaid ? "✅ PAID" : "⏳ PENDING"}
                        </span>
                        <span className="text-yellow-300 font-bold">ETB {(b.deposit_amount || 0).toLocaleString()}</span>
                        <span className="text-gray-400 text-lg">{isExpanded ? "▲" : "▼"}</span>
                      </div>
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="p-4 pt-0 border-t border-green-500 border-opacity-30">
                        <BookingDetailCard b={b} accentColor="yellow" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CHECK UPCOMING EVENT (VERIFY) SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (currentScreen === "verify") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <HeaderBar title="🔍 CHECK UPCOMING EVENT" subtitle="Enter client's verification code to view booking details" />
          <Alerts />

          {/* Search box */}
          <div className="bg-slate-800 border-2 border-blue-500 rounded-xl p-6 shadow-2xl mb-6">
            <h2 className="text-xl font-bold text-blue-400 mb-4">Enter Verification Code</h2>
            <p className="text-gray-400 text-sm mb-4">
              This is the PIN sent to the client when they completed their booking (e.g. <span className="font-mono text-yellow-300">ADMXYZ123</span>).
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => { setVerificationCode(e.target.value.toUpperCase()); setBookingDetails(null); }}
                onKeyPress={(e) => e.key === "Enter" && handleSearchBooking()}
                placeholder="e.g., ADMXYZ123"
                maxLength={12}
                className="flex-1 px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-30 uppercase font-mono text-lg tracking-widest"
              />
              <button
                onClick={handleSearchBooking}
                disabled={loading || !verificationCode.trim()}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "🔄" : "🔍"} SEARCH
              </button>
            </div>
          </div>

          {/* Results */}
          {bookingDetails && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-green-400">✅ Booking Found</h3>
                <button
                  onClick={() => { setBookingDetails(null); setVerificationCode(""); }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm transition"
                >
                  🔄 Search Another
                </button>
              </div>
              <BookingDetailCard b={bookingDetails} accentColor="blue" />
            </div>
          )}

          {!bookingDetails && !loading && verificationCode && (
            <div className="bg-slate-800 border-2 border-orange-500 rounded-xl p-8 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-orange-300 text-lg font-semibold">No booking found</p>
              <p className="text-gray-400 text-sm mt-2">Check the verification code and try again</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // BLOCK / UNBLOCK DATES SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (currentScreen === "blockdates") {
    const today = new Date().toISOString().split("T")[0];
    const fmt = (d) => {
      try { return new Date(d).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" }); }
      catch { return d; }
    };
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-8">
        <div className="w-full max-w-3xl mx-auto">
          <HeaderBar title="🚫 BLOCK / UNBLOCK DATES" subtitle="Manage which dates clients can book" />
          <Alerts />

          {/* Add a blocked date */}
          <div className="bg-slate-800 border-2 border-red-500 rounded-xl p-6 shadow-2xl mb-6">
            <h2 className="text-xl font-bold text-red-400 mb-4">Block a New Date</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2 text-sm">Date to block *</label>
                <input
                  type="date"
                  min={today}
                  value={newBlockDate}
                  onChange={(e) => setNewBlockDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400 focus:ring-opacity-20"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2 text-sm">Reason (optional)</label>
                <input
                  type="text"
                  value={newBlockReason}
                  onChange={(e) => setNewBlockReason(e.target.value)}
                  placeholder="e.g. Fully booked, holiday"
                  className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400 focus:ring-opacity-20"
                />
              </div>
            </div>
            <button
              onClick={handleAddBlockedDate}
              disabled={blockedLoading || !newBlockDate}
              className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-bold hover:from-red-700 hover:to-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {blockedLoading ? "🔄 Working..." : "🚫 Block This Date"}
            </button>
          </div>

          {/* List of blocked dates */}
          <div className="bg-slate-800 border-2 border-slate-600 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Currently Blocked Dates</h2>
              <button
                onClick={loadBlockedDates}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm transition"
              >
                🔄 Refresh
              </button>
            </div>

            {blockedLoading && blockedDates.length === 0 ? (
              <p className="text-gray-400 text-center py-6">Loading...</p>
            ) : blockedDates.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-gray-400">No dates are blocked. All future dates are available for booking.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {blockedDates.map((b) => (
                  <div key={b.id} className="flex items-center justify-between bg-slate-900 border border-red-500 border-opacity-40 rounded-lg p-4">
                    <div>
                      <p className="text-white font-semibold">{fmt(b.blocked_date)}</p>
                      {b.reason && <p className="text-gray-400 text-sm mt-1">📝 {b.reason}</p>}
                    </div>
                    <button
                      onClick={() => handleRemoveBlockedDate(b.id)}
                      disabled={blockedLoading}
                      className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm font-bold transition disabled:opacity-50"
                    >
                      ✓ Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MANUAL BOOKING SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (currentScreen === "book") {
    const totalSteps = 4;
    const inputCls = "w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-20";
    const labelCls = "block text-white font-semibold mb-2 text-sm";

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-8">
        <div className="w-full max-w-3xl mx-auto">
          <HeaderBar
            title="✏️ MANUAL BOOKING"
            subtitle={bookingStep <= totalSteps ? `Step ${bookingStep} of ${totalSteps}` : "Booking Complete"}
          />
          <Alerts />

          {/* Progress */}
          {bookingStep <= totalSteps && (
            <div className="mb-6">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500"
                  style={{ width: `${(bookingStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* ── Step 1: Personal ── */}
          {bookingStep === 1 && (
            <div className="bg-slate-800 border-2 border-blue-500 rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-blue-400 mb-6">👤 Personal Information</h2>
              <div className="space-y-4">
                <div><label className={labelCls}>Full Name *</label>
                  <input type="text" value={bookingForm.fullName} onChange={e => setBookingForm({...bookingForm, fullName: e.target.value})} placeholder="John Doe" className={inputCls} /></div>
                <div><label className={labelCls}>Email *</label>
                  <input type="email" value={bookingForm.email} onChange={e => setBookingForm({...bookingForm, email: e.target.value})} placeholder="john@example.com" className={inputCls} /></div>
                <div><label className={labelCls}>Phone Number *</label>
                  <input type="tel" value={bookingForm.phoneNumber} onChange={e => setBookingForm({...bookingForm, phoneNumber: e.target.value})} placeholder="+251911234567" className={inputCls} /></div>
                <div><label className={labelCls}>Residency</label>
                  <input type="text" value={bookingForm.residency} onChange={e => setBookingForm({...bookingForm, residency: e.target.value})} placeholder="Addis Ababa" className={inputCls} /></div>
              </div>
              <div className="mt-6">
                <button onClick={() => {
                  if (!bookingForm.fullName.trim() || !bookingForm.email.trim() || !bookingForm.phoneNumber.trim()) {
                    showMsg("Name, email, and phone are required", "error"); return;
                  }
                  setBookingStep(2);
                }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition">
                  NEXT →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Event Details ── */}
          {bookingStep === 2 && (
            <div className="bg-slate-800 border-2 border-green-500 rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-green-400 mb-6">🎊 Event Details</h2>
              <div className="space-y-4">
                <div><label className={labelCls}>Event Type *</label>
                  <input type="text" value={bookingForm.eventType} onChange={e => setBookingForm({...bookingForm, eventType: e.target.value})} placeholder="Wedding, Birthday, Conference..." className={inputCls} /></div>
                <div><label className={labelCls}>Package Plan *</label>
                  <select value={bookingForm.plan} onChange={e => setBookingForm({...bookingForm, plan: e.target.value})} className={inputCls}>
                    <option value="">Select a package...</option>
                    {PACKAGES.map(pkg => (
                      <option key={pkg.name} value={pkg.name}>{pkg.name} — Booking Fee: ETB {pkg.bookingFee.toLocaleString()}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Guest Count</label>
                    <input type="number" value={bookingForm.guestCount} onChange={e => setBookingForm({...bookingForm, guestCount: e.target.value})} placeholder="100" className={inputCls} /></div>
                  <div><label className={labelCls}>Special Theme</label>
                    <input type="text" value={bookingForm.specialTheme} onChange={e => setBookingForm({...bookingForm, specialTheme: e.target.value})} placeholder="Floral, Modern..." className={inputCls} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Event Date *</label>
                    <input type="date" value={bookingForm.eventDate} onChange={e => setBookingForm({...bookingForm, eventDate: e.target.value})} className={inputCls} /></div>
                  <div><label className={labelCls}>Event Time *</label>
                    <input type="time" min="00:00" max="23:59" value={bookingForm.eventTime} onChange={e => setBookingForm({...bookingForm, eventTime: e.target.value})} className={inputCls} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Country</label>
                    <input type="text" value={bookingForm.eventCountry} onChange={e => setBookingForm({...bookingForm, eventCountry: e.target.value})} placeholder="Ethiopia" className={inputCls} /></div>
                  <div><label className={labelCls}>City</label>
                    <input type="text" value={bookingForm.eventCity} onChange={e => setBookingForm({...bookingForm, eventCity: e.target.value})} placeholder="Addis Ababa" className={inputCls} /></div>
                </div>
                <div><label className={labelCls}>Venue / Location</label>
                  <input type="text" value={bookingForm.eventLocation} onChange={e => setBookingForm({...bookingForm, eventLocation: e.target.value})} placeholder="Hotel Name, Hall..." className={inputCls} /></div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setBookingStep(1)} className="flex-1 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-bold transition">← Back</button>
                <button onClick={() => {
                  if (!bookingForm.eventType || !bookingForm.plan || !bookingForm.eventDate || !bookingForm.eventTime) {
                    showMsg("Event type, package, date and time are required", "error"); return;
                  }
                  setBookingStep(3);
                }} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition">NEXT →</button>
              </div>
            </div>
          )}

          {/* ── Step 3: Payment Method ── */}
          {bookingStep === 3 && (
            <div className="bg-slate-800 border-2 border-purple-500 rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-purple-400 mb-6">💳 Payment Method</h2>
              <div className="space-y-4">
                {[
                  { type: "manual", icon: "💵", title: "Manual Payment (Cash)", desc: "Admin collects cash. Booking marked PAID immediately." },
                  { type: "system", icon: "🏦", title: "System Payment (Chapa)", desc: "Customer pays online. Booking awaits payment confirmation." },
                ].map(opt => (
                  <button key={opt.type} onClick={() => setBookingForm({...bookingForm, paymentType: opt.type})}
                    className={`w-full p-5 rounded-xl border-2 text-left transition ${bookingForm.paymentType === opt.type ? "border-yellow-400 bg-yellow-900 bg-opacity-20" : "border-gray-600 bg-slate-700 hover:border-gray-400"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{opt.icon}</span>
                        <div>
                          <p className="text-white font-bold">{opt.title}</p>
                          <p className="text-gray-400 text-sm mt-1">{opt.desc}</p>
                        </div>
                      </div>
                      {bookingForm.paymentType === opt.type && <span className="text-yellow-400 text-xl">✓</span>}
                    </div>
                  </button>
                ))}
                <div className="bg-slate-900 p-4 rounded-lg border border-yellow-500 border-opacity-30 mt-4">
                  <p className="text-gray-400 text-xs">Booking Fee (Non-Refundable)</p>
                  <p className="text-yellow-300 font-bold text-2xl">
                    ETB {(PACKAGES.find(p => p.name === bookingForm.plan)?.bookingFee || 0).toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{bookingForm.plan} plan — reserves the spot; full price quoted later</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setBookingStep(2)} className="flex-1 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-bold transition">← Back</button>
                <button onClick={() => setBookingStep(4)} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition">NEXT →</button>
              </div>
            </div>
          )}

          {/* ── Step 4: Confirm ── */}
          {bookingStep === 4 && (
            <div className="bg-slate-800 border-2 border-yellow-500 rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">✅ Confirm Booking</h2>
              <div className="space-y-4">
                {[
                  { title: "👤 Customer", fields: [["Name", bookingForm.fullName], ["Email", bookingForm.email], ["Phone", bookingForm.phoneNumber], ["Residency", bookingForm.residency || "N/A"]] },
                  { title: "🎊 Event", fields: [["Type", bookingForm.eventType], ["Package", bookingForm.plan], ["Date", bookingForm.eventDate], ["Time", bookingForm.eventTime], ["Location", `${bookingForm.eventCity}, ${bookingForm.eventCountry}`]] },
                  { title: "💳 Payment", fields: [["Booking Fee", `ETB ${(PACKAGES.find(p => p.name === bookingForm.plan)?.bookingFee || 0).toLocaleString()}`], ["Type", bookingForm.paymentType === "manual" ? "Cash (Manual)" : "Chapa (Online)"]] },
                ].map(section => (
                  <div key={section.title} className="bg-slate-900 p-4 rounded-lg border border-yellow-500 border-opacity-30">
                    <p className="text-yellow-400 font-bold mb-3 text-sm">{section.title}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {section.fields.map(([label, val]) => (
                        <div key={label} className="text-sm">
                          <span className="text-gray-400">{label}: </span>
                          <span className="text-white font-semibold">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setBookingStep(3)} className="flex-1 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-bold transition">← Back</button>
                <button onClick={handleSaveManualBooking} disabled={loading}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition disabled:opacity-50 text-lg">
                  {loading ? "⏳ Saving..." : "✅ Confirm & Save"}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 5: Success + PDF ── */}
          {bookingStep === 5 && savedBooking && (
            <div className="space-y-4">
              <div className="bg-green-900 bg-opacity-40 border-2 border-green-500 rounded-xl p-6 text-center">
                <div className="text-5xl mb-3">🎉</div>
                <h2 className="text-2xl font-bold text-green-400 mb-2">Booking Created!</h2>
                <p className="text-white font-semibold">Reference: <span className="text-yellow-300 font-mono">{savedBooking.booking_ref}</span></p>
                <p className="text-white font-semibold mt-1">Verification PIN: <span className="text-yellow-300 font-mono text-xl tracking-widest">{savedBooking.verification_pin}</span></p>
                <p className="text-gray-400 text-sm mt-3">Share the PIN with the client so they can verify their booking.</p>
              </div>

              <BookingDetailCard b={savedBooking} accentColor="yellow" />

              <div className="flex gap-3">
                <button onClick={() => { setBookingStep(1); setSavedBooking(null); }}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition">
                  ✏️ Book Another Client
                </button>
                <button onClick={() => { setCurrentScreen("today"); setSavedBooking(null); setBookingStep(1); }}
                  className="flex-1 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-bold transition">
                  📅 View Today's Bookings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default AdminPanel;
