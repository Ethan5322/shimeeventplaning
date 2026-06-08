import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const PACKAGES = [
  { name: "Signature", price: 2500, description: "Basic event planning" },
  { name: "Elegance", price: 5000, description: "Premium event planning" },
  { name: "Premium", price: 10000, description: "Exclusive event planning" },
  { name: "Exclusive", price: 20000, description: "Ultimate event planning" },
];

const COUNTRY_CODES = {
  ET: { name: "Ethiopia", code: "+251" },
  US: { name: "United States", code: "+1" },
  GB: { name: "United Kingdom", code: "+44" },
  CA: { name: "Canada", code: "+1" },
  AU: { name: "Australia", code: "+61" },
  DE: { name: "Germany", code: "+49" },
  FR: { name: "France", code: "+33" },
  IT: { name: "Italy", code: "+39" },
  ES: { name: "Spain", code: "+34" },
  ZA: { name: "South Africa", code: "+27" },
  KE: { name: "Kenya", code: "+254" },
  NG: { name: "Nigeria", code: "+234" },
};

const AdminPanel = ({ onLogout }) => {
  // Authentication & Navigation
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [currentScreen, setCurrentScreen] = useState("menu"); // menu, verify, book
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Verification lookup
  const [verificationCode, setVerificationCode] = useState("");
  const [bookingDetails, setBookingDetails] = useState(null);

  // Manual booking form
  const [bookingForm, setBookingForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    nationality: "",
    residency: "",
    idNumber: "",
    contactMethod: "phone",
    eventType: "",
    plan: "",
    eventCountry: "",
    eventCity: "",
    eventLocation: "",
    eventDate: "",
    eventTime: "",
    paymentType: "manual",
  });

  const [bookingStep, setBookingStep] = useState(1);

  // Toast notification
  const showToast = (message, type = "info") => {
    if (type === "success") setSuccess(message);
    else if (type === "error") setError(message);
    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 4000);
  };

  // Login Handler
  const handleAdminLogin = () => {
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    if (!correctPassword) {
      showToast("Admin password not configured", "error");
      return;
    }
    if (adminPassword === correctPassword) {
      setIsAuthenticated(true);
      setAdminPassword("");
      setPasswordError("");
      setCurrentScreen("menu");
      showToast("✅ Admin login successful!", "success");
    } else {
      setPasswordError("❌ Invalid admin password");
      showToast("Invalid admin password", "error");
    }
  };

  // Verification Code Search
  const handleSearchBooking = async () => {
    if (!verificationCode.trim()) {
      showToast("Please enter a verification code", "error");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    setBookingDetails(null);

    try {
      if (!supabase) {
        showToast("Database not configured", "error");
        return;
      }

      const { data, error: queryError } = await supabase
        .from("shime_bookings")
        .select("*")
        .eq("verification_pin", verificationCode)
        .single();

      if (queryError) {
        if (queryError.code === "PGRST116") {
          showToast("❌ No booking found with this verification code", "error");
        } else {
          showToast(`Error: ${queryError.message}`, "error");
        }
        setBookingDetails(null);
      } else if (data) {
        setBookingDetails(data);
        showToast("✅ Booking found!", "success");
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
      setBookingDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // Save Manual Booking
  const handleSaveManualBooking = async () => {
    // Validation
    if (!bookingForm.fullName.trim()) {
      showToast("Please enter customer name", "error");
      return;
    }
    if (!bookingForm.email.trim()) {
      showToast("Please enter email", "error");
      return;
    }
    if (!bookingForm.phoneNumber.trim()) {
      showToast("Please enter phone number", "error");
      return;
    }
    if (!bookingForm.plan) {
      showToast("Please select a package plan", "error");
      return;
    }
    if (!bookingForm.eventDate) {
      showToast("Please enter event date", "error");
      return;
    }
    if (!bookingForm.eventTime) {
      showToast("Please enter event time", "error");
      return;
    }

    setLoading(true);
    try {
      if (!supabase) {
        showToast("Database not configured", "error");
        return;
      }

      const verificationPin = `ADM${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const pkgInfo = PACKAGES.find(p => p.name === bookingForm.plan);
      const depositAmount = Math.round((pkgInfo?.price || 0) / 2);
      const bookingRef = `SE-${Date.now()}`;

      const bookingRecord = {
        booking_ref: bookingRef,
        verification_pin: verificationPin,
        full_name: bookingForm.fullName,
        email: bookingForm.email,
        phone_number: bookingForm.phoneNumber,
        nationality: bookingForm.nationality,
        residency: bookingForm.residency,
        id_number: bookingForm.idNumber,
        contact_method: bookingForm.contactMethod,
        event_type: bookingForm.eventType,
        plan: bookingForm.plan,
        event_date: bookingForm.eventDate,
        event_time: bookingForm.eventTime,
        event_country: bookingForm.eventCountry,
        event_city: bookingForm.eventCity,
        event_location: bookingForm.eventLocation,
        deposit_amount: depositAmount,
        payment_status: bookingForm.paymentType === "system" ? "pending" : "manual",
        booking_status: bookingForm.paymentType === "manual" ? "deposit_paid" : "awaiting_payment",
        calendar_type: "gregorian",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from("shime_bookings")
        .insert([bookingRecord]);

      if (insertError) {
        showToast(`Error: ${insertError.message}`, "error");
      } else {
        showToast(`✅ Booking created successfully! Reference: ${bookingRef}`, "success");
        setTimeout(() => {
          setBookingForm({
            fullName: "",
            email: "",
            phoneNumber: "",
            nationality: "",
            residency: "",
            idNumber: "",
            contactMethod: "phone",
            eventType: "",
            plan: "",
            eventCountry: "",
            eventCity: "",
            eventLocation: "",
            eventDate: "",
            eventTime: "",
            paymentType: "manual",
          });
          setBookingStep(1);
          setCurrentScreen("menu");
        }, 2000);
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen("menu");
    setVerificationCode("");
    setBookingDetails(null);
    setAdminPassword("");
    setPasswordError("");
    showToast("Logged out successfully", "info");
    if (onLogout) onLogout();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return dateString;
    }
  };

  const getPaymentStatusColor = (status) => {
    if (status === "completed" || status === "manual") return "bg-green-900 text-green-300";
    if (status === "pending") return "bg-yellow-900 text-yellow-300";
    return "bg-red-900 text-red-300";
  };

  const getBookingStatusColor = (status) => {
    if (status === "deposit_paid") return "bg-blue-900 text-blue-300";
    if (status === "awaiting_payment") return "bg-orange-900 text-orange-300";
    return "bg-gray-900 text-gray-300";
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 border-2 border-yellow-500 rounded-xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-yellow-400 text-center mb-2">🔐 ADMIN</h1>
          <p className="text-gray-300 text-center mb-8">Shime Events & Planning</p>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">Admin Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  setPasswordError("");
                }}
                onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-20"
              />
              {passwordError && <p className="text-red-400 text-sm mt-2">{passwordError}</p>}
            </div>

            <button
              onClick={handleAdminLogin}
              className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition transform hover:scale-105 text-lg"
            >
              🔓 LOGIN
            </button>

            <p className="text-gray-400 text-xs text-center mt-6">Secure Admin Area - Password Protected</p>
          </div>
        </div>
      </div>
    );
  }

  // MENU SCREEN
  if (currentScreen === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-8">
        <div className="w-full max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center bg-slate-800 border-2 border-yellow-500 rounded-xl p-6 shadow-2xl mb-8">
            <div>
              <h1 className="text-3xl font-bold text-yellow-400">📊 ADMIN DASHBOARD</h1>
              <p className="text-gray-300 text-sm">Shime Events & Planning</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-bold hover:from-red-700 hover:to-red-800 transition"
            >
              🔓 LOGOUT
            </button>
          </div>

          {/* Success/Error Messages */}
          {error && (
            <div className="w-full mb-4 p-4 bg-red-900 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-200">{error}</p>
            </div>
          )}
          {success && (
            <div className="w-full mb-4 p-4 bg-green-900 border-l-4 border-green-500 rounded-lg">
              <p className="text-green-200">{success}</p>
            </div>
          )}

          {/* Menu Options */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center mb-8">What would you like to do?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option A: Check Verification */}
              <button
                onClick={() => {
                  setCurrentScreen("verify");
                  setVerificationCode("");
                  setBookingDetails(null);
                }}
                className="h-64 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 shadow-2xl hover:shadow-3xl transition transform hover:scale-105 border-2 border-blue-400"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-white mb-3">Check Verification</h3>
                <p className="text-blue-100 text-sm">Look up an existing booking using verification code</p>
                <div className="mt-6 text-blue-200 text-xs">
                  Enter customer's verification code to view their booking details
                </div>
              </button>

              {/* Option B: Book Manually */}
              <button
                onClick={() => {
                  setCurrentScreen("book");
                  setBookingStep(1);
                }}
                className="h-64 bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-8 shadow-2xl hover:shadow-3xl transition transform hover:scale-105 border-2 border-green-400"
              >
                <div className="text-6xl mb-4">✏️</div>
                <h3 className="text-2xl font-bold text-white mb-3">Book Client Manually</h3>
                <p className="text-green-100 text-sm">Create a new booking for a client directly</p>
                <div className="mt-6 text-green-200 text-xs">
                  Take customer information and create a booking in the system
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VERIFICATION LOOKUP SCREEN
  if (currentScreen === "verify") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-8">
        <div className="w-full max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center bg-slate-800 border-2 border-yellow-500 rounded-xl p-6 shadow-2xl mb-8">
            <div>
              <h1 className="text-3xl font-bold text-yellow-400">🔍 CHECK VERIFICATION</h1>
              <p className="text-gray-300 text-sm">Look up booking by verification code</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentScreen("menu")}
                className="px-6 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg font-bold hover:from-slate-700 hover:to-slate-800 transition"
              >
                ← BACK
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-bold hover:from-red-700 hover:to-red-800 transition"
              >
                🔓 LOGOUT
              </button>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="w-full mb-4 p-4 bg-red-900 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-200">{error}</p>
            </div>
          )}
          {success && (
            <div className="w-full mb-4 p-4 bg-green-900 border-l-4 border-green-500 rounded-lg">
              <p className="text-green-200">{success}</p>
            </div>
          )}

          {/* Search Section */}
          <div className="bg-slate-800 border-2 border-blue-500 rounded-xl p-6 shadow-2xl mb-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-6">🔎 ENTER VERIFICATION CODE</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Verification Code (PIN)</label>
                <p className="text-gray-400 text-xs mb-3">The code sent to customer during their booking</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === "Enter" && handleSearchBooking()}
                    placeholder="e.g., ABC123456"
                    maxLength="12"
                    className="flex-1 px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-20 uppercase font-mono text-lg"
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
            </div>
          </div>

          {/* Booking Details */}
          {bookingDetails && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-slate-800 border-2 border-blue-500 rounded-xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-blue-400 mb-4">👤 PERSONAL INFORMATION</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 p-4 rounded-lg border border-blue-500 border-opacity-30">
                    <p className="text-gray-400 text-xs font-semibold mb-1">FULL NAME</p>
                    <p className="text-white font-bold text-lg">{bookingDetails.full_name || "N/A"}</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-blue-500 border-opacity-30">
                    <p className="text-gray-400 text-xs font-semibold mb-1">EMAIL</p>
                    <p className="text-white font-bold break-all">{bookingDetails.email || "N/A"}</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-blue-500 border-opacity-30">
                    <p className="text-gray-400 text-xs font-semibold mb-1">PHONE NUMBER</p>
                    <p className="text-white font-bold">{bookingDetails.phone_number || "N/A"}</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-blue-500 border-opacity-30">
                    <p className="text-gray-400 text-xs font-semibold mb-1">ID NUMBER</p>
                    <p className="text-white font-bold">{bookingDetails.id_number || "N/A"}</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-blue-500 border-opacity-30">
                    <p className="text-gray-400 text-xs font-semibold mb-1">NATIONALITY</p>
                    <p className="text-white font-bold">{bookingDetails.nationality || "N/A"}</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-blue-500 border-opacity-30">
                    <p className="text-gray-400 text-xs font-semibold mb-1">RESIDENCY</p>
                    <p className="text-white font-bold">{bookingDetails.residency || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-slate-800 border-2 border-green-500 rounded-xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-green-400 mb-4">🎊 EVENT DETAILS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 p-4 rounded-lg border border-green-500 border-opacity-30">
                    <p className="text-gray-400 text-xs font-semibold mb-1">EVENT TYPE</p>
                    <p className="text-white font-bold">{bookingDetails.event_type || "N/A"}</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-green-500 border-opacity-30">
                    <p className="text-gray-400 text-xs font-semibold mb-1">PACKAGE PLAN</p>
                    <p className="text-white font-bold text-lg text-green-300">{bookingDetails.plan || "N/A"}</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-green-500 border-opacity-30">
                    <p className="text-gray-400 text-xs font-semibold mb-1">EVENT DATE</p>
                    <p className="text-white font-bold">{formatDate(bookingDetails.event_date)}</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-green-500 border-opacity-30">
                    <p className="text-gray-400 text-xs font-semibold mb-1">EVENT TIME</p>
                    <p className="text-white font-bold">{bookingDetails.event_time || "N/A"}</p>
                  </div>
                  <div className="md:col-span-2 bg-slate-900 p-4 rounded-lg border border-green-500 border-opacity-30">
                    <p className="text-gray-400 text-xs font-semibold mb-1">LOCATION</p>
                    <p className="text-white font-bold">
                      {bookingDetails.event_city}, {bookingDetails.event_country} - {bookingDetails.event_location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-slate-800 border-2 border-purple-500 rounded-xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-purple-400 mb-4">💳 PAYMENT INFORMATION</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 p-4 rounded-lg border border-purple-500 border-opacity-30">
                    <p className="text-gray-400 text-xs font-semibold mb-1">DEPOSIT AMOUNT</p>
                    <p className="text-white font-bold text-lg text-yellow-300">
                      ETB {(bookingDetails.deposit_amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-purple-500 border-opacity-30">
                    <p className="text-gray-400 text-xs font-semibold mb-1">PAYMENT STATUS</p>
                    <p className={`font-bold text-lg px-3 py-1 rounded text-center ${getPaymentStatusColor(bookingDetails.payment_status)}`}>
                      {bookingDetails.payment_status === "completed" || bookingDetails.payment_status === "manual" ? "✅ PAID" : "⏳ PENDING"}
                    </p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-purple-500 border-opacity-30">
                    <p className="text-gray-400 text-xs font-semibold mb-1">BOOKING STATUS</p>
                    <p className={`font-bold text-lg px-3 py-1 rounded text-center ${getBookingStatusColor(bookingDetails.booking_status)}`}>
                      {bookingDetails.booking_status === "deposit_paid" ? "✅ DEPOSIT PAID" : "⏳ AWAITING"}
                    </p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-purple-500 border-opacity-30">
                    <p className="text-gray-400 text-xs font-semibold mb-1">BOOKING REFERENCE</p>
                    <p className="text-white font-bold font-mono">{bookingDetails.booking_ref || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Clear Button */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setBookingDetails(null);
                    setVerificationCode("");
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-bold hover:from-gray-700 hover:to-gray-800 transition"
                >
                  🔄 Search Another
                </button>
              </div>
            </div>
          )}

          {!bookingDetails && !loading && verificationCode && (
            <div className="bg-slate-800 border-2 border-orange-500 rounded-xl p-6 shadow-2xl text-center">
              <p className="text-orange-300 text-lg font-semibold">📭 No booking found</p>
              <p className="text-gray-400 text-sm mt-2">Check the verification code and try again</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // MANUAL BOOKING SCREEN
  if (currentScreen === "book") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center bg-slate-800 border-2 border-yellow-500 rounded-xl p-6 shadow-2xl mb-8">
            <div>
              <h1 className="text-3xl font-bold text-yellow-400">✏️ BOOK CLIENT MANUALLY</h1>
              <p className="text-gray-300 text-sm">Step {bookingStep} of 4</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentScreen("menu")}
                className="px-6 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg font-bold hover:from-slate-700 hover:to-slate-800 transition"
              >
                ← MENU
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-bold hover:from-red-700 hover:to-red-800 transition"
              >
                🔓 LOGOUT
              </button>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="w-full mb-4 p-4 bg-red-900 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-200">{error}</p>
            </div>
          )}
          {success && (
            <div className="w-full mb-4 p-4 bg-green-900 border-l-4 border-green-500 rounded-lg">
              <p className="text-green-200">{success}</p>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden border border-yellow-500 border-opacity-30">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500"
                style={{ width: `${(bookingStep / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* STEP 1: Personal Information */}
          {bookingStep === 1 && (
            <div className="bg-slate-800 border-2 border-blue-500 rounded-xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-blue-400 mb-6">👤 PERSONAL INFORMATION</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={bookingForm.fullName}
                    onChange={(e) => setBookingForm({ ...bookingForm, fullName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-20"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-20"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={bookingForm.phoneNumber}
                    onChange={(e) => setBookingForm({ ...bookingForm, phoneNumber: e.target.value })}
                    placeholder="+251911234567"
                    className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-20"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">ID Number</label>
                  <input
                    type="text"
                    value={bookingForm.idNumber}
                    onChange={(e) => setBookingForm({ ...bookingForm, idNumber: e.target.value })}
                    placeholder="CA123456"
                    className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">Nationality</label>
                    <input
                      type="text"
                      value={bookingForm.nationality}
                      onChange={(e) => setBookingForm({ ...bookingForm, nationality: e.target.value })}
                      placeholder="Ethiopian"
                      className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-20"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Residency</label>
                    <input
                      type="text"
                      value={bookingForm.residency}
                      onChange={(e) => setBookingForm({ ...bookingForm, residency: e.target.value })}
                      placeholder="Addis Ababa"
                      className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-20"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    if (!bookingForm.fullName || !bookingForm.email || !bookingForm.phoneNumber) {
                      showToast("Please fill in required fields", "error");
                      return;
                    }
                    setBookingStep(2);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition"
                >
                  NEXT →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Event Details */}
          {bookingStep === 2 && (
            <div className="bg-slate-800 border-2 border-green-500 rounded-xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-green-400 mb-6">🎊 EVENT DETAILS</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Event Type *</label>
                  <input
                    type="text"
                    value={bookingForm.eventType}
                    onChange={(e) => setBookingForm({ ...bookingForm, eventType: e.target.value })}
                    placeholder="Wedding, Birthday, Conference..."
                    className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-20"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Package Plan *</label>
                  <select
                    value={bookingForm.plan}
                    onChange={(e) => setBookingForm({ ...bookingForm, plan: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-20"
                  >
                    <option value="">Select a package...</option>
                    {PACKAGES.map((pkg) => (
                      <option key={pkg.name} value={pkg.name}>
                        {pkg.name} - ETB {pkg.price.toLocaleString()} (Deposit: ETB {Math.round(pkg.price / 2).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">Event Date *</label>
                    <input
                      type="date"
                      value={bookingForm.eventDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, eventDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-20"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Event Time *</label>
                    <input
                      type="time"
                      value={bookingForm.eventTime}
                      onChange={(e) => setBookingForm({ ...bookingForm, eventTime: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">Country *</label>
                    <input
                      type="text"
                      value={bookingForm.eventCountry}
                      onChange={(e) => setBookingForm({ ...bookingForm, eventCountry: e.target.value })}
                      placeholder="Ethiopia"
                      className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-20"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">City *</label>
                    <input
                      type="text"
                      value={bookingForm.eventCity}
                      onChange={(e) => setBookingForm({ ...bookingForm, eventCity: e.target.value })}
                      placeholder="Addis Ababa"
                      className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Venue/Location *</label>
                  <input
                    type="text"
                    value={bookingForm.eventLocation}
                    onChange={(e) => setBookingForm({ ...bookingForm, eventLocation: e.target.value })}
                    placeholder="Hotel Name, Hall Name..."
                    className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-20"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setBookingStep(1)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg font-bold hover:from-slate-700 hover:to-slate-800 transition"
                >
                  ← BACK
                </button>
                <button
                  onClick={() => {
                    if (!bookingForm.eventType || !bookingForm.plan || !bookingForm.eventDate || !bookingForm.eventTime) {
                      showToast("Please fill in all required fields", "error");
                      return;
                    }
                    setBookingStep(3);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition"
                >
                  NEXT →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method */}
          {bookingStep === 3 && (
            <div className="bg-slate-800 border-2 border-purple-500 rounded-xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-purple-400 mb-2">💳 PAYMENT METHOD SELECTION</h2>
              <p className="text-gray-400 text-sm mb-6">Choose how the customer will pay for their deposit</p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Manual Payment Option */}
                  <button
                    onClick={() => setBookingForm({ ...bookingForm, paymentType: "manual" })}
                    className={`p-6 rounded-lg border-2 transition transform hover:scale-105 ${
                      bookingForm.paymentType === "manual"
                        ? "border-green-400 bg-green-900 bg-opacity-40 shadow-lg"
                        : "border-gray-600 bg-slate-700 hover:border-green-400"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">💵</div>
                      {bookingForm.paymentType === "manual" && (
                        <div className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">✅ SELECTED</div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">MANUAL PAYMENT (CASH)</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">
                        Admin collects cash payment directly from customer in office or location
                      </p>
                      <div className="bg-slate-900 bg-opacity-50 p-3 rounded mt-3 border-l-2 border-green-400">
                        <p className="text-green-300 text-xs font-bold mb-2">What happens:</p>
                        <ul className="text-green-200 text-xs space-y-1">
                          <li>✅ Customer pays cash to admin</li>
                          <li>✅ Booking marked as PAID immediately</li>
                          <li>✅ Booking confirmed right away</li>
                          <li>✅ No online payment needed</li>
                        </ul>
                      </div>
                    </div>
                  </button>

                  {/* System Payment Option */}
                  <button
                    onClick={() => setBookingForm({ ...bookingForm, paymentType: "system" })}
                    className={`p-6 rounded-lg border-2 transition transform hover:scale-105 ${
                      bookingForm.paymentType === "system"
                        ? "border-blue-400 bg-blue-900 bg-opacity-40 shadow-lg"
                        : "border-gray-600 bg-slate-700 hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">🏦</div>
                      {bookingForm.paymentType === "system" && (
                        <div className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">✅ SELECTED</div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">SYSTEM PAYMENT (CHAPA)</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">
                        Customer pays online using Chapa payment gateway (Debit Card, Telebirr, CBE Wallet, etc.)
                      </p>
                      <div className="bg-slate-900 bg-opacity-50 p-3 rounded mt-3 border-l-2 border-blue-400">
                        <p className="text-blue-300 text-xs font-bold mb-2">What happens:</p>
                        <ul className="text-blue-200 text-xs space-y-1">
                          <li>⏳ Booking created but awaiting payment</li>
                          <li>📧 Customer receives payment link</li>
                          <li>💳 Customer can pay anytime (card, Telebirr, etc.)</li>
                          <li>✅ Auto-updated when customer pays</li>
                        </ul>
                      </div>
                    </div>
                  </button>

                  {/* Bank Transfer Option (for reference) */}
                  <div className="p-4 rounded-lg border-2 border-yellow-600 bg-yellow-900 bg-opacity-20">
                    <p className="text-yellow-300 text-sm font-bold">💡 Note:</p>
                    <p className="text-yellow-200 text-xs mt-2">
                      Customers can also pay via bank transfer (CBE) or visit in person with cash. These are handled as manual payments.
                    </p>
                  </div>
                </div>

                {/* Deposit Amount Display */}
                <div className="bg-slate-900 p-4 rounded-lg border border-purple-500 border-opacity-30 mt-6">
                  <p className="text-gray-400 text-sm">Deposit Amount</p>
                  <p className="text-yellow-300 font-bold text-2xl">
                    ETB {Math.round((PACKAGES.find(p => p.name === bookingForm.plan)?.price || 0) / 2).toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    ({bookingForm.plan} plan - 50% deposit)
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setBookingStep(2)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg font-bold hover:from-slate-700 hover:to-slate-800 transition"
                >
                  ← BACK
                </button>
                <button
                  onClick={() => setBookingStep(4)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-bold hover:from-purple-700 hover:to-purple-800 transition"
                >
                  NEXT →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmation */}
          {bookingStep === 4 && (
            <div className="bg-slate-800 border-2 border-yellow-500 rounded-xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">✅ CONFIRM BOOKING</h2>

              {/* Summary */}
              <div className="space-y-6 mb-8">
                {/* Personal Summary */}
                <div className="bg-slate-900 p-4 rounded-lg border border-yellow-500 border-opacity-30">
                  <p className="text-yellow-400 font-bold mb-3">👤 Customer Information</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                    <div><strong>Name:</strong> {bookingForm.fullName}</div>
                    <div><strong>Email:</strong> {bookingForm.email}</div>
                    <div><strong>Phone:</strong> {bookingForm.phoneNumber}</div>
                    <div><strong>ID:</strong> {bookingForm.idNumber || "N/A"}</div>
                  </div>
                </div>

                {/* Event Summary */}
                <div className="bg-slate-900 p-4 rounded-lg border border-yellow-500 border-opacity-30">
                  <p className="text-yellow-400 font-bold mb-3">🎊 Event Information</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                    <div><strong>Type:</strong> {bookingForm.eventType}</div>
                    <div><strong>Package:</strong> {bookingForm.plan}</div>
                    <div><strong>Date:</strong> {bookingForm.eventDate}</div>
                    <div><strong>Time:</strong> {bookingForm.eventTime}</div>
                    <div className="col-span-2"><strong>Location:</strong> {bookingForm.eventCity}, {bookingForm.eventCountry}</div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-slate-900 p-4 rounded-lg border border-yellow-500 border-opacity-30">
                  <p className="text-yellow-400 font-bold mb-3">💳 Payment Information</p>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div><strong>Deposit Amount:</strong> ETB {Math.round((PACKAGES.find(p => p.name === bookingForm.plan)?.price || 0) / 2).toLocaleString()}</div>
                    <div><strong>Payment Type:</strong> {bookingForm.paymentType === "manual" ? "💵 Manual (Cash)" : "🏦 System (Chapa)"}</div>
                    <div>
                      <strong>Status:</strong>{" "}
                      {bookingForm.paymentType === "manual" ? (
                        <span className="text-green-300">✅ Deposit Paid</span>
                      ) : (
                        <span className="text-yellow-300">⏳ Awaiting Payment</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning for System Payment */}
              {bookingForm.paymentType === "system" && (
                <div className="bg-blue-900 bg-opacity-50 border-l-4 border-blue-400 p-4 rounded-lg mb-8">
                  <p className="text-blue-200 text-sm">
                    💡 <strong>Note:</strong> Customer will receive payment instructions. They can pay through Chapa at any time.
                  </p>
                </div>
              )}

              {/* Warning for Manual Payment */}
              {bookingForm.paymentType === "manual" && (
                <div className="bg-green-900 bg-opacity-50 border-l-4 border-green-400 p-4 rounded-lg mb-8">
                  <p className="text-green-200 text-sm">
                    💡 <strong>Reminder:</strong> Make sure you collect payment from customer before confirming. Booking will be marked as paid.
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setBookingStep(3)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg font-bold hover:from-slate-700 hover:to-slate-800 transition"
                >
                  ← BACK
                </button>
                <button
                  onClick={handleSaveManualBooking}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {loading ? "⏳ SAVING..." : "✅ CONFIRM & SAVE"}
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
