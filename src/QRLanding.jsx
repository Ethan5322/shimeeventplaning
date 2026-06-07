import { useState, useEffect } from "react";
import QRCode from "qrcode";

const QRLanding = ({ onScan }) => {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("en");

  const translations = {
    en: {
      scanTitle: "Scan to Book Your Event",
      scanSubtitle: "Start your booking journey with Shime Events & Planning",
      scanText: "Point your phone camera at the code below",
      or: "OR",
      directLink: "Click here to book directly",
      features: [
        "✨ Professional Event Planning",
        "🎉 Experienced Team",
        "💎 Premium Packages",
        "🌍 Worldwide Service",
      ],
      footer: "Shime Events & Planning | Making Celebrations Memorable",
      switchLanguage: "አማርኛ",
    },
    am: {
      scanTitle: "ዝግጅትዎን ለመዝገብ ስክ ያድርጉ",
      scanSubtitle: "በ Shime Events & Planning ያ አካውንት መፍጠር ጀምሩ",
      scanText: "የእርስዎን ስልክ ካሜራ ከዚህ በታች ወደ ኮዱ ያመልክቱ",
      or: "ወይም",
      directLink: "ቀጥታ ለመዝገብ እዚህ ይጫኑ",
      features: [
        "✨ ሙያዊ ዝግጅት",
        "🎉 ልምድ ያለበት ቡድን",
        "💎 ፕሪሚየም ፓኬጆች",
        "🌍 የዓለም ሙያ",
      ],
      footer: "Shime Events & Planning | ዝግጅቶችን ታሪክ አይነት",
      switchLanguage: "English",
    },
  };

  const t = (key) => translations[language]?.[key] || key;

  // Generate QR Code
  useEffect(() => {
    const generateQR = async () => {
      try {
        setLoading(true);
        const bookingUrl = `${window.location.origin}?ref=booking`;
        const qrImage = await QRCode.toDataURL(bookingUrl, {
          errorCorrectionLevel: "H",
          type: "image/webp",
          quality: 0.95,
          margin: 2,
          width: 500,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrCode(qrImage);
      } catch (error) {
        console.error("QR generation error:", error);
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, []);

  const handleDirectBooking = () => {
    window.location.href = `${window.location.origin}?ref=booking`;
  };

  const downloadQRCode = async () => {
    if (!qrCode) return;
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = "shime-events-booking-qr.webp";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Language Toggle */}
      <button
        onClick={() => setLanguage(language === "en" ? "am" : "en")}
        className="absolute top-6 right-6 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 rounded-full font-bold hover:from-yellow-600 hover:to-yellow-700 transition transform hover:scale-105 shadow-lg text-sm"
        aria-label="Toggle language"
      >
        {t("switchLanguage")}
      </button>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-2xl w-full">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-2">
          <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
            SHIME
          </h1>
          <p className="text-yellow-300 text-lg font-bold tracking-widest">
            EVENTS & PLANNING
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full"></div>
        </div>

        {/* Main Scan Section */}
        <div className="relative mb-8">
          {/* Outer Frame */}
          <div className="bg-gradient-to-br from-yellow-500 via-yellow-400 to-orange-500 p-1 rounded-3xl shadow-2xl">
            {/* Inner Container */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-12 rounded-3xl space-y-8">
              {/* Title */}
              <div className="text-center space-y-3">
                <h2 className="text-3xl sm:text-4xl font-bold text-yellow-300">
                  {t("scanTitle")}
                </h2>
                <p className="text-gray-300 text-lg font-semibold">
                  {t("scanSubtitle")}
                </p>
              </div>

              {/* QR Code Display */}
              <div className="flex justify-center">
                <div className="relative">
                  {/* QR Code Frame Border */}
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-2 rounded-2xl shadow-2xl">
                    <div className="bg-white p-4 rounded-xl">
                      {loading ? (
                        <div className="w-72 h-72 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <div className="w-12 h-12 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin mx-auto"></div>
                            <p className="text-white text-sm font-semibold">
                              {language === "en" ? "Generating..." : "ሲፈጸም..."}
                            </p>
                          </div>
                        </div>
                      ) : qrCode ? (
                        <img
                          src={qrCode}
                          alt="Shime Events Booking QR Code"
                          className="w-72 h-72 rounded-lg"
                        />
                      ) : null}
                    </div>
                  </div>

                  {/* Corner decorations */}
                  <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-yellow-400"></div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-yellow-400"></div>
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-yellow-400"></div>
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-yellow-400"></div>
                </div>
              </div>

              {/* Scan Instructions */}
              <div className="text-center space-y-3 px-4">
                <p className="text-yellow-300 text-lg font-bold">
                  {t("scanText")}
                </p>
                <div className="flex items-center justify-center gap-4 text-gray-400">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-400"></div>
                  <span className="font-semibold">{t("or")}</span>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-400"></div>
                </div>

                {/* Direct Booking Button */}
                <button
                  onClick={handleDirectBooking}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-2xl hover:from-green-600 hover:to-green-700 transition transform hover:scale-105 shadow-2xl"
                  aria-label="Click to start booking"
                >
                  ➜ {t("directLink")}
                </button>

                {/* Download Button */}
                <button
                  onClick={downloadQRCode}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-xl hover:from-purple-700 hover:to-purple-800 transition transform hover:scale-105 shadow-lg text-sm"
                  aria-label="Download QR code"
                >
                  ⬇️ {language === "en" ? "Download QR Code" : "QR ኮድ ያውርዱ"}
                </button>
              </div>
            </div>
          </div>

          {/* "Scan Me" Label at Bottom */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 font-black px-8 py-3 rounded-full text-center text-lg shadow-2xl border-4 border-yellow-400 whitespace-nowrap">
            📱 {language === "en" ? "SCAN ME FOR SHIME EVENT PLANNING" : "ለ SHIME ዝግጅት ስክ ያድርጉ"}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
          {t("features").map((feature, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-500 border-opacity-30 p-4 rounded-xl text-white font-semibold text-center hover:border-opacity-100 transition"
            >
              {feature}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-400 text-sm font-semibold pb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-yellow-500"></div>
            <p>{t("footer")}</p>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-yellow-500"></div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {language === "en"
              ? "Making celebrations memorable, one event at a time"
              : "አንድ ዝግጅት በአንድ ጊዜ ዝግጅቶችን ታሪክ አይነት"}
          </p>
        </div>
      </div>

      {/* Inline CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @media print {
          body {
            background: white;
          }
          .absolute {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default QRLanding;
