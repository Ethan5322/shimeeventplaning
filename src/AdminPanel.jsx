import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const AdminPanel = ({ onLogout }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Toast notification
  const showToast = (message, type = "info") => {
    if (type === "success") setSuccess(message);
    else if (type === "error") setError(message);
    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 4000);
  };

  // Validate admin password
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
      showToast("✅ Admin login successful!", "success");
    } else {
      setPasswordError("❌ Invalid admin password");
      showToast("Invalid admin password", "error");
    }
  };

  // Search booking by verification code
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

      // Query Supabase for booking with matching verification PIN
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
        showToast("✅ Booking found! Details displayed below.", "success");
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
      setBookingDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setVerificationCode("");
    setBookingDetails(null);
    setAdminPassword("");
    setPasswordError("");
    showToast("Logged out successfully", "info");
    if (onLogout) onLogout();
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  const getPaymentStatusColor = (status) => {
    if (status === "completed") return "bg-green-900 text-green-300";
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

            <p className="text-gray-400 text-xs text-center mt-6">
              Secure Admin Area - Password Protected
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN PANEL SCREEN
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-8">
      {/* Header */}
      <div className="w-full max-w-5xl mx-auto mb-8">
        <div className="flex justify-between items-center bg-slate-800 border-2 border-yellow-500 rounded-xl p-6 shadow-2xl">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">📊 ADMIN DASHBOARD</h1>
            <p className="text-gray-300 text-sm">Shime Events & Planning</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-bold hover:from-red-700 hover:to-red-800 transition transform hover:scale-105"
          >
            🔓 LOGOUT
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="w-full max-w-5xl mx-auto mb-4 p-4 bg-red-900 border-l-4 border-red-500 rounded-lg">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="w-full max-w-5xl mx-auto mb-4 p-4 bg-green-900 border-l-4 border-green-500 rounded-lg">
          <p className="text-green-200">{success}</p>
        </div>
      )}

      {/* Verification Code Lookup Section */}
      <div className="w-full max-w-5xl mx-auto bg-slate-800 border-2 border-yellow-500 rounded-xl p-6 shadow-2xl mb-8">
        <h2 className="text-2xl font-bold text-yellow-400 mb-6">🔍 VERIFY BOOKING</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-white font-semibold mb-2">Verification Code</label>
            <p className="text-gray-400 text-xs mb-3">
              Enter the verification PIN code from the customer's booking confirmation
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === "Enter" && handleSearchBooking()}
                placeholder="e.g., ABC123456"
                maxLength="12"
                className="flex-1 px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-20 uppercase font-mono text-lg"
              />
              <button
                onClick={handleSearchBooking}
                disabled={loading || !verificationCode.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-bold hover:from-purple-700 hover:to-purple-800 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "🔄 SEARCHING..." : "🔍 SEARCH"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details Section */}
      {bookingDetails && (
        <div className="w-full max-w-5xl mx-auto space-y-6">
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
              <div className="bg-slate-900 p-4 rounded-lg border border-blue-500 border-opacity-30">
                <p className="text-gray-400 text-xs font-semibold mb-1">CONTACT METHOD</p>
                <p className="text-white font-bold">{bookingDetails.contact_method || "N/A"}</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg border border-blue-500 border-opacity-30">
                <p className="text-gray-400 text-xs font-semibold mb-1">LANGUAGE</p>
                <p className="text-white font-bold">
                  {bookingDetails.language === "en"
                    ? "🇬🇧 English"
                    : bookingDetails.language === "am"
                    ? "🇪🇹 Amharic"
                    : bookingDetails.language || "N/A"}
                </p>
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
                <p className="text-white font-bold">{formatTime(bookingDetails.event_time)}</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg border border-green-500 border-opacity-30">
                <p className="text-gray-400 text-xs font-semibold mb-1">LOCATION</p>
                <p className="text-white font-bold">
                  {bookingDetails.event_city}, {bookingDetails.event_country}
                </p>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg border border-green-500 border-opacity-30">
                <p className="text-gray-400 text-xs font-semibold mb-1">VENUE</p>
                <p className="text-white font-bold">{bookingDetails.event_location || "N/A"}</p>
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
              <div className={`bg-slate-900 p-4 rounded-lg border border-purple-500 border-opacity-30`}>
                <p className="text-gray-400 text-xs font-semibold mb-1">PAYMENT STATUS</p>
                <p
                  className={`font-bold text-lg px-3 py-1 rounded text-center ${getPaymentStatusColor(
                    bookingDetails.payment_status
                  )}`}
                >
                  {bookingDetails.payment_status === "completed" ? "✅ COMPLETED" : "⏳ PENDING"}
                </p>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg border border-purple-500 border-opacity-30">
                <p className="text-gray-400 text-xs font-semibold mb-1">BOOKING STATUS</p>
                <p
                  className={`font-bold text-lg px-3 py-1 rounded text-center ${getBookingStatusColor(
                    bookingDetails.booking_status
                  )}`}
                >
                  {bookingDetails.booking_status === "deposit_paid"
                    ? "✅ DEPOSIT PAID"
                    : "⏳ AWAITING PAYMENT"}
                </p>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg border border-purple-500 border-opacity-30">
                <p className="text-gray-400 text-xs font-semibold mb-1">BOOKING REFERENCE</p>
                <p className="text-white font-bold font-mono">{bookingDetails.booking_ref || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-slate-800 border-2 border-gray-600 rounded-xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-400 mb-4">📝 SYSTEM INFORMATION</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-4 rounded-lg border border-gray-600 border-opacity-30">
                <p className="text-gray-400 text-xs font-semibold mb-1">VERIFICATION CODE</p>
                <p className="text-white font-bold font-mono">{bookingDetails.verification_pin || "N/A"}</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg border border-gray-600 border-opacity-30">
                <p className="text-gray-400 text-xs font-semibold mb-1">BOOKING DATE</p>
                <p className="text-white font-bold">{formatDate(bookingDetails.created_at)}</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg border border-gray-600 border-opacity-30">
                <p className="text-gray-400 text-xs font-semibold mb-1">LAST UPDATED</p>
                <p className="text-white font-bold">{formatDate(bookingDetails.updated_at)}</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg border border-gray-600 border-opacity-30">
                <p className="text-gray-400 text-xs font-semibold mb-1">CALENDAR TYPE</p>
                <p className="text-white font-bold">
                  {bookingDetails.calendar_type === "gregorian"
                    ? "📅 Gregorian"
                    : bookingDetails.calendar_type === "ethiopian"
                    ? "📅 Ethiopian"
                    : bookingDetails.calendar_type || "N/A"}
                </p>
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
              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-bold hover:from-gray-700 hover:to-gray-800 transition transform hover:scale-105"
            >
              🔄 Clear & Search Again
            </button>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {!bookingDetails && !loading && verificationCode && (
        <div className="w-full max-w-5xl mx-auto bg-slate-800 border-2 border-orange-500 rounded-xl p-6 shadow-2xl text-center">
          <p className="text-orange-300 text-lg font-semibold">
            📭 No booking found with this verification code
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Please check the code and try again, or ask the customer for their verification code
          </p>
        </div>
      )}

      {/* Empty State */}
      {!bookingDetails && !loading && !verificationCode && (
        <div className="w-full max-w-5xl mx-auto bg-slate-800 border-2 border-gray-600 rounded-xl p-8 shadow-2xl text-center">
          <p className="text-gray-400 text-lg font-semibold mb-2">🔎 Enter a verification code to search</p>
          <p className="text-gray-500 text-sm">The verification code is provided to customers during their booking</p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
