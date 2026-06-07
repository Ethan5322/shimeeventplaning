import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

const translations = {
  en: {
    welcome: "Welcome to Shime Events & Planning",
    welcomeSubtitle: "Your Premier Partner for Exceptional Celebrations",
    selectLanguage: "Please select your preferred language:",
    askNationality: "What is your nationality?",
    askResidency: "Which country is your current place of residence?",
    askPhone: "Please provide your phone number (Example: +251911234567)",
    invalidPhone: "❌ The phone number you entered is invalid. Please use the format: +251911234567",
    phoneCountryMismatch: "⚠️ Please note: Your phone number country code differs from your country of residence.",
    askEmail: "Please provide your email address:",
    invalidEmail: "❌ The email address you entered is invalid. Please enter a valid email.",
    askIdType: "Please provide your ID number or Passport number:",
    invalidId: "❌ The ID/Passport number you entered is invalid. Please try again.",
    askFullName: "Please provide your full name (First name and last name):",
    invalidName: "❌ Please enter your valid full name with both first and last name.",
    askPassword: "Please create a security PIN (6 or more digits):",
    askContactMethod: "How would you prefer us to contact you?",
    askEventType: "What type of event are you planning?",
    askEventCountry: "In which country will your event take place?",
    eventCountryMismatch: "⚠️ Please note: Your event location is in a different country than your current residence.",
    askEventCity: "In which city will your event be held?",
    askDate: "Please select the date of your event:",
    dateBooked: "⚠️ The date you selected is unavailable. Please choose another date.",
    askTime: "What is your preferred time for the event?",
    timeBooked: "⚠️ The time slot you selected is unavailable. Please choose another time.",
    askLocation: "Please provide the venue location or complete address:",
    depositNotice: "A 50% deposit is required to secure your booking.",
    noticeTitle: "Booking Confirmation & Payment Instructions",
    noticeBody: "To secure your booking, please submit the required 50% deposit payment:\n\n🏦 Payment Method: CBE WALLET\nAccount Number: 1000XXXXXXXX\nAccount Name: Shime Events & Planning",
    termsTitle: "TERMS & CONDITIONS",
    termsText: `1. A 50% non-refundable deposit is required to secure your event booking.
2. Full payment is due 14 days before your scheduled event date.
3. Cancellations made within 7 days of the event will result in forfeiture of 50% of total payment.
4. Shime Events & Planning reserves the right to substitute vendors of equal or superior quality.
5. The client is fully responsible for providing accurate and complete information during the booking process.
6. Any requested changes to event date, venue, or guest count must be submitted in writing.
7. Force majeure clauses apply to events affected by circumstances beyond our control.
8. All disputes arising from this agreement shall be subject to Ethiopian jurisdiction.

By accepting this agreement, you confirm that you have reviewed and accepted all terms and conditions.`,
    acceptTerms: "✅ I Accept the Terms & Conditions",
    shareWhatsapp: "📲 Share via WhatsApp",
    viewBooking: "📋 View Booking Details",
    downloadPdf: "⬇️ Download Contract",
    downloadQr: "⬇️ Download QR Code",
    sendInstructions: "Next Steps to Complete Your Booking:\n\n1. Send proof of payment\n2. Send signed contract\n\nPlease submit to:\n📱 WhatsApp: +251 91 234 5678\n✉️ Telegram: @ShimeEvents",
    bookingConfirmed: "Booking Confirmed",
    termsAccepted: "✅ Terms and conditions accepted successfully.",
    proceedBooking: "Review Your Booking",
    contactUs: "📲 Contact Us",
    stepOf: "Step",
    required: "(Required)",
    back: "← Back",
    next: "Continue →",
    success: "✅ Success!",
    loading: "Loading...",
    generatingPdf: "Generating PDF Document...",
    generatingQr: "Generating QR Code...",
    copy: "Copy",
    copied: "Copied to clipboard!",
    startOver: "Start Over",
    selectPackage: "Which event package would you like to select?",
    scanToBook: "📲 Scan to Book Your Event",
    qrCodeTitle: "Share This QR Code",
    qrCodeSubtitle: "Distribute this QR code so customers can scan and begin their booking",
    downloadQRCode: "⬇️ Download QR Code",
    printQRCode: "🖨️ Print QR Code",
    shareQRCode: "📱 Share QR Link",
    qrCodeDownloaded: "QR Code downloaded successfully!",
  },
  am: {
    welcome: "በ Shime Events & Planning እንኋን ደህና መጡ",
    welcomeSubtitle: "ለእርስዎ ልዩ ዝግጅት ለምንም ይልቅ ተስፋ ሰሪ አጋዥ",
    selectLanguage: "እባክዎን ተመራጩ ቋንቋዎን ይምረጡ:",
    askNationality: "እባክዎን የእርስዎ ተዋለድነት ይንገሩን:",
    askResidency: "በአሁኑ ጊዜ በየትኛው ሀገር ይኖራሉ?",
    askPhone: "እባክዎን የእርስዎ ስልክ ቁጥር ይንገሩን (ምሳሌ: +251911234567)",
    invalidPhone: "❌ የገቡት ስልክ ቁጥር ትክክል ያልሆነ ነው። እባክዎን ይህንን ቅርጸት ይጠቀሙ: +251911234567",
    phoneCountryMismatch: "⚠️ እባክዎን ልብ ይበሉ: የእርስዎ ስልክ ቁጥር ከመኖሪያ ሀገርዎ ጋር አይዛመድም።",
    askEmail: "እባክዎን የእርስዎ ኢሜይል 주소 ይንገሩን:",
    invalidEmail: "❌ የገቡት ኢሜይል ትክክል ያልሆነ ነው። እባክዎን ትክክለኛ ኢሜይል ይርስሩ።",
    askIdType: "እባክዎን የእርስዎ መታወቂያ ወይም ፓስፖርት ቁጥር ይርስሩ:",
    invalidId: "❌ የገቡት መታወቂያ/ፓስፖርት ቁጥር ትክክል ያልሆነ ነው። እባክዎን ድጋሚ ሞክሩ።",
    askFullName: "እባክዎን የእርስዎ ሙሉ ስም ይርስሩ (ስም እና የቤት ስም):",
    invalidName: "❌ እባክዎን ስም እና የቤት ስም ጋር ትክክለኛ ሙሉ ስም ይርስሩ።",
    askPassword: "እባክዎን ደህንነት PIN ይጠግኑ (6 ወይም ከዚያ በላይ አሃዞች):",
    askContactMethod: "እባክዎን እንዴት ለመገናኘት መከፈት ይምረጡ:",
    askEventType: "ምን ዓይነት ዝግጅት ታቅደዋል?",
    askEventCountry: "ዝግጅትዎ በየትኛው ሀገር ይካሄዳል?",
    eventCountryMismatch: "⚠️ እባክዎን ልብ ይበሉ: ዝግጅትዎ ከመኖሪያ ሀገርዎ በተለያዩ ሀገር ይኖራሉ።",
    askEventCity: "ዝግጅትዎ በየትኛው ከተማ ይካሄዳል?",
    askDate: "እባክዎን ዝግጅትዎ ቀንን ይምረጡ:",
    dateBooked: "⚠️ የመረጡት ቀን አይገኝም። እባክዎን ሌላ ቀን ይምረጡ።",
    askTime: "የዝግጅትዎ ምርጥ ጊዜ ምንድ ነው?",
    timeBooked: "⚠️ የመረጡት ጊዜ አይገኝም። እባክዎን ሌላ ጊዜ ይምረጡ።",
    askLocation: "እባክዎን የክስተት አቀራረብ ወይም ሙሉ አድራሻ ይርስሩ:",
    depositNotice: "ዝግጅትዎን ለማረጋገጥ 50% ዝቅ ብለህ ክፍያ ያስፈልጋል።",
    noticeTitle: "ዝግጅት ማረጋገጫ እና ክፍያ መመሪያ",
    noticeBody: "ዝግጅትዎን ለማረጋገጥ, እባክዎን የሚያስፈልገው 50% ዝቅ ብለህ ክፍያ ያስገቡ:\n\n🏦 ክፍያ ዘዴ: CBE WALLET\nሂሳብ ቁጥር: 1000XXXXXXXX\nሂሳብ ስም: Shime Events & Planning",
    termsTitle: "ውሎች እና ሁኔታዎች",
    acceptTerms: "✅ ውሎች እና ሁኔታዎችን እቀበላለሁ",
    shareWhatsapp: "📲 በ WhatsApp ላክ",
    viewBooking: "📋 ዝግጅት ዝርዝር ይመልከቱ",
    downloadPdf: "⬇️ ውል ሰነድ ያውርዱ",
    downloadQr: "⬇️ QR ኮድ ያውርዱ",
    sendInstructions: "ዝግጅትዎን ለመጨረስ ቀጣይ ደረጃዎች:\n\n1. ክፍያ ማስረጃ ይላኩ\n2. ተፈራርሙ ውል ይላኩ\n\nእባክዎን ለአድራሻው ያስገቡ:\n📱 WhatsApp: +251 91 234 5678\n✉️ Telegram: @ShimeEvents",
    bookingConfirmed: "ዝግጅት ተረጋግጧል",
    termsAccepted: "✅ ውሎች እና ሁኔታዎች በተሳካ ሁኔታ ተቀብለዋል።",
    proceedBooking: "ዝግጅትዎን ይገምግሙ",
    contactUs: "📲 ያገኙን",
    stepOf: "ደረጃ",
    required: "(ያስፈልጋል)",
    back: "← ወደ ኋላ",
    next: "ቀጥል →",
    success: "✅ ተሳካ!",
    loading: "ይጠበቅ ይገባል...",
    generatingPdf: "PDF ሰነድ ይዘጋጃል...",
    generatingQr: "QR ኮድ ይዘጋጃል...",
    copy: "ቅዴ",
    copied: "በ clipboard ውስጥ ገብቷል!",
    startOver: "ድጋሚ ጀምር",
    selectPackage: "ምን ዓይነት ዝግጅት ፓኬጅ መምረጥ ይፈልጋሉ?",
    scanToBook: "📲 ዝግጅትዎን ለመያዝ ስካን ያድርጉ",
    qrCodeTitle: "ይህን QR ኮድ ያጋሩ",
    qrCodeSubtitle: "ደንበኞች ስካን ማድረግ እና ዝግጅትን ይጀምሩ ይችላሉ",
    downloadQRCode: "⬇️ QR ኮድ ያውርዱ",
    printQRCode: "🖨️ QR ኮድ አሳዩ",
    shareQRCode: "📱 QR ሊንክ ያጋሩ",
    qrCodeDownloaded: "QR ኮድ በተሳካ ሁኔታ ተዘርዝሯል!",
  }
};

const BOOKED_SLOTS = [
  { date: "2025-12-25", time: null },
  { date: "2026-01-01", time: "14:00" },
  { date: "2026-02-14", time: null },
  { date: "2026-06-15", time: "10:00" },
  { date: "2026-07-04", time: null },
];

const PACKAGES = [
  { id: "signature", name: "Signature", price: 5000, icon: "🎉" },
  { id: "elegance", name: "Elegance", price: 10000, icon: "⭐" },
  { id: "premium", name: "Premium", price: 20000, icon: "💎" },
  { id: "exclusive", name: "Exclusive", price: 40000, icon: "👑" },
];

// Removed hardcoded country list - clients can now type any country name

// Toast Notification Component
const Toast = ({ message, type, visible }) => {
  if (!visible) return null;

  const bgColor = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
    warning: "bg-yellow-600"
  }[type] || "bg-blue-600";

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg animate-slideDown z-50`}>
      {message}
    </div>
  );
};

// Loading Spinner Component
const Spinner = () => (
  <div className="flex items-center justify-center gap-2">
    <div className="animate-spin h-5 w-5 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
    <span>Processing...</span>
  </div>
);

// QR Code Download Page Component
const QRCodeDownloadPage = ({ bookingQRCode, loading, onDownloadImage, onDownloadPDF, onGoBack }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    const translations = {
      en: {
        title: "Download Your Shime Events QR Code",
        subtitle: "Share this code so customers can easily book their events",
        instructions: "How to use:",
        step1: "Download the QR code (PNG or PDF)",
        step2: "Print or share on social media",
        step3: "Customers scan to start booking",
        step4: "Get bookings automatically!",
        downloadPNG: "📥 Download as PNG",
        downloadPDF: "📄 Download as PDF",
        print: "🖨️ Print QR Code",
        backToBooking: "← Back to Booking",
        scanMessage: "Scan this code to book your event with Shime Events!",
        contact: "Questions? Contact us:",
      },
      am: {
        title: "የ Shime Events QR Code ያውርዱ",
        subtitle: "ይህ ኮድ ያጋሩ ዝግጅትዎን ለመያዝ",
        instructions: "እንዴት ይጠቀሙ:",
        step1: "QR ኮድ ያውርዱ (PNG ወይም PDF)",
        step2: "አሳዩ ወይም በማህበራዊ ሚዲያ ላይ ያጋሩ",
        step3: "ደንበኞች ስካን ማድረግ ይችላሉ",
        step4: "ዝግጅት ያግኙ!",
        downloadPNG: "📥 PNG ሆነ ያውርዱ",
        downloadPDF: "📄 PDF ሆነ ያውርዱ",
        print: "🖨️ QR ኮድ አሳዩ",
        backToBooking: "← ወደ ዝግጅት ይመለሱ",
        scanMessage: "ይህን ኮድ ስካን ማድረግ ዝግጅትዎን ለመያዝ",
        contact: "ጥያቄ? ያገኙ:",
      }
    };
    return translations[language][key] || translations.en[key];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.05) 0%, transparent 50%)" }}>
      <header className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 border-b-2 border-yellow-500 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="brand-font text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">Shime Events</h1>
          <p className="text-white text-sm opacity-90 tracking-wide">Professional Event Planning & Coordination</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-500 rounded-xl p-8 shadow-2xl">
          {/* Language Toggle */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setLanguage('en')}
              className={`px-6 py-2 rounded-lg font-bold transition ${language === 'en' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => setLanguage('am')}
              className={`px-6 py-2 rounded-lg font-bold transition ${language === 'am' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
            >
              🇪🇹 አማርኛ
            </button>
          </div>

          <h2 className="text-3xl font-bold text-yellow-400 text-center mb-2">{t("title")}</h2>
          <p className="text-gray-300 text-center mb-8">{t("subtitle")}</p>

          {/* QR Code Display */}
          <div className="bg-white p-8 rounded-lg mb-8 flex justify-center">
            {bookingQRCode ? (
              <div className="text-center">
                <img src={bookingQRCode} alt="Shime Events Booking QR Code" className="w-80 h-80" />
                <p className="text-slate-900 font-semibold mt-4 text-sm">{t("scanMessage")}</p>
              </div>
            ) : (
              <div className="text-center text-slate-500">Loading QR Code...</div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-slate-800 border border-yellow-500 border-opacity-30 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">{t("instructions")}</h3>
            <ul className="space-y-3 text-white">
              <li className="flex items-start">
                <span className="text-2xl mr-3">1️⃣</span>
                <span>{t("step1")}</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">2️⃣</span>
                <span>{t("step2")}</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">3️⃣</span>
                <span>{t("step3")}</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">4️⃣</span>
                <span>{t("step4")}</span>
              </li>
            </ul>
          </div>

          {/* Download Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={onDownloadImage}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition disabled:opacity-50"
            >
              {loading ? "⏳ Processing..." : t("downloadPNG")}
            </button>
            <button
              onClick={onDownloadPDF}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-bold hover:from-red-700 hover:to-red-800 transition disabled:opacity-50"
            >
              {loading ? "⏳ Processing..." : t("downloadPDF")}
            </button>
            <button
              onClick={() => window.print()}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition"
            >
              {t("print")}
            </button>
          </div>

          {/* Contact Info */}
          <div className="bg-slate-800 border border-yellow-500 border-opacity-30 rounded-lg p-6 mb-8">
            <p className="text-yellow-400 font-bold mb-3">{t("contact")}</p>
            <div className="text-gray-300 space-y-2 text-sm">
              <p>📱 WhatsApp: +251 91 234 5678</p>
              <p>✉️ Email: contact@shimeeventplaning.com</p>
              <p>🌐 Website: shimeeventplaning.com</p>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={onGoBack}
            className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition"
          >
            {t("backToBooking")}
          </button>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        * { font-family: 'Lato', sans-serif; }
        .brand-font { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
};

export default function ShimeAssistant() {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [bookingData, setBookingData] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [bookingRefNum, setBookingRefNum] = useState(null);

  // Toast state
  const [toast, setToast] = useState({ message: "", type: "info", visible: false });
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState(false);

  // QR Code for customer booking
  const [bookingQRCode, setBookingQRCode] = useState(null);
  const [showQRSection, setShowQRSection] = useState(false);
  const [showQRPage, setShowQRPage] = useState(false);

  const chatEndRef = useRef(null);

  const showToast = (message, type = "info", duration = 3000) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ ...toast, visible: false }), duration);
  };

  const getBilingualText = (key) => {
    if (!language) return translations.en[key];
    const engText = translations.en[key];
    const transText = translations[language][key];
    if (language === "en") return engText;
    // Show both languages clearly separated
    return `${engText}\n\n${transText}`;
  };

  const getLanguageName = (lang) => {
    return lang === "en" ? "English" : lang === "am" ? "አማርኛ" : "Unknown";
  };

  const t = (key) => translations[language || "en"][key] || translations.en[key];

  const addAgentMessage = (text) => {
    setMessages((prev) => [...prev, { type: "agent", text, id: Date.now() }]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { type: "user", text, id: Date.now() }]);
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\+[0-9]{9,14}$/.test(phone);
  const validateId = (id) => /^[A-Z]{0,2}[0-9]{6,12}$/i.test(id);
  const validateName = (name) => name.trim().split(" ").length >= 2 && name.length >= 5;

  const isDateBooked = (date, time = null) => {
    return BOOKED_SLOTS.some(slot => slot.date === date && (slot.time === null || slot.time === time));
  };

  const isDateInFuture = (date) => {
    return new Date(date) > new Date();
  };

  const generateQRCode = async (bookingRef) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(
        `${window.location.origin}?booking=${bookingRef}`,
        {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          quality: 0.95,
          margin: 1,
          width: 300,
          color: { dark: '#d4af37', light: '#1a1a2e' }
        }
      );
      setQrCode(qrDataUrl);
      return qrDataUrl;
    } catch (err) {
      console.error('QR Code generation failed:', err);
      showToast("Failed to generate QR code", "error");
    }
  };

  const generateBookingQRCode = async () => {
    try {
      const bookingUrl = `${window.location.origin}?ref=booking`;
      const qrDataUrl = await QRCode.toDataURL(bookingUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 2,
        width: 500,
        color: { dark: '#d4af37', light: '#1a1a2e' }
      });
      setBookingQRCode(qrDataUrl);
      return qrDataUrl;
    } catch (err) {
      console.error('Booking QR Code generation failed:', err);
      showToast("Failed to generate QR code", "error");
    }
  };

  const downloadBookingQRImage = () => {
    if (!bookingQRCode) return;

    try {
      const link = document.createElement('a');
      link.href = bookingQRCode;
      link.download = `ShimeEvents_BookingQR_${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(t("qrCodeDownloaded"), "success");
    } catch (error) {
      showToast("Failed to download QR code", "error");
    }
  };

  const downloadBookingQRPDF = async () => {
    if (!bookingQRCode) return;

    try {
      setLoading(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'A4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const goldColor = [212, 175, 55];
      const textColor = [26, 26, 46];

      // Background
      doc.setFillColor(245, 245, 245);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Header
      doc.setTextColor(...goldColor);
      doc.setFontSize(28);
      doc.setFont(undefined, 'bold');
      doc.text('SHIME EVENTS', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(...textColor);
      doc.text('& PLANNING', pageWidth / 2, 30, { align: 'center' });

      // Subtitle
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Professional Event Planning & Coordination', pageWidth / 2, 38, { align: 'center' });

      // Divider line
      doc.setDrawColor(...goldColor);
      doc.setLineWidth(1);
      doc.line(20, 42, pageWidth - 20, 42);

      // QR Code Title
      doc.setFontSize(16);
      doc.setTextColor(...textColor);
      doc.setFont(undefined, 'bold');
      doc.text('📱 SCAN TO BOOK YOUR EVENT', pageWidth / 2, 55, { align: 'center' });

      // QR Code
      doc.addImage(bookingQRCode, 'PNG', (pageWidth - 80) / 2, 70, 80, 80);

      // Instructions
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(...textColor);
      doc.text('How to Use:', 20, 165);

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const instructions = [
        '1. Print this page or display on your device',
        '2. Customer scans QR code with their phone',
        '3. Booking form opens automatically',
        '4. Customer completes booking in minutes'
      ];

      let yPos = 175;
      instructions.forEach(instruction => {
        doc.text(instruction, 25, yPos);
        yPos += 8;
      });

      // Booking URL
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont(undefined, 'italic');
      doc.text(`Booking URL: ${window.location.origin}?ref=booking`, 20, 215);

      // Contact Info
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(...goldColor);
      doc.text('Contact Information:', 20, 225);

      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      const contactInfo = [
        '📱 WhatsApp: +251 91 234 5678',
        '✉️ Email: contact@shimeeventplaning.com',
        '🌐 Website: shimeeventplaning.com'
      ];

      yPos = 232;
      contactInfo.forEach(info => {
        doc.text(info, 25, yPos);
        yPos += 7;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Save PDF
      const fileName = `ShimeEvents_BookingQR_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      showToast("PDF downloaded successfully!", "success");
      setLoading(false);
    } catch (error) {
      console.error('PDF generation failed:', error);
      showToast("Failed to generate PDF", "error");
      setLoading(false);
    }
  };

  const generateElectronicSignature = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    ctx.font = "italic 48px 'Playfair Display', serif";
    ctx.fillStyle = "#d4af37";
    ctx.textAlign = "center";

    const nameParts = bookingData.fullName.split(" ");
    const signature = nameParts.length >= 2
      ? `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`
      : nameParts[0];

    ctx.fillText(signature, canvas.width / 2, 55);

    ctx.font = "bold 10px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right";
    const timestamp = new Date().toLocaleString();
    ctx.fillText(`Generated: ${timestamp}`, canvas.width - 20, 85);

    return canvas.toDataURL("image/png");
  };

  const generatePDF = async () => {
    try {
      setLoading(true);
      showToast(t("generatingPdf"), "info");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const goldColor = [212, 175, 55];
      const textColor = [255, 255, 255];
      const refNum = bookingRefNum || `SE-${Date.now()}`;
      const today = new Date().toLocaleDateString();
      const pkgInfo = PACKAGES.find(p => p.name === bookingData.plan);
      const deposit = Math.round((pkgInfo?.price || 0) / 2); // 50% deposit

      // PAGE 1 - BOOKING CONFIRMATION
      doc.setFillColor(26, 26, 46);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Header
      doc.setTextColor(...goldColor);
      doc.setFontSize(32);
      doc.text("SHIME EVENTS", pageWidth / 2, 20, { align: "center" });
      doc.setFontSize(12);
      doc.text("& PLANNING", pageWidth / 2, 28, { align: "center" });

      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      doc.text("Professional Event Planning & Coordination", pageWidth / 2, 35, { align: "center" });

      doc.setLineWidth(0.5);
      doc.setDrawColor(...goldColor);
      doc.line(20, 38, pageWidth - 20, 38);

      // Booking Reference
      doc.setFontSize(11);
      doc.setTextColor(...goldColor);
      doc.text("BOOKING CONFIRMATION", pageWidth / 2, 48, { align: "center" });

      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      doc.text(`Reference: ${refNum}`, pageWidth / 2, 55, { align: "center" });
      doc.text(`Date: ${today}`, pageWidth / 2, 61, { align: "center" });

      // QR Code
      if (qrCode) {
        doc.addImage(qrCode, "PNG", pageWidth / 2 - 25, 68, 50, 50);
      }

      // Event Summary
      let yPos = 125;
      doc.setTextColor(...goldColor);
      doc.setFontSize(10);
      doc.text("EVENT DETAILS", 20, yPos);
      doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);

      yPos += 10;
      doc.setTextColor(...textColor);
      doc.setFontSize(9);

      const eventSummary = [
        [`Event Type: ${bookingData.eventType || "N/A"}`],
        [`Date & Time: ${bookingData.eventDate || "N/A"} at ${bookingData.eventTime || "N/A"}`],
        [`Location: ${bookingData.eventCity || "N/A"}, ${bookingData.eventCountry || "N/A"}`],
        [`Venue: ${bookingData.eventLocation || "N/A"}`],
        [`Package: ${bookingData.plan || "N/A"}`],
      ];

      eventSummary.forEach(([text]) => {
        doc.text(text, 25, yPos);
        yPos += 6;
      });

      // Payment Section
      yPos += 5;
      doc.setTextColor(...goldColor);
      doc.setFontSize(10);
      doc.text("NON-REFUNDABLE DEPOSIT AMOUNT", 20, yPos);
      doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);

      yPos += 12;
      doc.setFontSize(18);
      doc.setTextColor([255, 215, 0]); // Bright gold for amount
      doc.text(`ETB ${deposit.toLocaleString()}`, 20, yPos);

      doc.setFontSize(8);
      doc.setTextColor(...textColor);
      doc.text("(50% of total package cost - required to secure your booking)", 20, yPos + 8);

      // Payment Instructions
      yPos += 18;
      doc.setTextColor(...goldColor);
      doc.setFontSize(10);
      doc.text("PAYMENT INSTRUCTIONS", 20, yPos);
      doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);

      yPos += 10;
      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      const paymentInfo = [
        `Payment Method: CBE WALLET`,
        `Account Number: 1000XXXXXXXX`,
        `Account Name: Shime Events & Planning`,
        `Amount: ETB ${deposit.toLocaleString()}`,
      ];

      paymentInfo.forEach((info) => {
        doc.text(info, 25, yPos);
        yPos += 6;
      });

      // Contact
      yPos += 5;
      doc.setTextColor(...goldColor);
      doc.setFontSize(9);
      doc.text("After payment, send proof to:", 20, yPos);
      yPos += 5;
      doc.setTextColor(...textColor);
      doc.setFontSize(8);
      doc.text("WhatsApp: +251 91 234 5678 | Email: contact@shimeeventplaning.com", 25, yPos);

      // PAGE 2 - TERMS & CONDITIONS
      doc.addPage();
      doc.setFillColor(26, 26, 46);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      doc.setTextColor(...goldColor);
      doc.setFontSize(14);
      doc.text("TERMS & CONDITIONS", 20, 15);
      doc.line(20, 17, pageWidth - 20, 17);

      doc.setTextColor(...textColor);
      doc.setFontSize(8);
      const termsText = `1. A 50% non-refundable deposit is required to secure your event booking.
2. Full payment is due 14 days before your scheduled event date.
3. Cancellations made within 7 days of the event will result in forfeiture of 50% of total payment.
4. Shime Events & Planning reserves the right to substitute vendors of equal or superior quality.
5. The client is fully responsible for providing accurate and complete information during the booking process.
6. Any requested changes to event date, venue, or guest count must be submitted in writing.
7. Force majeure clauses apply to events affected by circumstances beyond our control.
8. All disputes arising from this agreement shall be subject to Ethiopian jurisdiction.

By accepting this booking, you confirm that you have reviewed and accepted all terms and conditions.
Your signature/acceptance serves as binding agreement to this contract.`;

      const termsLines = doc.splitTextToSize(termsText, pageWidth - 40);
      let termsY = 25;
      termsLines.forEach((line) => {
        doc.text(line, 20, termsY);
        termsY += 4;
      });

      // Acceptance line
      doc.setTextColor(...goldColor);
      doc.setFontSize(9);
      doc.text("Client Acceptance", 20, pageHeight - 15);
      doc.line(20, pageHeight - 12, 70, pageHeight - 12);

      doc.setTextColor(...textColor);
      doc.setFontSize(7);
      doc.text("Signature / Date", 25, pageHeight - 8);

      doc.setTextColor(...goldColor);
      doc.setFontSize(8);
      doc.text(`Signed on: ${today}`, 20, agreementY);
      doc.text(`Generated: Automated Electronic Signature`, 20, agreementY + 5);
      doc.text(`Booking Reference: ${refNum}`, 20, agreementY + 10);

      // Footer
      doc.setFillColor(40, 40, 70);
      doc.rect(0, pageHeight - 25, pageWidth, 25);

      doc.setTextColor(...goldColor);
      // Save PDF
      const fileName = `ShimeEvents_Booking_${refNum.replace("SE-", "")}.pdf`;
      doc.save(fileName);

      showToast("PDF downloaded successfully!", "success");
      setLoading(false);
    } catch (error) {
      console.error("PDF generation failed:", error);
      showToast("Failed to generate PDF", "error");
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode || !bookingRefNum) return;

    try {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `ShimeEvents_QRCode_${bookingRefNum}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("QR Code downloaded!", "success");
    } catch (error) {
      showToast("Failed to download QR Code", "error");
    }
  };

  const copyToClipboard = async (text) => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(text);
      showToast(t("copied"), "success", 2000);
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      showToast("Failed to copy", "error");
      setCopying(false);
    }
  };

  const handleNext = (value) => {
    let isValid = true;
    let errorMsg = "";

    switch (step) {
      case 0:
        setLanguage(value);
        addUserMessage(value === "en" ? "🇬🇧 English" : "🇪🇹 አማርኛ");
        setStep(1);
        addAgentMessage(getBilingualText("askNationality"));
        showToast(t("success"), "success", 2000);
        return;

      case 1:
        if (!value || value.trim().length < 2) {
          isValid = false;
          errorMsg = "Please enter your nationality (at least 2 characters)";
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, nationality: value });
          setStep(2);
          addAgentMessage(getBilingualText("askResidency"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;

      case 2:
        if (!value || value.trim().length < 2) {
          isValid = false;
          errorMsg = "Please enter your country of residence (at least 2 characters)";
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, residency: value });
          setStep(3);
          addAgentMessage(getBilingualText("askPhone"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;

      case 3:
        if (!validatePhone(value)) {
          isValid = false;
          errorMsg = getBilingualText("invalidPhone");
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, phoneNumber: value });

          const phoneCode = value.substring(0, value.indexOf("9"));
          const residenceCode = PHONE_CODES[bookingData.residency];
          if (residenceCode && !phoneCode.startsWith(residenceCode)) {
            addAgentMessage(getBilingualText("phoneCountryMismatch"));
          }

          setStep(4);
          addAgentMessage(getBilingualText("askEmail"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;

      case 4:
        if (!validateEmail(value)) {
          isValid = false;
          errorMsg = getBilingualText("invalidEmail");
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, email: value });
          setStep(5);
          addAgentMessage(getBilingualText("askFullName"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;

      case 5:
        if (!validateName(value)) {
          isValid = false;
          errorMsg = getBilingualText("invalidName");
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, fullName: value });
          setStep(6);
          addAgentMessage(getBilingualText("askIdType"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;

      case 6:
        if (!validateId(value)) {
          isValid = false;
          errorMsg = getBilingualText("invalidId");
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, idNumber: value });
          setStep(7);
          addAgentMessage(getBilingualText("askPassword"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;

      case 7:
        if (value.length < 6) {
          isValid = false;
          errorMsg = "PIN must be at least 6 digits";
        }
        if (isValid) {
          addUserMessage("••••••");
          setBookingData({ ...bookingData, verificationPin: value, contactPhone: value });
          setStep(8);
          addAgentMessage(getBilingualText("askContactMethod"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;

      case 8:
        addUserMessage(value);
        setBookingData({ ...bookingData, contactMethod: value });
        setStep(9);
        addAgentMessage(getBilingualText("askEventType"));
        showToast(t("success"), "success", 2000);
        return;

      case 9:
        addUserMessage(value);
        setBookingData({ ...bookingData, eventType: value });
        setStep(10);
        addAgentMessage(getBilingualText("selectPackage"));
        showToast(t("success"), "success", 2000);
        return;

      case 10:
        addUserMessage(`📦 ${value}`);
        setBookingData({ ...bookingData, plan: value });
        setStep(11);
        addAgentMessage(getBilingualText("askEventCountry"));
        showToast(t("success"), "success", 2000);
        return;

      case 11:
        if (!value || value.trim().length < 2) {
          isValid = false;
          errorMsg = "Please enter the event country (at least 2 characters)";
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, eventCountry: value });

          if (value.toLowerCase() !== bookingData.residency.toLowerCase()) {
            addAgentMessage(getBilingualText("eventCountryMismatch"));
          }

          setStep(12);
          addAgentMessage(getBilingualText("askEventCity"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;

      case 12:
        if (!value || value.length < 2) {
          isValid = false;
          errorMsg = "Please enter a valid city";
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, eventCity: value });
          setStep(13);
          addAgentMessage(getBilingualText("askDate"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;

      case 13:
        if (!isDateInFuture(value)) {
          isValid = false;
          errorMsg = "Please select a future date";
        } else if (isDateBooked(value)) {
          isValid = false;
          errorMsg = getBilingualText("dateBooked");
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, eventDate: value });
          setStep(14);
          addAgentMessage(getBilingualText("askTime"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;

      case 14:
        if (isDateBooked(bookingData.eventDate, value)) {
          isValid = false;
          errorMsg = getBilingualText("timeBooked");
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, eventTime: value });
          setStep(15);
          addAgentMessage(getBilingualText("askLocation"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;

      case 15:
        if (!value || value.length < 3) {
          isValid = false;
          errorMsg = "Please enter a valid venue";
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, eventLocation: value });
          setStep(16);
          addAgentMessage(getBilingualText("noticeTitle"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;

      case 17:
        setStep(18);
        addAgentMessage(getBilingualText("bookingConfirmed"));
        showToast(t("success"), "success", 2000);
        return;

      default:
        return;
    }

    setInputValue("");
  };

  const goBack = () => {
    if (step > 0 && step < 16) {
      setStep(step - 1);
      setError("");
      showToast("Going back...", "info", 1000);
    }
  };

  const handlePackageSelect = (planName) => {
    handleNext(planName);
  };

  const handleEventType = (type) => {
    handleNext(type);
  };

  const handleContactMethod = (method) => {
    handleNext(method);
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    addAgentMessage(getBilingualText("termsAccepted"));
    showToast(t("termsAccepted"), "success");
  };

  const resetBooking = () => {
    setStep(0);
    setLanguage(null);
    setMessages([]);
    setBookingData({});
    setInputValue("");
    setTermsAccepted(false);
    setError("");
    setQrCode(null);
    setBookingRefNum(null);
    addAgentMessage(`${t("welcome")}\n\n${t("welcomeSubtitle")}\n\n${t("selectLanguage")}`);
    showToast("Booking reset", "info");
  };

  useEffect(() => {
    if (step === 0 && messages.length === 0) {
      addAgentMessage(`${translations.en.welcome}\n\n${translations.en.welcomeSubtitle}\n\n${translations.en.selectLanguage}`);
    }
  }, []);

  useEffect(() => {
    if (step === 17 && !bookingRefNum) {
      const refNum = `SE-${Date.now()}`;
      setBookingRefNum(refNum);
      generateQRCode(refNum);
    }
  }, [step]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Check URL parameters on load
    const params = new URLSearchParams(window.location.search);

    // Check if this is QR code download page
    if (params.get('page') === 'qrcode') {
      setShowQRPage(true);
      return;
    }

    // Check if user came from QR code scan
    if (params.get('ref') === 'booking' && step === 0) {
      // Auto-start with English, user can still change language
      setLanguage('en');
      setStep(1);
      addAgentMessage(`${translations.en.welcome}\n\n${translations.en.welcomeSubtitle}`);
      addAgentMessage(translations.en.askNationality);
    }
  }, []);

  useEffect(() => {
    // Generate booking QR code on component load
    if (!bookingQRCode) {
      generateBookingQRCode();
    }
  }, []);

  const getProgressPercentage = () => {
    return Math.min((step / 17) * 100, 100);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => handleNext("en")}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition transform hover:scale-105 shadow-lg font-semibold"
              aria-label="Select English language"
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => handleNext("am")}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition transform hover:scale-105 shadow-lg font-semibold"
              aria-label="Select Amharic language"
            >
              🇪🇹 አማርኛ
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-yellow-400 text-sm font-semibold mb-2">
                <span className="text-red-400">*</span> {t("required")}
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setError("");
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && inputValue.trim()) {
                    handleNext(inputValue);
                    setInputValue("");
                  }
                }}
                placeholder="Type your country name..."
                className="w-full px-4 py-3 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 font-semibold shadow-lg"
                autoFocus
                aria-label="Enter country of residence"
              />
            </div>
            {error && <div className="text-red-400 text-sm font-semibold bg-red-900 bg-opacity-20 p-2 rounded">{error}</div>}
            <div className="flex gap-3">
              {step > 0 && step < 17 && (
                <button
                  onClick={goBack}
                  className="flex-1 px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-bold transition"
                  aria-label="Go to previous step"
                >
                  {t("back")}
                </button>
              )}
              <button
                onClick={() => {
                  if (inputValue.trim()) {
                    handleNext(inputValue);
                    setInputValue("");
                  }
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition text-lg transform hover:scale-105 shadow-lg"
                aria-label="Submit current answer and continue"
              >
                {t("next")}
              </button>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="flex flex-col gap-3">
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleContactMethod("Telegram")}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 font-semibold"
                aria-label="Select Telegram as contact method"
              >
                📱 Telegram
              </button>
              <button
                onClick={() => handleContactMethod("WhatsApp")}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition transform hover:scale-105 font-semibold"
                aria-label="Select WhatsApp as contact method"
              >
                💬 WhatsApp
              </button>
            </div>
            <button
              onClick={goBack}
              className="w-full px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition text-sm font-semibold"
              aria-label="Go back to previous question"
            >
              {t("back")}
            </button>
          </div>
        );

      case 10:
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { type: "💍 Wedding", name: "Wedding" },
                { type: "🎓 Graduation", name: "Graduation" },
                { type: "🎂 Birthday", name: "Birthday" },
                { type: "💕 Anniversary", name: "Anniversary" },
                { type: "🎉 Corporate", name: "Corporate" },
                { type: "✨ Other", name: "Other" },
              ].map((event) => (
                <button
                  key={event.name}
                  onClick={() => handleEventType(event.name)}
                  className="p-3 bg-gradient-to-br from-indigo-600 to-indigo-700 border border-indigo-500 hover:border-indigo-400 rounded-lg hover:bg-gradient-to-br hover:from-indigo-700 hover:to-indigo-800 transition text-center font-semibold text-white"
                  aria-label={`Select ${event.name} event type`}
                >
                  {event.type}
                </button>
              ))}
            </div>
            <button
              onClick={goBack}
              className="w-full px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition text-sm font-semibold"
              aria-label="Go back to previous question"
            >
              {t("back")}
            </button>
          </div>
        );

      case 10:
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PACKAGES.map((pkg) => {
                const depositAmount = Math.round(pkg.price / 2); // 50% deposit
                return (
                  <button
                    key={pkg.id}
                    onClick={() => handlePackageSelect(pkg.name)}
                    className="p-6 bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-yellow-500 hover:border-yellow-400 rounded-xl hover:bg-gradient-to-br hover:from-yellow-700 hover:to-yellow-800 transition text-left transform hover:scale-105 shadow-lg"
                    aria-label={`Select ${pkg.name} package`}
                  >
                    <div className="text-3xl mb-2">{pkg.icon}</div>
                    <div className="font-bold text-lg text-white">{pkg.name}</div>
                    <div className="text-gray-300 text-sm mt-1">{pkg.description}</div>
                    <div className="mt-3 pt-3 border-t border-yellow-500 border-opacity-30">
                      <div className="text-xs text-gray-400 mb-1">{language === 'en' ? 'Non-Refundable Deposit (50%)' : 'ይመላሰ ያልሚችል ዝቅ ብለህ ክፍያ (50%)'}</div>
                      <div className="text-2xl font-bold text-yellow-300">ETB {depositAmount.toLocaleString()}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={goBack}
              className="w-full px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition text-sm font-semibold"
              aria-label="Go back to previous question"
            >
              {t("back")}
            </button>
          </div>
        );


      case 16:
        return (
          <div className="w-full max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-500 rounded-xl p-6 space-y-4 shadow-2xl">
            <div className="bg-slate-900 p-4 rounded-lg text-white text-sm whitespace-pre-line mb-4 border-l-4 border-yellow-500">
              {getBilingualText("noticeBody")}
            </div>

            {!showTerms && (
              <button
                onClick={() => setShowTerms(true)}
                className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-yellow-400 transition font-semibold"
                aria-label="Show terms and conditions"
              >
                📄 {language === "en" ? "View Terms & Conditions" : "ውሎችን ይመልከቱ"}
              </button>
            )}

            {showTerms && (
              <div className="bg-slate-900 p-4 rounded-lg text-white text-xs max-h-64 overflow-y-auto mb-4 border border-yellow-500 border-opacity-30">
                <h3 className="text-yellow-400 font-bold mb-3">{getBilingualText("termsTitle")}</h3>
                <p className="whitespace-pre-line leading-relaxed">{getBilingualText("termsText")}</p>
              </div>
            )}

            {!termsAccepted ? (
              <button
                onClick={handleAcceptTerms}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition text-lg transform hover:scale-105"
                aria-label="Accept terms and conditions"
              >
                {getBilingualText("acceptTerms")}
              </button>
            ) : (
              <>
                <div className="text-green-400 text-sm font-semibold bg-green-900 bg-opacity-30 p-3 rounded-lg border border-green-500">
                  ✅ {getBilingualText("termsAccepted")}
                </div>
                <button
                  onClick={() => handleNext("")}
                  className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition text-lg transform hover:scale-105"
                  aria-label="Proceed to booking confirmation"
                >
                  {getBilingualText("proceedBooking")}
                </button>
              </>
            )}
          </div>
        );

      case 17:
        const pkgInfo = PACKAGES.find(p => p.name === bookingData.plan);
        return (
          <div className="w-full max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-500 rounded-xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-3xl font-bold text-yellow-400 text-center mb-6">✨ {getBilingualText("viewBooking")}</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900 p-4 rounded-lg border border-yellow-500 border-opacity-30">
                <div className="text-yellow-400 text-xs font-semibold mb-1">Client</div>
                <div className="text-white font-bold text-sm">{bookingData.fullName}</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg border border-yellow-500 border-opacity-30">
                <div className="text-yellow-400 text-xs font-semibold mb-1">Email</div>
                <div className="text-white font-bold text-sm truncate">{bookingData.email}</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg border border-yellow-500 border-opacity-30">
                <div className="text-yellow-400 text-xs font-semibold mb-1">Package</div>
                <div className="text-white font-bold text-sm">{bookingData.plan}</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg border border-yellow-500 border-opacity-30">
                <div className="text-yellow-400 text-xs font-semibold mb-1">Deposit</div>
                <div className="text-white font-bold text-sm">ETB {(pkgInfo?.price || 0).toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg border border-yellow-500 border-opacity-30 space-y-2 text-sm text-white">
              <div><strong className="text-yellow-400">Reference:</strong> {bookingRefNum}</div>
              <div><strong className="text-yellow-400">Event Date:</strong> {bookingData.eventDate} at {bookingData.eventTime}</div>
              <div><strong className="text-yellow-400">Location:</strong> {bookingData.eventCity}, {bookingData.eventCountry}</div>
              <div><strong className="text-yellow-400">Contact:</strong> {bookingData.contactMethod}</div>
            </div>

            {bookingRefNum && (
              <div className="bg-slate-900 p-4 rounded-lg border-2 border-yellow-500 text-center">
                <div className="text-yellow-400 font-bold mb-3">📱 Booking QR Code</div>
                <div className="flex justify-center">
                  {qrCode ? (
                    <img
                      src={qrCode}
                      alt="Booking QR Code"
                      className="w-40 h-40 border-2 border-yellow-500 rounded-lg p-2 bg-white"
                    />
                  ) : (
                    <div className="w-40 h-40 bg-slate-700 rounded-lg flex items-center justify-center text-white">
                      <Spinner />
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-300 mt-3">Reference: {bookingRefNum}</div>
                <div className="flex gap-2 mt-3">
                  {qrCode && (
                    <button
                      onClick={downloadQRCode}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition transform hover:scale-105 text-xs"
                      aria-label="Download QR code"
                    >
                      {t("downloadQr")}
                    </button>
                  )}
                  {bookingRefNum && (
                    <button
                      onClick={() => copyToClipboard(bookingRefNum)}
                      className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-yellow-400 rounded-lg font-semibold transition text-xs"
                      disabled={copying}
                      aria-label="Copy booking reference"
                    >
                      {copying ? "✓ Copied" : "📋 Copy Ref"}
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={generatePDF}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition text-lg mb-2 transform hover:scale-105 disabled:opacity-50"
              disabled={loading}
              aria-label="Download booking contract PDF"
            >
              {loading ? <Spinner /> : getBilingualText("downloadPdf")}
            </button>

            <button
              onClick={() => window.open("https://wa.me/251912345678", "_blank")}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition transform hover:scale-105"
              aria-label="Contact us via WhatsApp"
            >
              {getBilingualText("contactUs")}
            </button>

            <button
              onClick={resetBooking}
              className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-indigo-800 transition"
              aria-label="Start a new booking"
            >
              {t("startOver")}
            </button>

            <div className="bg-slate-900 p-4 rounded-lg text-white text-xs whitespace-pre-line border-l-4 border-yellow-500">
              {getBilingualText("sendInstructions")}
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full max-w-md space-y-3">
            <div>
              <label className="block text-yellow-400 text-sm font-semibold mb-2">
                {step < 17 && <span className="text-red-400">*</span>} {t("required")}
              </label>
              <input
                type={step === 7 ? "password" : step === 14 ? "date" : step === 15 ? "time" : "text"}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setError("");
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && inputValue.trim()) {
                    handleNext(inputValue);
                    setInputValue("");
                  }
                }}
                placeholder={step === 14 ? "YYYY-MM-DD" : step === 15 ? "HH:MM" : ""}
                className="w-full px-4 py-3 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 font-semibold shadow-lg"
                autoFocus
                aria-label={`Input for step ${step}`}
              />
            </div>
            {error && <div className="text-red-400 text-sm font-semibold bg-red-900 bg-opacity-20 p-2 rounded">{error}</div>}
            <div className="flex gap-3">
              {step > 0 && step < 17 && (
                <button
                  onClick={goBack}
                  className="flex-1 px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-bold transition"
                  aria-label="Go to previous step"
                >
                  {t("back")}
                </button>
              )}
              <button
                onClick={() => {
                  if (inputValue.trim()) {
                    handleNext(inputValue);
                    setInputValue("");
                  }
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition text-lg transform hover:scale-105 shadow-lg"
                aria-label="Submit current answer and continue"
              >
                {t("next")}
              </button>
            </div>
          </div>
        );
    }
  };

  // Show QR Code Download Page
  if (showQRPage) {
    return (
      <QRCodeDownloadPage
        bookingQRCode={bookingQRCode}
        loading={loading}
        onDownloadImage={downloadBookingQRImage}
        onDownloadPDF={downloadBookingQRPDF}
        onGoBack={() => setShowQRPage(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.05) 0%, transparent 50%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        * { font-family: 'Lato', sans-serif; }
        .brand-font { font-family: 'Playfair Display', serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-in; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideDown { animation: slideDown 0.3s ease-in; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 0.6s linear infinite; }
      `}</style>

      <Toast {...toast} />

      <header className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 border-b-2 border-yellow-500 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-6 animate-fadeIn">
            <h1 className="brand-font text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">Shime Events</h1>
            <p className="text-white text-sm opacity-90 tracking-wide">Professional Event Planning & Coordination</p>
          </div>

          {step > 0 && language && step < 17 && (
            <div className="space-y-2 animate-fadeIn">
              <div className="flex justify-between items-center text-xs text-yellow-400 mb-2 font-semibold">
                <span>{t("stepOf")} {step}/16</span>
                <span>Language: {language === "en" ? "🇬🇧 English" : "🇪🇹 አማርኛ"}</span>
                <span>{Math.round(getProgressPercentage())}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden border border-yellow-500 border-opacity-30">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500 shadow-lg shadow-yellow-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 pb-20">
        <div className="space-y-4 mb-8 max-h-[60vh] overflow-y-auto pr-4 rounded-lg">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`animate-fadeIn flex ${msg.type === "agent" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-sm px-4 py-3 rounded-xl ${
                  msg.type === "agent"
                    ? "bg-gradient-to-br from-slate-700 to-slate-800 border-l-4 border-yellow-500 text-white shadow-lg"
                    : "bg-gradient-to-br from-yellow-500 to-yellow-600 text-slate-900 font-semibold shadow-lg"
                } whitespace-pre-line text-sm leading-relaxed`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="max-w-md mx-auto space-y-4">
          {renderStep()}
        </div>

        {/* Floating QR Button */}
        <button
          onClick={() => setShowQRSection(!showQRSection)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full shadow-2xl hover:from-purple-700 hover:to-purple-800 transition transform hover:scale-110 flex items-center justify-center font-bold text-xl z-40"
          aria-label="Show booking QR code"
          title="Booking QR Code"
        >
          📱
        </button>

        {/* QR Code Modal */}
        {showQRSection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-500 rounded-xl p-8 max-w-md w-full shadow-2xl animate-fadeIn">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">{t("scanToBook")}</h2>

              <div className="bg-white p-4 rounded-lg mb-6 flex justify-center">
                {bookingQRCode && (
                  <img src={bookingQRCode} alt="Booking QR Code" className="w-64 h-64" />
                )}
              </div>

              <div className="space-y-3 text-white text-sm mb-6">
                <p className="text-yellow-300 font-semibold">{t("qrCodeTitle")}</p>
                <p className="text-gray-300">{t("qrCodeSubtitle")}</p>
                <p className="text-xs text-gray-400">
                  Booking URL: {window.location.origin}?ref=booking
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={downloadBookingQRImage}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition"
                  disabled={loading}
                >
                  {loading ? "⏳ Processing..." : "📥 Download as PNG"}
                </button>

                <button
                  onClick={downloadBookingQRPDF}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-bold hover:from-red-700 hover:to-red-800 transition"
                  disabled={loading}
                >
                  {loading ? "⏳ Processing..." : "📄 Download as PDF"}
                </button>

                <button
                  onClick={() => window.print()}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition"
                >
                  {t("printQRCode")}
                </button>

                <button
                  onClick={() => {
                    const url = `${window.location.origin}?ref=booking`;
                    const message = `Book your event with Shime Events! Scan this link: ${url}`;
                    if (navigator.share) {
                      navigator.share({ title: 'Shime Events Booking', text: message, url });
                    } else {
                      copyToClipboard(url);
                      showToast("Booking link copied!", "success");
                    }
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-indigo-800 transition"
                >
                  {t("shareQRCode")}
                </button>

                <button
                  onClick={() => setShowQRSection(false)}
                  className="w-full px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
