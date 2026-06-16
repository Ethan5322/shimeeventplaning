import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import emailjs from "@emailjs/browser";

import { gregorianToEthiopian, formatDateForDisplay } from "./EthiopianCalendar";
import EthiopianDatePicker from "./EthiopianDatePicker";
import { generateCompanyQRCode, downloadCompanyQRPDF } from "./CompanyQRPDF";
import { supabase } from "./supabaseClient";

const translations = {
  en: {
    welcome: "Welcome to Shime Events & Planning",
    welcomeSubtitle: "Your Premier Partner for Exceptional Celebrations",
    selectLanguage: "Welcome to Shime Events & Planning! 🌟 We are delighted to assist you in creating an unforgettable celebration. To get started, please select your preferred language.",
    selectCalendar: "Which calendar system would you like to use for your event date?",
    gregorianCalendar: "📅 Gregorian Calendar (International)",
    ethiopianCalendar: "🇪🇹 Ethiopian Calendar",
    askNationality: "Great! 😊 What is your nationality?",
    askResidency: "Perfect! Which country are you currently residing in?",
    askPhone: "Thank you! 🙏 Please provide your local phone number (Example: 0911234567 or +44 7911 123456)",
    invalidPhone: "❌ The phone number you entered is invalid. Please enter a valid local phone number (5–15 digits).",
    phoneCountryMismatch: "⚠️ Please note: Your phone number country code differs from your country of residence.",
    askEmail: "Excellent! 📧 What is your email address?",
    invalidEmail: "❌ Hmm, that email doesn't look quite right. Could you please try again?",
    askIdType: "Great! 📋 Please provide your ID number or Passport number:",
    invalidId: "❌ Please enter a valid ID or Passport number (at least 4 characters, letters and numbers only).",
    askFullName: "Perfect! 👤 What is your full name (First and Last name)?",
    invalidName: "❌ We need both your first and last name. Could you please try again?",
    askPassword: "Wonderful! 🔐 Let's create a secure PIN for your account (6 or more digits):",
    askContactMethod: "How would you prefer us to contact you?",
    askEventType: "Exciting! 🎉 What type of event are you planning?",
    askEventCountry: "Where will your celebration take place? Which country?",
    eventCountryMismatch: "ℹ️ Just noting: Your event will be in a different country than where you currently live. That's great!",
    askEventCity: "Which city will your event be in?",
    askDate: "Perfect! 📅 When would you like to host your event? (Please select a date)",
    dateBooked: "⚠️ That date is fully booked, I'm afraid. Could you choose another date?",
    askTime: "What time would you like your event to start? (Format: HH:MM, e.g., 14:00 for 2:00 PM)",
    timeBooked: "⚠️ That time slot is not available. Let's find another time that works!",
    askLocation: "Wonderful! 📍 Where exactly will your event be held? (Please provide the venue or address):",
    askGuests: "Excellent! 👥 How many guests are you expecting at your event?",
    askTheme: "Perfect! 🎨 Would you like any special theme or specific design for your event?",
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
    closeChat: "✕ Close Chatbot",
    bookingComplete: "Thank you for choosing Shime Events! Your booking is complete. 🎉",
    labelClient: "Client",
    labelEmail: "Email",
    labelPackage: "Package",
    labelBookingFee: "Booking Fee (Non-Refundable)",
    labelReference: "Reference",
    labelEventDate: "Event Date",
    labelLocation: "Location",
    labelContact: "Contact",
    labelQrCode: "Booking QR Code",
    labelAt: "at",
    copyRef: "📋 Copy Ref",
    copiedShort: "✓ Copied",
    pdfDownloaded: "✅ PDF downloaded successfully!",
  },
  am: {
    welcome: "እንኳን ወደ Shime Events & Planning በደህና መጡ",
    welcomeSubtitle: "ለማይረሳ ዝግጅትዎ የላቀ አጋርዎ",
    selectLanguage: "እንኳን ወደ Shime Events & Planning በደህና መጡ! 🌟 የማይረሳ ዝግጅት እንዲኖርዎ ለማገዝ ዝግጁ ነን። ለመጀመር እባክዎን የሚመርጡትን ቋንቋ ይምረጡ።",
    selectCalendar: "ለዝግጅትዎ ቀን የትኛውን የቀን አቆጣጠር ሥርዓት መጠቀም ይፈልጋሉ?",
    gregorianCalendar: "📅 የግሪጎሪያን ቀን አቆጣጠር (ዓለም አቀፍ)",
    ethiopianCalendar: "🇪🇹 የኢትዮጵያ ቀን አቆጣጠር",
    askResidency: "በአሁኑ ጊዜ በየትኛው ሀገር ይኖራሉ?",
    askPhone: "እባክዎን የስልክ ቁጥርዎን ያስገቡ (ምሳሌ፦ 0911234567 ወይም +44 7911 123456)።",
    invalidPhone: "❌ ያስገቡት ስልክ ቁጥር ትክክል አይደለም። እባክዎን ከ5 እስከ 15 አሃዝ ያለው ትክክለኛ ስልክ ቁጥር ያስገቡ።",
    phoneCountryMismatch: "⚠️ ማሳሰቢያ፦ የስልክ ቁጥርዎ የሀገር መለያ ኮድ ከሚኖሩበት ሀገር ጋር አይዛመድም።",
    askEmail: "እባክዎን የኢሜይል አድራሻዎን ያስገቡ።",
    invalidEmail: "❌ ያስገቡት ኢሜይል ትክክል አይመስልም። እባክዎን ትክክለኛ የኢሜይል አድራሻ ያስገቡ።",
    askFullName: "እባክዎን ሙሉ ስምዎን ያስገቡ (የራስዎ ስም እና የአባትዎ ስም)።",
    invalidName: "❌ እባክዎን ሙሉ ስምዎን ያስገቡ (የራስዎ ስም እና የአባትዎ ስም)።",
    askContactMethod: "በምን መንገድ እንድናገኝዎ ይመርጣሉ?",
    askEventType: "ምን ዓይነት ዝግጅት ማዘጋጀት ይፈልጋሉ?",
    askEventCountry: "ዝግጅትዎ በየትኛው ሀገር ይካሄዳል?",
    eventCountryMismatch: "ℹ️ ማሳሰቢያ፦ ዝግጅትዎ ከሚኖሩበት ሀገር ውጭ ይካሄዳል።",
    askEventCity: "ዝግጅትዎ በየትኛው ከተማ ይካሄዳል?",
    askDate: "እባክዎን ዝግጅትዎ የሚካሄድበትን ቀን ይምረጡ።",
    dateBooked: "⚠️ የመረጡት ቀን ሙሉ በሙሉ ተይዟል። እባክዎን ሌላ ቀን ይምረጡ።",
    askTime: "ዝግጅትዎ በስንት ሰዓት ይጀምራል? (ቅርጸት፦ ሰዓት:ደቂቃ፣ ምሳሌ፦ 14:00)።",
    timeBooked: "⚠️ የመረጡት ሰዓት ተይዟል። እባክዎን ሌላ ሰዓት ይምረጡ።",
    askLocation: "እባክዎን ዝግጅትዎ የሚካሄድበትን ሥፍራ ወይም ሙሉ አድራሻ ያስገቡ።",
    askGuests: "በዝግጅትዎ ላይ ምን ያህል እንግዶች ይጠበቃሉ? (ቁጥር ያስገቡ)።",
    askTheme: "ለዝግጅትዎ የተለየ ጭብጥ (ገጽታ) ወይም ዲዛይን ይፈልጋሉ?",
    depositNotice: "ዝግጅትዎን ለማረጋገጥ የ50% ቅድሚያ ክፍያ መፈጸም ያስፈልጋል።",
    noticeTitle: "የዝግጅት ማረጋገጫ እና የክፍያ መመሪያ",
    noticeBody: "ዝግጅትዎን ለማረጋገጥ እባክዎን የ50% ቅድሚያ ክፍያ ይፈጽሙ፦\n\n🏦 የክፍያ ዘዴ፦ CBE WALLET\nየሂሳብ ቁጥር፦ 1000XXXXXXXX\nየሂሳብ ስም፦ Shime Events & Planning",
    termsTitle: "ውሎችና ደንቦች",
    termsText: `1. ዝግጅትዎን ለማረጋገጥ ተመላሽ የማይደረግ የ50% ቅድሚያ ክፍያ ያስፈልጋል።
2. ሙሉ ክፍያ ዝግጅቱ ከመካሄዱ 14 ቀናት በፊት መጠናቀቅ አለበት።
3. ዝግጅቱ ከመካሄዱ በ7 ቀናት ውስጥ የሚደረግ ስረዛ የጠቅላላ ክፍያውን 50% ያስቀራል።
4. Shime Events & Planning አቅራቢዎችን በእኩል ወይም በተሻለ ጥራት የመተካት መብት አለው።
5. ደንበኛው በምዝገባ ሂደት ትክክለኛና ሙሉ መረጃ የመስጠት ኃላፊነት አለበት።
6. የዝግጅት ቀን፣ ሥፍራ ወይም የእንግዶች ብዛት ለውጥ ጥያቄ በጽሑፍ መቅረብ አለበት።
7. ከአቅም በላይ በሆኑ ሁኔታዎች ለሚፈጠሩ ችግሮች የፎርስ ማጁር (Force Majeure) ድንጋጌ ተፈጻሚ ይሆናል።
8. ከዚህ ስምምነት የሚነሱ አለመግባባቶች በኢትዮጵያ ሕግ መሠረት ይዳኛሉ።

ይህን ስምምነት በመቀበል ሁሉንም ውሎችና ደንቦች ማንበብዎንና መቀበልዎን ያረጋግጣሉ።`,
    acceptTerms: "✅ ውሎችና ደንቦቹን ተቀብዬ እስማማለሁ",
    shareWhatsapp: "📲 በ WhatsApp ያጋሩ",
    viewBooking: "📋 የዝግጅት ዝርዝር ይመልከቱ",
    downloadPdf: "⬇️ ሰነዱን ያውርዱ",
    downloadQr: "⬇️ የQR ኮድ ያውርዱ",
    sendInstructions: "ዝግጅትዎን ለማጠናቀቅ ቀጣይ እርምጃዎች፦\n\n1. የክፍያ ማስረጃ ይላኩ\n2. የተፈረመ ውል ይላኩ\n\nእባክዎን ወደሚከተለው አድራሻ ይላኩ፦\n📱 WhatsApp: +251 91 234 5678\n✉️ Telegram: @ShimeEvents",
    bookingConfirmed: "ዝግጅትዎ ተረጋግጧል",
    termsAccepted: "✅ ውሎችና ደንቦቹ በተሳካ ሁኔታ ተቀብለዋል።",
    proceedBooking: "የዝግጅትዎን ዝርዝር ይገምግሙ",
    contactUs: "📲 ያግኙን",
    stepOf: "ደረጃ",
    required: "(ያስፈልጋል)",
    back: "← ወደኋላ",
    next: "ቀጥል →",
    success: "✅ ተሳክቷል!",
    loading: "እባክዎን ይጠብቁ...",
    generatingPdf: "ሰነድ እየተዘጋጀ ነው...",
    generatingQr: "የQR ኮድ እየተዘጋጀ ነው...",
    copy: "ቅዳ",
    copied: "ወደ ቅንጥብ ሰሌዳ ተቀድቷል!",
    startOver: "እንደገና ይጀምሩ",
    selectPackage: "የትኛውን የዝግጅት ጥቅል (ፓኬጅ) ይመርጣሉ?",
    scanToBook: "📲 ዝግጅትዎን ለማስያዝ ይቃኙ",
    qrCodeTitle: "ይህን የQR ኮድ ያጋሩ",
    qrCodeSubtitle: "ደንበኞች በመቃኘት ዝግጅታቸውን ማስያዝ እንዲችሉ ያጋሩ",
    downloadQRCode: "⬇️ የQR ኮድ ያውርዱ",
    printQRCode: "🖨️ የQR ኮድ ያትሙ",
    shareQRCode: "📱 የQR ሊንክ ያጋሩ",
    qrCodeDownloaded: "የQR ኮዱ በተሳካ ሁኔታ ወርዷል!",
    closeChat: "✕ ዝጋ",
    bookingComplete: "Shime Events ን ስለመረጡ እናመሰግናለን! ዝግጅትዎ ተጠናቅቋል። 🎉",
    labelClient: "ደንበኛ",
    labelEmail: "ኢሜይል",
    labelPackage: "ጥቅል (ፓኬጅ)",
    labelBookingFee: "የቅድሚያ ክፍያ (ተመላሽ የማይደረግ)",
    labelReference: "ማመሳከሪያ",
    labelEventDate: "የዝግጅት ቀን",
    labelLocation: "ሥፍራ",
    labelContact: "የመገናኛ ዘዴ",
    labelQrCode: "የዝግጅት QR ኮድ",
    labelAt: "ሰዓት",
    copyRef: "📋 ማመሳከሪያ ቅዳ",
    copiedShort: "✓ ተቀድቷል",
    pdfDownloaded: "✅ ሰነዱ በተሳካ ሁኔታ ወርዷል!",
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

// Country dialing codes for phone validation
const COUNTRY_CODES = {
  "Afghanistan": "+93",
  "Albania": "+355",
  "Algeria": "+213",
  "Andorra": "+376",
  "Angola": "+244",
  "Antigua and Barbuda": "+1",
  "Argentina": "+54",
  "Armenia": "+374",
  "Australia": "+61",
  "Austria": "+43",
  "Azerbaijan": "+994",
  "Bahamas": "+1",
  "Bahrain": "+973",
  "Bangladesh": "+880",
  "Barbados": "+1",
  "Belarus": "+375",
  "Belgium": "+32",
  "Belize": "+501",
  "Benin": "+229",
  "Bhutan": "+975",
  "Bolivia": "+591",
  "Bosnia and Herzegovina": "+387",
  "Botswana": "+267",
  "Brazil": "+55",
  "Brunei": "+673",
  "Bulgaria": "+359",
  "Burkina Faso": "+226",
  "Burundi": "+257",
  "Cambodia": "+855",
  "Cameroon": "+237",
  "Canada": "+1",
  "Cape Verde": "+238",
  "Central African Republic": "+236",
  "Chad": "+235",
  "Chile": "+56",
  "China": "+86",
  "Colombia": "+57",
  "Comoros": "+269",
  "Congo": "+242",
  "Costa Rica": "+506",
  "Croatia": "+385",
  "Cuba": "+53",
  "Cyprus": "+357",
  "Czech Republic": "+420",
  "Denmark": "+45",
  "Djibouti": "+253",
  "Dominica": "+1",
  "Dominican Republic": "+1",
  "Ecuador": "+593",
  "Egypt": "+20",
  "El Salvador": "+503",
  "Equatorial Guinea": "+240",
  "Eritrea": "+291",
  "Estonia": "+372",
  "Ethiopia": "+251",
  "Fiji": "+679",
  "Finland": "+358",
  "France": "+33",
  "Gabon": "+241",
  "Gambia": "+220",
  "Georgia": "+995",
  "Germany": "+49",
  "Ghana": "+233",
  "Greece": "+30",
  "Grenada": "+1",
  "Guatemala": "+502",
  "Guinea": "+224",
  "Guinea-Bissau": "+245",
  "Guyana": "+592",
  "Haiti": "+509",
  "Honduras": "+504",
  "Hong Kong": "+852",
  "Hungary": "+36",
  "Iceland": "+354",
  "India": "+91",
  "Indonesia": "+62",
  "Iran": "+98",
  "Iraq": "+964",
  "Ireland": "+353",
  "Israel": "+972",
  "Italy": "+39",
  "Jamaica": "+1",
  "Japan": "+81",
  "Jordan": "+962",
  "Kazakhstan": "+7",
  "Kenya": "+254",
  "Kiribati": "+686",
  "Kuwait": "+965",
  "Kyrgyzstan": "+996",
  "Laos": "+856",
  "Latvia": "+371",
  "Lebanon": "+961",
  "Lesotho": "+266",
  "Liberia": "+231",
  "Libya": "+218",
  "Liechtenstein": "+423",
  "Lithuania": "+370",
  "Luxembourg": "+352",
  "Macao": "+853",
  "Madagascar": "+261",
  "Malawi": "+265",
  "Malaysia": "+60",
  "Maldives": "+960",
  "Mali": "+223",
  "Malta": "+356",
  "Marshall Islands": "+692",
  "Mauritania": "+222",
  "Mauritius": "+230",
  "Mexico": "+52",
  "Micronesia": "+691",
  "Moldova": "+373",
  "Monaco": "+377",
  "Mongolia": "+976",
  "Montenegro": "+382",
  "Morocco": "+212",
  "Mozambique": "+258",
  "Myanmar": "+95",
  "Namibia": "+264",
  "Nauru": "+674",
  "Nepal": "+977",
  "Netherlands": "+31",
  "New Zealand": "+64",
  "Nicaragua": "+505",
  "Niger": "+227",
  "Nigeria": "+234",
  "North Korea": "+850",
  "North Macedonia": "+389",
  "Norway": "+47",
  "Oman": "+968",
  "Pakistan": "+92",
  "Palau": "+680",
  "Palestine": "+970",
  "Panama": "+507",
  "Papua New Guinea": "+675",
  "Paraguay": "+595",
  "Peru": "+51",
  "Philippines": "+63",
  "Poland": "+48",
  "Portugal": "+351",
  "Qatar": "+974",
  "Romania": "+40",
  "Russia": "+7",
  "Rwanda": "+250",
  "Saint Kitts and Nevis": "+1",
  "Saint Lucia": "+1",
  "Saint Vincent and the Grenadines": "+1",
  "Samoa": "+685",
  "San Marino": "+378",
  "Sao Tome and Principe": "+239",
  "Saudi Arabia": "+966",
  "Senegal": "+221",
  "Serbia": "+381",
  "Seychelles": "+248",
  "Sierra Leone": "+232",
  "Singapore": "+65",
  "Slovakia": "+421",
  "Slovenia": "+386",
  "Solomon Islands": "+677",
  "Somalia": "+252",
  "South Africa": "+27",
  "South Korea": "+82",
  "South Sudan": "+211",
  "Spain": "+34",
  "Sri Lanka": "+94",
  "Sudan": "+249",
  "Suriname": "+597",
  "Sweden": "+46",
  "Switzerland": "+41",
  "Syria": "+963",
  "Taiwan": "+886",
  "Tajikistan": "+992",
  "Tanzania": "+255",
  "Thailand": "+66",
  "Timor-Leste": "+670",
  "Togo": "+228",
  "Tonga": "+676",
  "Trinidad and Tobago": "+1",
  "Tunisia": "+216",
  "Turkey": "+90",
  "Turkmenistan": "+993",
  "Tuvalu": "+688",
  "Uganda": "+256",
  "Ukraine": "+380",
  "United Arab Emirates": "+971",
  "United Kingdom": "+44",
  "United States": "+1",
  "Uruguay": "+598",
  "Uzbekistan": "+998",
  "Vanuatu": "+678",
  "Vatican City": "+379",
  "Venezuela": "+58",
  "Vietnam": "+84",
  "Yemen": "+967",
  "Zambia": "+260",
  "Zimbabwe": "+263"
};

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
  const [messages, setMessages] = useState([
    { type: "agent", text: translations.en.selectLanguage, id: "initial-greeting" }
  ]);
  const [bookingData, setBookingData] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [bookingRefNum, setBookingRefNum] = useState(null);
  const [bookingVerifyPin, setBookingVerifyPin] = useState(null);
  const [calendarType, setCalendarType] = useState(null);

  // Unavailable slots loaded from the database (admin-blocked dates + confirmed bookings),
  // merged with the hardcoded fallback list.
  const [unavailableSlots, setUnavailableSlots] = useState(BOOKED_SLOTS);

  // Toast state
  const [toast, setToast] = useState({ message: "", type: "info", visible: false });
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState(false);

  // QR Code for customer booking
  const [bookingQRCode, setBookingQRCode] = useState(null);
  const [showQRSection, setShowQRSection] = useState(false);
  const [showQRPage, setShowQRPage] = useState(false);
  const [showManualPayment, setShowManualPayment] = useState(false);

  const chatEndRef = useRef(null);

  const showToast = (message, type = "info", duration = 3000) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ ...toast, visible: false }), duration);
  };

  // Returns { primary, secondary } — primary is the chosen language, secondary is English subtitle (only for Amharic)
  // Accepts optional langOverride so callers in the same render cycle can pass the new language before state updates
  const getBilingualText = (key, langOverride) => {
    const lang = langOverride || language;
    const engText = translations.en[key] || "";
    if (!lang || lang === "en") return { primary: engText, secondary: null };
    const amText = translations[lang][key] || engText;
    return { primary: amText, secondary: engText };
  };

  const getLanguageName = (lang) => {
    return lang === "en" ? "English" : lang === "am" ? "አማርኛ" : "Unknown";
  };

  const t = (key) => translations[language || "en"][key] || translations.en[key];

  // Accepts either a plain string or a { primary, secondary } bilingual object
  const addAgentMessage = (textOrObj) => {
    const entry = typeof textOrObj === "string"
      ? { type: "agent", text: textOrObj, secondary: null, id: `${Date.now()}-${Math.random()}` }
      : { type: "agent", text: textOrObj.primary, secondary: textOrObj.secondary || null, id: `${Date.now()}-${Math.random()}` };
    setMessages((prev) => [...prev, entry]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { type: "user", text, id: `${Date.now()}-${Math.random()}` }]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // Smart AI Response System
  // Database: Save Booking to Supabase
  const saveBookingToDatabase = async () => {
    try {
      if (!supabase) {
        return true; // Continue even if database not configured
      }

      const pkgInfo = PACKAGES.find(p => p.name === bookingData.plan);
      const depositAmount = Math.round((pkgInfo?.price || 0) / 2);

      const bookingRecord = {
        booking_ref: bookingRefNum,
        verification_pin: bookingVerifyPin,
        full_name: bookingData.fullName,
        email: bookingData.email,
        phone_number: bookingData.phoneNumber,
        residency: bookingData.residency,
        contact_method: bookingData.contactMethod,
        language: language,
        event_type: bookingData.eventType,
        plan: bookingData.plan,
        event_date: bookingData.eventDate,
        event_time: bookingData.eventTime,
        event_country: bookingData.eventCountry,
        event_city: bookingData.eventCity,
        event_location: bookingData.eventLocation,
        deposit_amount: depositAmount,
        terms_accepted: true,
        payment_status: "pending",
        booking_status: "awaiting_payment",
        calendar_type: calendarType,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("shime_bookings")
        .insert([bookingRecord]);

      if (error) {
        // Don't block booking if database fails
        return true;
      }

      return true;
    } catch (err) {
      return true; // Continue even if error
    }
  };

  // Send a booking confirmation email to the client via EmailJS.
  // Silently no-ops if EmailJS env vars are not configured.
  const sendConfirmationEmail = async () => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey || !bookingData.email) return;

    const pkgInfo = PACKAGES.find((p) => p.name === bookingData.plan);
    const depositAmount = Math.round((pkgInfo?.price || 0) / 2);

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: bookingData.email,
          to_name: bookingData.fullName || "Guest",
          booking_ref: bookingRefNum || "",
          verification_code: bookingVerifyPin || "",
          event_type: bookingData.eventType || "",
          event_date: bookingData.eventDate || "",
          event_time: bookingData.eventTime || "",
          event_location: `${bookingData.eventCity || ""}, ${bookingData.eventCountry || ""}`,
          package_name: bookingData.plan || "",
          deposit_amount: `ETB ${depositAmount.toLocaleString()}`,
        },
        { publicKey }
      );
    } catch {
      // Email failure must never block the booking flow
    }
  };

  // Database: Update Payment Status — reliable with retry + verification.
  // Returns true once the row is confirmed "completed"; false if it could not be confirmed.
  const confirmPaymentInDatabase = async (ref, maxAttempts = 3) => {
    if (!supabase || !ref) return false;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const { error: updateError } = await supabase
          .from("shime_bookings")
          .update({
            payment_status: "completed",
            booking_status: "deposit_paid",
            updated_at: new Date().toISOString(),
          })
          .eq("booking_ref", ref);

        if (!updateError) {
          // Verify the update actually landed
          const { data: row } = await supabase
            .from("shime_bookings")
            .select("payment_status")
            .eq("booking_ref", ref)
            .maybeSingle();

          if (row && row.payment_status === "completed") {
            return true;
          }
        }
      } catch {
        // fall through to retry
      }

      // Backoff before next attempt (0.5s, 1s, 1.5s...)
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }

    // Could not confirm — queue for a later retry on next page load
    try {
      const pending = JSON.parse(localStorage.getItem("shime_pending_payment") || "[]");
      if (!pending.includes(ref)) {
        pending.push(ref);
        localStorage.setItem("shime_pending_payment", JSON.stringify(pending));
      }
    } catch {
      // ignore storage errors
    }
    return false;
  };

  // Chapa Hosted Checkout (Form Submission - no CORS issues)
  const submitChapaHostedPayment = () => {
    try {
      const publicKey = import.meta.env.VITE_CHAPA_PUBLIC_KEY;
      if (!publicKey) {
        showToast("🔧 Chapa not configured. Use Bank Transfer instead.", "info");
        return;
      }

      const pkgInfo = PACKAGES.find(p => p.name === bookingData.plan);
      const amount = Math.round((pkgInfo?.price || 0) / 2);
      const refNum = bookingRefNum || `SE-${Date.now()}`;

      // Split name
      const nameParts = bookingData.fullName?.trim().split(/\s+/) || [];
      const firstName = nameParts[0] || "Customer";
      const lastName = nameParts.slice(1).join(" ") || "Booking";

      // Phone number - convert local to international
      let phoneNumber = (bookingData.phoneNumber || "").trim();
      const digitsOnly = phoneNumber.replace(/\D/g, "");

      if (digitsOnly.startsWith("0")) {
        phoneNumber = "+251" + digitsOnly.slice(1);
      } else if (digitsOnly.startsWith("251")) {
        phoneNumber = "+" + digitsOnly;
      } else {
        phoneNumber = "+251" + digitsOnly;
      }

      // Create form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://api.chapa.co/v1/hosted/pay';
      form.style.display = 'none';

      const email = (bookingData.email || 'customer@shimeevents.com').trim().toLowerCase();
      const fields = {
        public_key: publicKey,
        tx_ref: refNum,
        amount: amount,
        currency: 'ETB',
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        return_url: `${window.location.origin}/?booking=${refNum}&payment_status=completed`,
        'customization[title]': 'Shime Events',
        'customization[description]': `${bookingData.plan} - Deposit Payment`
      };

      // Add fields to form
      Object.keys(fields).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = fields[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      showToast("🔄 Redirecting to Chapa...", "info");
      form.submit();
      document.body.removeChild(form);
    } catch (error) {
      console.error("❌ Chapa error:", error);
      showToast("Payment error: " + error.message, "error");
    }
  };

  const fixGrammar = (text, fieldType) => {
    if (!text || fieldType === "name" || fieldType === "email" || fieldType === "phone" || fieldType === "id") {
      return text; // Don't fix personal information
    }

    let fixed = text.trim();

    // Fix double spaces
    fixed = fixed.replace(/\s+/g, " ");

    // Fix common grammar: capitalize first letter
    fixed = fixed.charAt(0).toUpperCase() + fixed.slice(1).toLowerCase();

    // Fix 'and' capitalization in the middle
    fixed = fixed.replace(/\s+and\s+/gi, " and ");

    return fixed;
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhone = (phone) => {
    const digits = phone.replace(/\D/g, "");
    // Accept any local phone number: 5 to 15 digits (covers all countries)
    return digits.length >= 5 && digits.length <= 15;
  };

  const validateName = (name) => name.trim().split(" ").length >= 2 && name.length >= 5;

  const isDateBooked = (date, time = null) => {
    return unavailableSlots.some(slot => slot.date === date && (slot.time === null || slot.time === time));
  };

  const isDateInFuture = (date) => {
    return new Date(date) > new Date();
  };

  // Load unavailable dates from the database: admin-blocked dates + confirmed bookings.
  // Falls back to the hardcoded BOOKED_SLOTS if the DB is unreachable.
  const loadUnavailableSlots = async () => {
    if (!supabase) return;
    try {
      const merged = [...BOOKED_SLOTS];

      // Admin-blocked dates
      const { data: blocked } = await supabase
        .from("shime_blocked_dates")
        .select("blocked_date");
      if (blocked) {
        blocked.forEach((b) => merged.push({ date: b.blocked_date, time: null }));
      }

      // Dates already taken by confirmed/paid bookings
      const { data: booked } = await supabase
        .from("shime_bookings")
        .select("event_date, event_time")
        .in("booking_status", ["deposit_paid", "confirmed"]);
      if (booked) {
        booked.forEach((b) => {
          if (b.event_date) merged.push({ date: b.event_date, time: b.event_time || null });
        });
      }

      setUnavailableSlots(merged);
    } catch {
      // keep the fallback list on any error
    }
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

    const nameParts = (bookingData.fullName || "Guest").split(" ");
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

      // Amharic PDFs need an embedded Ethiopic font (jsPDF's built-ins can't
      // render Ge'ez script). The font is lazy-loaded only when needed.
      const isAm = language === "am";
      let FONT = "helvetica";
      if (isAm) {
        try {
          const { abyssinicaSILBase64 } = await import("./fonts/abyssinicaSIL.js");
          doc.addFileToVFS("AbyssinicaSIL.ttf", abyssinicaSILBase64);
          doc.addFont("AbyssinicaSIL.ttf", "Abyssinica", "normal");
          doc.addFont("AbyssinicaSIL.ttf", "Abyssinica", "bold");
          FONT = "Abyssinica";
        } catch {
          FONT = "helvetica"; // fall back gracefully if the font fails to load
        }
      }
      // Label helper: pick Amharic or English text.
      const L = (en, am) => (isAm ? am : en);
      // Date formatted in the chosen calendar AND language.
      const eventDateText =
        calendarType === "ethiopian"
          ? formatDateForDisplay(bookingData.eventDate, "ethiopian", language)
          : bookingData.eventDate;

      // ── Professional document palette ──
      const navy = [26, 26, 46];
      const gold = [193, 154, 47];
      const fieldDark = [45, 45, 55];
      const midGray = [120, 120, 130];
      const hairline = [225, 225, 230];
      const M = 18; // page margin
      const fullPrice = pkgInfo?.price || 0;
      const cap = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : "—");

      // White, printer-friendly background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // ── Header band ──
      doc.setFillColor(...navy);
      doc.rect(0, 0, pageWidth, 32, "F");
      doc.setFont(FONT, "bold");
      doc.setTextColor(...gold);
      doc.setFontSize(22);
      doc.text("SHIME EVENTS", pageWidth / 2, 14, { align: "center" });
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("& PLANNING", pageWidth / 2, 20, { align: "center" });
      doc.setFont(FONT, "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(205, 205, 215);
      doc.text(L("Professional Event Planning & Coordination", "ሙያዊ የዝግጅት እቅድ እና ማስተባበር"), pageWidth / 2, 26, { align: "center" });

      // ── Title + reference ──
      let yPos = 44;
      doc.setFont(FONT, "bold");
      doc.setFontSize(15);
      doc.setTextColor(...navy);
      doc.text(L("BOOKING CONFIRMATION", "የዝግጅት ማረጋገጫ"), M, yPos);
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.8);
      doc.line(M, yPos + 2.5, M + 76, yPos + 2.5);

      doc.setFont(FONT, "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...midGray);
      doc.text(`${L("Reference", "ማመሳከሪያ")}:  ${refNum}`, pageWidth - M, yPos - 3, { align: "right" });
      doc.text(`${L("Issued", "የተሰጠበት ቀን")}:  ${today}`, pageWidth - M, yPos + 2, { align: "right" });

      // ── Verification code box + QR ──
      yPos += 9;
      doc.setFillColor(249, 245, 233);
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.4);
      doc.roundedRect(M, yPos, 108, 26, 2, 2, "FD");
      doc.setFont(FONT, "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...midGray);
      doc.text(L("VERIFICATION CODE", "የማረጋገጫ ኮድ"), M + 6, yPos + 8);
      doc.setFont(FONT, "bold");
      doc.setFontSize(20);
      doc.setTextColor(...navy);
      doc.text(bookingVerifyPin || "—", M + 6, yPos + 19);
      doc.setFont(FONT, "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...midGray);
      doc.text(L("Present this code to confirm your booking", "ዝግጅትዎን ለማረጋገጥ ይህን ኮድ ያቅርቡ"), M + 6, yPos + 23.5);

      if (qrCode) {
        try {
          doc.addImage(qrCode, "PNG", pageWidth - M - 26, yPos, 26, 26);
        } catch (qrError) {
          console.warn("Could not add QR code to PDF:", qrError);
        }
      }

      // ── Section helpers ──
      const sectionHeader = (title, y) => {
        doc.setFillColor(...navy);
        doc.rect(M, y, pageWidth - M * 2, 7, "F");
        doc.setFont(FONT, "bold");
        doc.setFontSize(9);
        doc.setTextColor(...gold);
        doc.text(title, M + 4, y + 4.8);
        doc.setFont(FONT, "normal");
        return y + 7;
      };

      const drawGrid = (fields, startY) => {
        const colW = (pageWidth - M * 2) / 2;
        let y = startY + 7;
        for (let i = 0; i < fields.length; i += 2) {
          for (let c = 0; c < 2; c++) {
            const f = fields[i + c];
            if (!f) break;
            const x = M + c * colW + 3;
            doc.setFont(FONT, "normal");
            doc.setFontSize(7);
            doc.setTextColor(...midGray);
            doc.text(String(f[0]).toUpperCase(), x, y);
            doc.setFont(FONT, "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(...fieldDark);
            const val = doc.splitTextToSize(String(f[1] ?? "—"), colW - 8);
            doc.text(val[0], x, y + 5);
          }
          y += 13;
          doc.setDrawColor(...hairline);
          doc.setLineWidth(0.2);
          doc.line(M, y - 4.5, pageWidth - M, y - 4.5);
        }
        return y;
      };

      const fullWidthField = (label, value, startY) => {
        doc.setFont(FONT, "normal");
        doc.setFontSize(7);
        doc.setTextColor(...midGray);
        doc.text(String(label).toUpperCase(), M + 3, startY + 7);
        doc.setFont(FONT, "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...fieldDark);
        const lines = doc.splitTextToSize(String(value || "—"), pageWidth - M * 2 - 6);
        doc.text(lines[0], M + 3, startY + 12);
        return startY + 16;
      };

      // ── Client Information ──
      yPos += 33;
      yPos = sectionHeader(L("CLIENT INFORMATION", "የደንበኛ መረጃ"), yPos);
      yPos = drawGrid([
        [L("Full Name", "ሙሉ ስም"), bookingData.fullName],
        [L("Preferred Contact", "የመገናኛ ዘዴ"), cap(bookingData.contactMethod)],
        [L("Phone Number", "ስልክ ቁጥር"), bookingData.phoneNumber],
        [L("Email Address", "ኢሜይል አድራሻ"), bookingData.email],
        [L("Country of Residence", "የመኖሪያ ሀገር"), bookingData.residency],
      ], yPos);

      // ── Event Details ──
      yPos += 3;
      yPos = sectionHeader(L("EVENT DETAILS", "የዝግጅት ዝርዝር"), yPos);
      yPos = drawGrid([
        [L("Event Type", "የዝግጅት ዓይነት"), cap(bookingData.eventType)],
        [L("Package", "ጥቅል (ፓኬጅ)"), bookingData.plan],
        [L("Expected Guests", "የሚጠበቁ እንግዶች"), bookingData.guestCount],
        [L("Date", "ቀን"), calendarType === "ethiopian"
          ? `${eventDateText} (${bookingData.eventDate})`
          : eventDateText],
        [L("Time", "ሰዓት"), bookingData.eventTime],
        [L("City / Country", "ከተማ / ሀገር"), `${bookingData.eventCity || "—"}, ${bookingData.eventCountry || "—"}`],
      ], yPos);
      yPos = fullWidthField(L("Venue / Address", "ሥፍራ / አድራሻ"), bookingData.eventLocation, yPos);
      if (bookingData.specialTheme && bookingData.specialTheme !== "No specific theme") {
        yPos = fullWidthField(L("Theme / Design", "ጭብጥ / ዲዛይን"), bookingData.specialTheme, yPos);
      }

      // ── Payment ──
      yPos += 3;
      yPos = sectionHeader(L("PAYMENT SUMMARY", "የክፍያ ማጠቃለያ"), yPos);
      yPos += 4;
      // Deposit highlight box
      doc.setFillColor(249, 245, 233);
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.4);
      doc.roundedRect(M, yPos, pageWidth - M * 2, 22, 2, 2, "FD");
      doc.setFont(FONT, "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...midGray);
      doc.text(L("BOOKING FEE DUE NOW (NON-REFUNDABLE)", "አሁን የሚከፈል ክፍያ (ተመላሽ የማይደረግ)"), M + 6, yPos + 7);
      doc.setFont(FONT, "bold");
      doc.setFontSize(17);
      doc.setTextColor(...navy);
      doc.text(`ETB ${deposit.toLocaleString()}`, M + 6, yPos + 17);
      doc.setFont(FONT, "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...midGray);
      doc.text(`${L("Package total", "የጥቅሉ ጠቅላላ")}: ETB ${fullPrice.toLocaleString()}`, pageWidth - M - 6, yPos + 9, { align: "right" });
      doc.text(`${L("Method", "የክፍያ ዘዴ")}: CBE WALLET`, pageWidth - M - 6, yPos + 15, { align: "right" });
      doc.text(`${L("Account", "ሂሳብ ቁጥር")}: 1000XXXXXXXX`, pageWidth - M - 6, yPos + 20, { align: "right" });

      // ── Footer band ──
      doc.setFillColor(...navy);
      doc.rect(0, pageHeight - 18, pageWidth, 18, "F");
      doc.setFont(FONT, "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...gold);
      doc.text("Shime Events & Planning", pageWidth / 2, pageHeight - 11, { align: "center" });
      doc.setTextColor(200, 200, 210);
      doc.text("WhatsApp: +251 91 234 5678   |   Email: contact@shimeeventplaning.com", pageWidth / 2, pageHeight - 6, { align: "center" });

      // ── PAGE 2 — TERMS & CONDITIONS ──
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      doc.setFillColor(...navy);
      doc.rect(0, 0, pageWidth, 20, "F");
      doc.setFont(FONT, "bold");
      doc.setTextColor(...gold);
      doc.setFontSize(13);
      doc.text(L("TERMS & CONDITIONS", "ውሎችና ደንቦች"), M, 13);

      doc.setFont(FONT, "normal");
      doc.setTextColor(...fieldDark);
      doc.setFontSize(9);
      const termsText = isAm
        ? translations.am.termsText
        : translations.en.termsText;

      const termsLines = doc.splitTextToSize(termsText, pageWidth - M * 2);
      let termsY = 32;
      termsLines.forEach((line) => {
        doc.text(line, M, termsY);
        termsY += 5.5;
      });

      // Acceptance / signature block
      const agreementY = pageHeight - 50;
      doc.setDrawColor(...hairline);
      doc.setLineWidth(0.3);
      doc.line(M, agreementY - 6, pageWidth - M, agreementY - 6);

      doc.setFont(FONT, "bold");
      doc.setFontSize(9);
      doc.setTextColor(...navy);
      doc.text(L("CLIENT ACCEPTANCE", "የደንበኛ ስምምነት"), M, agreementY);
      doc.setFont(FONT, "normal");
      doc.setFontSize(8);
      doc.setTextColor(...fieldDark);
      doc.text(`${L("Name", "ስም")}: ${bookingData.fullName || "—"}`, M, agreementY + 7);
      doc.text(`${L("Signed on", "የተፈረመበት ቀን")}: ${today}  (${L("Automated Electronic Signature", "በራስ-ሰር የኤሌክትሮኒክ ፊርማ")})`, M, agreementY + 13);
      doc.text(`${L("Booking Reference", "የዝግጅት ማመሳከሪያ")}: ${refNum}`, M, agreementY + 19);

      doc.setDrawColor(...navy);
      doc.setLineWidth(0.4);
      doc.line(pageWidth - M - 60, agreementY + 13, pageWidth - M, agreementY + 13);
      doc.setFontSize(7);
      doc.setTextColor(...midGray);
      doc.text(L("Authorised Signature", "የተፈቀደ ፊርማ"), pageWidth - M - 60, agreementY + 18);

      // Footer band
      doc.setFillColor(...navy);
      doc.rect(0, pageHeight - 18, pageWidth, 18, "F");
      doc.setFont(FONT, "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...gold);
      doc.text("Shime Events & Planning", pageWidth / 2, pageHeight - 11, { align: "center" });
      doc.setTextColor(200, 200, 210);
      doc.text("www.shimeeventplaning.com   |   contact@shimeeventplaning.com", pageWidth / 2, pageHeight - 6, { align: "center" });

      // Save PDF
      try {
        const fileName = `ShimeEvents_Booking_${refNum.replace("SE-", "")}.pdf`;
        doc.save(fileName);
        showToast(t("pdfDownloaded"), "success", 3000);
      } catch (saveError) {
        console.error("PDF save failed:", saveError);
        showToast("⚠️ PDF generated but couldn't download. Check browser settings.", "info", 5000);
      }

      setLoading(false);
    } catch (error) {
      console.error("PDF generation failed:", error);
      showToast("⚠️ PDF generation had issues. Please try again.", "error", 4000);
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
        addAgentMessage(getBilingualText("selectCalendar", value));
        showToast("✅ Success!", "success", 2000);
        return;

      case 1:
        setCalendarType(value);
        addUserMessage(value === "gregorian" ? translations[language || "en"].gregorianCalendar || "📅 Gregorian Calendar" : translations[language || "en"].ethiopianCalendar || "🇪🇹 Ethiopian Calendar");
        setStep(3);
        addAgentMessage(getBilingualText("askResidency", language));
        showToast(t("success"), "success", 2000);
        return;

      case 3:
        if (!value || value.trim().length < 2) {
          isValid = false;
          errorMsg = "Please enter your country of residence (at least 2 characters)";
        }
        if (isValid) {
          const countryCode = COUNTRY_CODES[value] || null;
          addUserMessage(value);
          setBookingData({ ...bookingData, residency: value, countryCode: countryCode });

          // Show phone number instruction with expected country code
          const basePhone = getBilingualText("askPhone");
          const phoneInstruction = countryCode
            ? { primary: basePhone.primary + `\n(Expected format for ${value}: ${countryCode}XXX...)`, secondary: basePhone.secondary ? basePhone.secondary + `\n(Expected format for ${value}: ${countryCode}XXX...)` : null }
            : basePhone;

          setStep(4);
          addAgentMessage(phoneInstruction);
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;

      case 4:
        if (!validatePhone(value)) {
          isValid = false;
          errorMsg = t("invalidPhone");
        }

        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, phoneNumber: value.trim() });
          setStep(5);
          addAgentMessage(getBilingualText("askEmail"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;

      case 5: {
        const trimmedEmail = value.trim();
        if (!validateEmail(trimmedEmail)) {
          isValid = false;
          errorMsg = t("invalidEmail");
        }
        if (isValid) {
          addUserMessage(trimmedEmail);
          setBookingData({ ...bookingData, email: trimmedEmail });
          setStep(6);
          addAgentMessage(getBilingualText("askFullName"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;
      }

      case 6:
        if (!validateName(value)) {
          isValid = false;
          errorMsg = t("invalidName");
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, fullName: value });
          setStep(9);
          addAgentMessage(getBilingualText("askContactMethod"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;

      case 9:
        addUserMessage(value);
        setBookingData({ ...bookingData, contactMethod: value });
        setStep(10);
        addAgentMessage(getBilingualText("askEventType"));
        showToast(t("success"), "success", 2000);
        return;

      case 10: {
        const fixedEventType = fixGrammar(value, "eventtype");
        addUserMessage(fixedEventType);
        setBookingData({ ...bookingData, eventType: fixedEventType });
        setStep(11);
        addAgentMessage(getBilingualText("selectPackage"));
        showToast(t("success"), "success", 2000);
        return;
      }

      case 11:
        addUserMessage(`📦 ${value}`);
        setBookingData({ ...bookingData, plan: value });
        setStep(12);
        addAgentMessage(getBilingualText("askGuests"));
        showToast(t("success"), "success", 2000);
        return;

      case 12: {
        const guestCount = parseInt(value);
        if (isNaN(guestCount) || guestCount < 1) {
          showToast("Please enter a valid number of guests", "error");
          setError("Please enter a valid number of guests");
          return;
        }
        addUserMessage(`${guestCount} guests`);
        setBookingData({ ...bookingData, guestCount: guestCount });
        setStep(13);
        addAgentMessage(getBilingualText("askEventCountry"));
        showToast(t("success"), "success", 2000);
        return;
      }

      case 13: {
        const fixedCountry = fixGrammar(value, "country");
        if (!fixedCountry || fixedCountry.length < 2) {
          isValid = false;
          errorMsg = "Please enter the event country (at least 2 characters)";
        }
        if (isValid) {
          addUserMessage(fixedCountry);
          setBookingData({ ...bookingData, eventCountry: fixedCountry });
          if (fixedCountry.toLowerCase() !== (bookingData.residency || "").toLowerCase()) {
            addAgentMessage(getBilingualText("eventCountryMismatch"));
          }
          setStep(14);
          addAgentMessage(getBilingualText("askEventCity"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;
      }

      case 14: {
        const fixedCity = fixGrammar(value, "city");
        if (!fixedCity || fixedCity.length < 2) {
          isValid = false;
          errorMsg = "Please enter a valid city";
        }
        if (isValid) {
          addUserMessage(fixedCity);
          setBookingData({ ...bookingData, eventCity: fixedCity });
          setStep(15);
          addAgentMessage(getBilingualText("askDate"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;
      }

      case 15:
        if (!isDateInFuture(value)) {
          isValid = false;
          errorMsg = "Please select a future date";
        } else if (isDateBooked(value)) {
          isValid = false;
          errorMsg = t("dateBooked");
        }
        if (isValid) {
          addUserMessage(
            calendarType === "ethiopian"
              ? formatDateForDisplay(value, "ethiopian", language)
              : value
          );
          setBookingData({ ...bookingData, eventDate: value });
          setStep(16);
          addAgentMessage(getBilingualText("askTime"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;

      case 16: {
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(value)) {
          isValid = false;
          errorMsg = language === 'en'
            ? "Please enter a valid time in HH:MM format (e.g., 14:30). Hours must be 00-23."
            : "እባክዎን ትክክለኛ ጊዜ በ HH:MM ቅርጸት ያስገቡ (ምሳሌ፡ 14:30)።";
        } else if (isDateBooked(bookingData.eventDate, value)) {
          isValid = false;
          errorMsg = t("timeBooked");
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, eventTime: value });
          setStep(17);
          addAgentMessage(getBilingualText("askLocation"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;
      }

      case 17: {
        const fixedLocation = fixGrammar(value, "location");
        if (!fixedLocation || fixedLocation.length < 3) {
          isValid = false;
          errorMsg = "Please enter a valid venue";
        }
        if (isValid) {
          addUserMessage(fixedLocation);
          setBookingData({ ...bookingData, eventLocation: fixedLocation });
          setStep(18);
          addAgentMessage(getBilingualText("askTheme"));
          showToast(t("success"), "success", 2000);
        } else {
          showToast(errorMsg, "error");
          setError(errorMsg);
        }
        return;
      }

      case 18: {
        const refNum = `SE-${Date.now()}`;
        const pinCode = `SHM${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const fixedTheme = value ? fixGrammar(value, "theme") : "No specific theme";
        addUserMessage(fixedTheme);
        setBookingData({ ...bookingData, specialTheme: fixedTheme });
        setBookingRefNum(refNum);
        setBookingVerifyPin(pinCode);
        generateQRCode(refNum);
        setStep(19);
        addAgentMessage(getBilingualText("noticeTitle"));
        showToast(t("success"), "success", 2000);
        return;
      }

      default:
        return;
    }

    setInputValue("");
  };

  const goBack = () => {
    if (step > 0 && step < 20) {
      // Skip removed steps: 2 (nationality), 7 (ID), 8 (PIN).
      let prevStep;
      if (step === 3) prevStep = 1;       // residency → calendar
      else if (step === 9) prevStep = 6;  // contact → full name
      else prevStep = step - 1;
      setStep(prevStep);
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

  const handleAcceptTerms = async () => {
    setTermsAccepted(true);
    addAgentMessage(getBilingualText("termsAccepted"));
    showToast(t("termsAccepted"), "success");

    // Save booking to database, then email the client their confirmation
    await saveBookingToDatabase();
    sendConfirmationEmail();
    notifyOwnerOfBooking();
  };

  // Notify the business owner of a new booking via WhatsApp (serverless + CallMeBot).
  // No-ops on local dev (no /api functions) and never blocks the booking flow.
  // Sends the COMPLETE booking profile so the owner message is fully detailed.
  const notifyOwnerOfBooking = () => {
    try {
      const pkgInfo = PACKAGES.find((p) => p.name === bookingData.plan);
      const fullPrice = pkgInfo?.price || 0;
      const depositAmount = Math.round(fullPrice / 2);

      fetch("/api/notify-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Client identity
          fullName: bookingData.fullName,
          phoneNumber: bookingData.phoneNumber,
          email: bookingData.email,
          residency: bookingData.residency,
          contactMethod: bookingData.contactMethod,
          // Event details
          eventType: bookingData.eventType,
          plan: bookingData.plan,
          guestCount: bookingData.guestCount,
          eventDate: bookingData.eventDate,
          eventTime: bookingData.eventTime,
          eventCity: bookingData.eventCity,
          eventCountry: bookingData.eventCountry,
          eventLocation: bookingData.eventLocation,
          specialTheme: bookingData.specialTheme,
          // Payment
          fullPrice,
          depositAmount,
          // References
          bookingRef: bookingRefNum,
          verificationPin: bookingVerifyPin,
        }),
      }).catch(() => {});
    } catch {
      // ignore — owner notification must never break booking
    }
  };

  const resetBooking = () => {
    setStep(0);
    setLanguage(null);
    setMessages([{ type: "agent", text: translations.en.selectLanguage, id: "initial-greeting" }]);
    setBookingData({});
    setInputValue("");
    setTermsAccepted(false);
    setError("");
    setQrCode(null);
    setBookingRefNum(null);
    setBookingVerifyPin(null);
    setShowTerms(false);
    setShowManualPayment(false);
    showToast("Booking reset", "info");
  };


  useEffect(() => {
    // Only generate if somehow missed (case 18 should have already set it)
    if (step === 19 && !bookingRefNum) {
      const newRef = `SE-${Date.now()}`;
      setBookingRefNum(newRef);
      generateQRCode(newRef);
    } else if (step === 19 && bookingRefNum && !qrCode) {
      generateQRCode(bookingRefNum);
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

    // Check if user came from Chapa payment
    if (params.get('payment_status') === 'completed') {
      const bookingRef = params.get('booking');
      if (bookingRef) {
        showToast("✅ Payment received! Confirming your booking...", "success", 5000);
        setBookingRefNum(bookingRef);

        // Reliable, verified status update with retry
        confirmPaymentInDatabase(bookingRef).then((ok) => {
          if (ok) {
            showToast("✅ Booking confirmed and recorded.", "success", 4000);
          } else {
            showToast("⚠️ Payment received. We'll confirm your booking shortly.", "info", 6000);
          }
        });

        // Clean URL (remove payment params)
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // Retry any payments that couldn't be confirmed on a previous visit
    if (supabase) {
      try {
        const pending = JSON.parse(localStorage.getItem("shime_pending_payment") || "[]");
        if (pending.length > 0) {
          Promise.all(pending.map((ref) => confirmPaymentInDatabase(ref))).then((results) => {
            const stillPending = pending.filter((_, i) => !results[i]);
            localStorage.setItem("shime_pending_payment", JSON.stringify(stillPending));
          });
        }
      } catch {
        // ignore
      }
    }

    // Check if user came from QR code scan
    if (params.get('ref') === 'booking' && step === 0) {
      // Auto-start with English, user can still change language
      setLanguage('en');
      setStep(1);
      addAgentMessage({ primary: `${translations.en.welcome} — ${translations.en.welcomeSubtitle}`, secondary: null });
      addAgentMessage({ primary: translations.en.selectCalendar, secondary: null });
    }
  }, []);

  useEffect(() => {
    // Generate booking QR code on component load
    if (!bookingQRCode) {
      generateBookingQRCode();
    }
    // Load admin-blocked dates and already-booked slots from the database
    loadUnavailableSlots();
  }, []);

  // Re-fetch unavailable dates right before the client picks a date/time,
  // so a date blocked by the admin mid-session is always respected.
  useEffect(() => {
    if (step === 14 || step === 15) {
      loadUnavailableSlots();
    }
  }, [step]);

  // Active input steps in order (removed: 2 nationality, 7 ID, 8 PIN).
  const ACTIVE_STEPS = [1, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  const TOTAL_STEPS = ACTIVE_STEPS.length;

  // 1-based position of the current step within the active sequence.
  const getStepDisplay = () => {
    const idx = ACTIVE_STEPS.indexOf(step);
    return idx === -1 ? TOTAL_STEPS : idx + 1;
  };

  const getProgressPercentage = () => {
    if (step >= 19) return 100;
    return Math.min((getStepDisplay() / TOTAL_STEPS) * 100, 100);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => handleNext("en")}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition transform hover:scale-105 shadow-lg font-semibold text-base sm:text-lg"
              aria-label="Select English language"
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => handleNext("am")}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition transform hover:scale-105 shadow-lg font-semibold text-base sm:text-lg"
              aria-label="Select Amharic language"
            >
              🇪🇹 አማርኛ
            </button>
          </div>
        );

      case 1:
        return (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
            <button
              onClick={() => handleNext("gregorian")}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition transform hover:scale-105 shadow-lg font-semibold text-base sm:text-lg"
              aria-label="Select Gregorian Calendar"
            >
              {t("gregorianCalendar")}
            </button>
            <button
              onClick={() => handleNext("ethiopian")}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition transform hover:scale-105 shadow-lg font-semibold text-base sm:text-lg"
              aria-label="Select Ethiopian Calendar"
            >
              {t("ethiopianCalendar")}
            </button>
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

      case 11:
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
                      <div className="text-xs text-gray-400 mb-1">{language === 'en' ? 'Booking Fee (Non-Refundable)' : 'ብጃ ክፍያ (ይመላሰ ያልሚችል)'}</div>
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

      case 12:
        return (
          <div className="space-y-3 w-full max-w-md">
            <input
              type="number"
              min="1"
              placeholder="e.g., 50"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleNext(inputValue)}
              className="w-full px-4 py-3 bg-slate-700 text-white border-2 border-yellow-500 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 placeholder-gray-400"
              aria-label="Enter number of guests"
            />
            <div className="flex gap-2">
              <button
                onClick={goBack}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition text-sm font-semibold"
                aria-label="Go back"
              >
                {t("back")}
              </button>
              <button
                onClick={() => handleNext(inputValue)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-lg transition font-semibold text-sm"
                aria-label="Continue"
              >
                {t("next")}
              </button>
            </div>
          </div>
        );

      case 18:
        return (
          <div className="space-y-3 w-full max-w-md">
            <textarea
              placeholder={language === 'am' ? "ምሳሌ፦ ያማረ የአበባ ጭብጥ፣ ዘመናዊ ቀላል ዲዛይን፣ ባህላዊ..." : "e.g., Elegant floral theme, modern minimalist, traditional..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  handleNext(inputValue);
                }
              }}
              className="w-full px-4 py-3 bg-slate-700 text-white border-2 border-yellow-500 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 placeholder-gray-400 h-24 resize-none"
              aria-label="Enter special theme or design preferences"
            />
            <p className="text-gray-300 text-xs">{language === 'am' ? 'ምርጫ ከሌለዎት ባዶ ይተዉት' : 'Leave blank if no preference'}</p>
            <div className="flex gap-2">
              <button
                onClick={goBack}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition text-sm font-semibold"
                aria-label="Go back"
              >
                {t("back")}
              </button>
              <button
                onClick={() => handleNext(inputValue || "No specific theme")}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-lg transition font-semibold text-sm"
                aria-label="Continue to confirmation"
              >
                {t("next")}
              </button>
            </div>
          </div>
        );

      case 19: {
        const pkgInfoDeposit = PACKAGES.find(p => p.name === bookingData.plan);
        const depositAmount = Math.round((pkgInfoDeposit?.price || 0) / 2);
        const chapaKey = import.meta.env.VITE_CHAPA_PUBLIC_KEY;

        return (
          <div className="w-full max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-500 rounded-xl p-6 space-y-4 shadow-2xl">
            {/* Deposit Amount Display */}
            <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 border-2 border-yellow-500 p-6 rounded-lg text-center">
              <div className="text-yellow-300 text-sm font-semibold mb-2">{language === 'en' ? 'Booking Fee (Non-Refundable)' : 'የቅድሚያ ክፍያ (ተመላሽ የማይደረግ)'}</div>
              <div className="text-4xl font-bold text-yellow-100 mb-2">ETB {depositAmount.toLocaleString()}</div>
              <div className="text-xs text-yellow-200">{language === 'en' ? 'Required to secure your ' + bookingData.plan + ' package booking' : 'የ' + bookingData.plan + ' ጥቅል ዝግጅትዎን ለማረጋገጥ ያስፈልጋል'}</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg text-sm mb-4 border-l-4 border-yellow-500">
              {language === "am" ? (
                <>
                  <p className="text-white whitespace-pre-line">{translations.am.noticeBody}</p>
                  <hr className="border-yellow-500 border-opacity-30 my-2" />
                  <p className="text-gray-400 whitespace-pre-line text-xs">{translations.en.noticeBody}</p>
                </>
              ) : (
                <p className="text-white whitespace-pre-line">{translations.en.noticeBody}</p>
              )}
            </div>

            {!showTerms && (
              <button
                onClick={() => setShowTerms(true)}
                className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-yellow-400 transition font-semibold"
                aria-label="Show terms and conditions"
              >
                📄 {language === "en" ? "View Terms & Conditions" : "ውሎቹን ይመልከቱ / View Terms & Conditions"}
              </button>
            )}

            {showTerms && (
              <div className="bg-slate-900 p-4 rounded-lg text-xs max-h-64 overflow-y-auto mb-4 border border-yellow-500 border-opacity-30">
                <h3 className="text-yellow-400 font-bold mb-3">
                  {language === "am" ? `${translations.am.termsTitle} / ${translations.en.termsTitle}` : translations.en.termsTitle}
                </h3>
                {language === "am" ? (
                  <>
                    <p className="text-white whitespace-pre-line leading-relaxed">{translations.am.termsText}</p>
                    <hr className="border-yellow-500 border-opacity-30 my-3" />
                    <p className="text-gray-400 whitespace-pre-line leading-relaxed">{translations.en.termsText}</p>
                  </>
                ) : (
                  <p className="text-white whitespace-pre-line leading-relaxed">{translations.en.termsText}</p>
                )}
              </div>
            )}

            {!termsAccepted ? (
              <button
                onClick={handleAcceptTerms}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition text-lg transform hover:scale-105"
                aria-label="Accept terms and conditions"
              >
                {language === "am" ? `${translations.am.acceptTerms} / ${translations.en.acceptTerms}` : translations.en.acceptTerms}
              </button>
            ) : (
              <>
                <div className="text-green-400 text-sm font-semibold bg-green-900 bg-opacity-30 p-3 rounded-lg border border-green-500">
                  ✅ {t("termsAccepted")}
                </div>

                {/* PAYMENT METHOD SELECTION */}
                <div className="space-y-3">
                  <h3 className="text-white font-bold text-center mb-4">💳 {language === 'en' ? 'SELECT PAYMENT METHOD' : 'የክፍያ ዘዴ ይምረጡ'}</h3>

                  {/* Option 1: Chapa */}
                  {chapaKey && (
                    <button
                      onClick={submitChapaHostedPayment}
                      className="w-full p-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-bold transition transform hover:scale-105 border-2 border-purple-400 shadow-lg"
                      aria-label="Pay with Chapa"
                    >
                      <div className="text-2xl mb-2">🏦</div>
                      <div className="font-bold">{language === 'en' ? 'Pay Online with Chapa' : 'በቻፓ በመስመር ላይ ይክፈሉ'}</div>
                      <div className="text-xs opacity-90">
                        {language === 'en'
                          ? 'Credit Card, Telebirr, or CBE Wallet - Instant payment'
                          : 'ክሬዲት ካርድ፣ ቴሌብር ወይም የሲቢኢ ዋሌት — ፈጣን ክፍያ'}
                      </div>
                    </button>
                  )}

                  {/* Option 2: Manual Bank Transfer */}
                  <button
                    onClick={() => setShowManualPayment(!showManualPayment)}
                    className="w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold transition transform hover:scale-105 border-2 border-blue-400 shadow-lg"
                    aria-label="Pay via bank transfer"
                  >
                    <div className="text-2xl mb-2">🏛️</div>
                    <div className="font-bold">{language === 'en' ? 'Pay via Bank Transfer (CBE)' : 'በባንክ ዝውውር ይክፈሉ (CBE)'}</div>
                    <div className="text-xs opacity-90">
                      {language === 'en'
                        ? 'Direct bank transfer - Manual verification'
                        : 'ቀጥተኛ የባንክ ዝውውር — በእጅ የሚረጋገጥ'}
                    </div>
                  </button>

                  {/* Option 3: Manual Cash Pickup */}
                  <button
                    onClick={() => {
                      showToast(language === 'en'
                        ? "Please contact us at +251912345678 for cash payment pickup"
                        : "ለጥሬ ገንዘብ ክፍያ እባክዎን +251912345678 ይደውሉ", "info", 5000);
                    }}
                    className="w-full p-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-bold transition transform hover:scale-105 border-2 border-green-400 shadow-lg"
                    aria-label="Pay via cash"
                  >
                    <div className="text-2xl mb-2">💵</div>
                    <div className="font-bold">{language === 'en' ? 'Pay Cash in Person' : 'በአካል ጥሬ ገንዘብ ይክፈሉ'}</div>
                    <div className="text-xs opacity-90">
                      {language === 'en'
                        ? 'Visit our office or call for arrangement'
                        : 'ቢሮአችንን ይጎብኙ ወይም ለቀጠሮ ይደውሉ'}
                    </div>
                  </button>
                </div>

                {/* Bank Transfer Details (if selected) */}
                {showManualPayment && (
                  <div className="bg-slate-900 p-4 rounded-lg border border-blue-500 border-opacity-50 animate-slideDown">
                    <p className="text-blue-400 font-bold mb-4 text-center text-lg">🏛️ {language === 'en' ? 'BANK TRANSFER DETAILS' : 'የባንክ ዝውውር ዝርዝሮች'}</p>
                    <div className="space-y-3 text-sm text-white">
                      <div className="bg-slate-800 p-3 rounded border border-blue-500 border-opacity-30">
                        <p className="text-blue-300 text-xs font-bold mb-1">{language === 'en' ? 'Account Holder' : 'የሂሳብ ባለቤት'}</p>
                        <p className="font-mono font-bold">Shime Events & Planning</p>
                      </div>
                      <div className="bg-slate-800 p-3 rounded border border-blue-500 border-opacity-30">
                        <p className="text-blue-300 text-xs font-bold mb-1">{language === 'en' ? 'Account Number' : 'የሂሳብ ቁጥር'}</p>
                        <p className="font-mono font-bold">1000XXXXXXXX</p>
                      </div>
                      <div className="bg-slate-800 p-3 rounded border border-blue-500 border-opacity-30">
                        <p className="text-blue-300 text-xs font-bold mb-1">{language === 'en' ? 'Bank Name' : 'የባንክ ስም'}</p>
                        <p className="font-mono font-bold">Commercial Bank of Ethiopia (CBE)</p>
                      </div>
                      <div className="bg-slate-800 p-3 rounded border border-blue-500 border-opacity-30">
                        <p className="text-blue-300 text-xs font-bold mb-1">{language === 'en' ? 'Amount to Transfer' : 'የሚተላለፍ መጠን'}</p>
                        <p className="font-mono font-bold text-yellow-300">ETB {depositAmount.toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-800 p-3 rounded border border-blue-500 border-opacity-30">
                        <p className="text-blue-300 text-xs font-bold mb-1">{language === 'en' ? 'Reference/Description' : 'ማመሳከሪያ'}</p>
                        <p className="font-mono font-bold">{bookingRefNum || "Booking Reference"}</p>
                      </div>
                      <p className="text-blue-300 text-xs mt-3 bg-blue-900 bg-opacity-30 p-2 rounded">
                        {language === 'en'
                          ? '✅ After transfer, send screenshot/proof to WhatsApp along with your booking reference to confirm payment'
                          : '✅ ከዝውውሩ በኋላ የክፍያ ማስረጃ (ስክሪንሾት) ከማመሳከሪያ ቁጥርዎ ጋር በ WhatsApp ይላኩ።'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Download PDF Button */}
                <button
                  onClick={generatePDF}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition text-lg transform hover:scale-105 disabled:opacity-50"
                  aria-label="Download booking contract as PDF"
                >
                  {loading ? (language === 'am' ? "⏳ ሰነድ እየተዘጋጀ ነው..." : "⏳ Generating PDF...") : (language === 'am' ? "📄 ውል ያውርዱ (PDF)" : "📄 Download Contract (PDF)")}
                </button>

                {/* Share with WhatsApp */}
                <button
                  onClick={() => {
                    const message = `Hello Shime Events Team,\n\nI have completed my event booking with the following details:\n\nBooking Reference: ${bookingRefNum}\nVerification Code: ${bookingVerifyPin}\nClient: ${bookingData.fullName}\nEmail: ${bookingData.email}\nEvent Type: ${bookingData.eventType}\nEvent Date: ${bookingData.eventDate} at ${bookingData.eventTime}\nLocation: ${bookingData.eventCity}, ${bookingData.eventCountry}\nPackage: ${bookingData.plan}\nDeposit Amount: ETB ${depositAmount.toLocaleString()}\n\nI have selected a payment method. Please confirm receipt of my booking.\n\nThank you!`;
                    const whatsappUrl = `https://wa.me/251912345678?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition text-lg transform hover:scale-105"
                  aria-label="Share booking via WhatsApp"
                >
                  📱 {language === 'am' ? 'በ WhatsApp ያጋሩ' : 'Share via WhatsApp'}
                </button>

                {/* Share with Telegram */}
                <button
                  onClick={() => {
                    const message = `Hello Shime Events Team%0A%0AI have completed my event booking:%0A%0ABooking Reference: ${bookingRefNum}%0AClient: ${bookingData.fullName}%0AEmail: ${bookingData.email}%0AEvent Type: ${bookingData.eventType}%0AEvent Date: ${bookingData.eventDate} at ${bookingData.eventTime}%0ALocation: ${bookingData.eventCity}, ${bookingData.eventCountry}%0APackage: ${bookingData.plan}%0ADeposit: ETB ${depositAmount.toLocaleString()}%0A%0APlease confirm receipt of my booking.%0A%0AThank you!`;
                    const telegramUrl = `https://t.me/ShimeEvents?text=${message}`;
                    window.open(telegramUrl, '_blank');
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold hover:from-blue-600 hover:to-blue-700 transition text-lg transform hover:scale-105"
                  aria-label="Share booking via Telegram"
                >
                  ✈️ {language === 'am' ? 'በ Telegram ያጋሩ' : 'Share via Telegram'}
                </button>

                <button
                  onClick={() => handleNext("")}
                  className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition text-lg transform hover:scale-105"
                  aria-label="Proceed to booking confirmation"
                >
                  {t("proceedBooking")}
                </button>

                <button
                  onClick={resetBooking}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-700 to-red-800 text-white rounded-lg font-bold hover:from-red-800 hover:to-red-900 transition text-lg transform hover:scale-105 border border-red-500"
                  aria-label="Finish and close booking"
                >
                  {language === "am" ? "✕ ጨርስ እና ዝጋ / Finish & Close" : "✕ Finish & Close"}
                </button>
              </>
            )}
          </div>
        );
      }

      case 20: {
        const pkgInfo = PACKAGES.find(p => p.name === bookingData.plan);
        return (
          <div className="w-full max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-500 rounded-xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-3xl font-bold text-yellow-400 text-center mb-6">✨ {t("viewBooking")}</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900 p-4 rounded-lg border border-yellow-500 border-opacity-30">
                <div className="text-yellow-400 text-xs font-semibold mb-1">{t("labelClient")}</div>
                <div className="text-white font-bold text-sm">{bookingData.fullName}</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg border border-yellow-500 border-opacity-30">
                <div className="text-yellow-400 text-xs font-semibold mb-1">{t("labelEmail")}</div>
                <div className="text-white font-bold text-sm truncate">{bookingData.email}</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg border border-yellow-500 border-opacity-30">
                <div className="text-yellow-400 text-xs font-semibold mb-1">{t("labelPackage")}</div>
                <div className="text-white font-bold text-sm">{bookingData.plan}</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg border border-yellow-500 border-opacity-30">
                <div className="text-yellow-400 text-xs font-semibold mb-1">{t("labelBookingFee")}</div>
                <div className="text-yellow-300 font-bold text-lg">ETB {Math.round((pkgInfo?.price || 0) / 2).toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg border border-yellow-500 border-opacity-30 space-y-2 text-sm text-white">
              <div><strong className="text-yellow-400">{t("labelReference")}:</strong> {bookingRefNum}</div>
              <div><strong className="text-yellow-400">{t("labelEventDate")}:</strong> {calendarType === "ethiopian" ? formatDateForDisplay(bookingData.eventDate, "ethiopian", language) : bookingData.eventDate} {t("labelAt")} {bookingData.eventTime}</div>
              <div><strong className="text-yellow-400">{t("labelLocation")}:</strong> {bookingData.eventCity}, {bookingData.eventCountry}</div>
              <div><strong className="text-yellow-400">{t("labelContact")}:</strong> {bookingData.contactMethod}</div>
            </div>

            {/* Verification PIN — prominent, client must share this with admin */}
            {bookingVerifyPin && (
              <div className="bg-gradient-to-r from-green-900 to-emerald-900 border-2 border-green-400 rounded-xl p-5 text-center shadow-lg">
                <div className="text-green-300 text-xs font-bold uppercase tracking-widest mb-2">
                  {language === "am" ? "✅ የማረጋገጫ ኮድ / Verification Code" : "✅ Your Verification Code"}
                </div>
                <div className="text-4xl font-mono font-black text-white tracking-widest my-3 bg-black bg-opacity-30 rounded-lg py-3 px-4">
                  {bookingVerifyPin}
                </div>
                <div className="text-green-200 text-xs leading-relaxed">
                  {language === "am"
                    ? "ይህን ኮድ ያስቀምጡ። አስተዳዳሪው ዝርዝሮቻቸውን ለማረጋገጥ ይህን ኮድ ይጠቀማሉ።"
                    : "Save this code. The admin uses it to verify and look up your booking details."}
                </div>
              </div>
            )}

            {bookingRefNum && (
              <div className="bg-slate-900 p-4 rounded-lg border-2 border-yellow-500 text-center">
                <div className="text-yellow-400 font-bold mb-3">📱 {t("labelQrCode")}</div>
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
                <div className="text-xs text-gray-300 mt-3">{t("labelReference")}: {bookingRefNum}</div>
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
                      {copying ? t("copiedShort") : t("copyRef")}
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
              {loading ? <Spinner /> : t("downloadPdf")}
            </button>

            <button
              onClick={() => {
                const pkgForShare = PACKAGES.find(p => p.name === bookingData.plan);
                const depositForShare = Math.round((pkgForShare?.price || 0) / 2);
                const message = `Hello Shime Events Team! 🎉\n\nMy booking is confirmed. Here are the details:\n\n📋 Reference: ${bookingRefNum}\n👤 Name: ${bookingData.fullName}\n📧 Email: ${bookingData.email}\n📞 Phone: ${bookingData.phone}\n🎪 Event: ${bookingData.eventType}\n📦 Package: ${bookingData.plan}\n📅 Date: ${bookingData.eventDate} at ${bookingData.eventTime}\n📍 Location: ${bookingData.eventCity}, ${bookingData.eventCountry}\n💰 Deposit: ETB ${depositForShare.toLocaleString()}\n\nPlease confirm my booking. Thank you!`;
                window.open(`https://wa.me/251912345678?text=${encodeURIComponent(message)}`, "_blank");
              }}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition transform hover:scale-105 text-lg"
              aria-label="Share booking via WhatsApp"
            >
              📲 {language === "am" ? "በ WhatsApp ያጋሩ / Share via WhatsApp" : "Share via WhatsApp"}
            </button>

            <button
              onClick={resetBooking}
              className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-indigo-800 transition transform hover:scale-105"
              aria-label="Edit booking - start a new booking from the beginning"
            >
              ✏️ {language === "am" ? "ዝግጅቱን አርትዕ / Edit Booking" : "Edit Booking"}
            </button>

            <div className="bg-slate-900 p-4 rounded-lg text-xs whitespace-pre-line border-l-4 border-yellow-500">
              {language === "am" ? (
                <>
                  <p className="text-white">{translations.am.sendInstructions}</p>
                  <hr className="border-yellow-500 border-opacity-30 my-2" />
                  <p className="text-gray-400">{translations.en.sendInstructions}</p>
                </>
              ) : (
                <p className="text-white">{translations.en.sendInstructions}</p>
              )}
            </div>

            <button
              onClick={resetBooking}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-bold hover:from-red-700 hover:to-red-800 transition transform hover:scale-105 text-lg"
              aria-label="Close chatbot"
            >
              {t("closeChat")}
            </button>
          </div>
        );
      }

      default:
        // Ethiopian calendar: show the real 13-month Ge'ez picker for the date step.
        if (step === 15 && calendarType === "ethiopian") {
          return (
            <div className="w-full max-w-full sm:max-w-md space-y-3">
              <EthiopianDatePicker
                value={bookingData.eventDate || null}
                language={language || "en"}
                onSelect={(gregorian) => handleNext(gregorian)}
              />
              {error && <div className="text-red-400 text-xs sm:text-sm font-semibold bg-red-900 bg-opacity-20 p-2 rounded">{error}</div>}
              {step > 0 && step < 19 && (
                <button
                  onClick={goBack}
                  className="w-full px-3 sm:px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-bold transition text-sm sm:text-base"
                  aria-label="Go to previous step"
                >
                  {t("back")}
                </button>
              )}
            </div>
          );
        }
        return (
          <div className="w-full max-w-full sm:max-w-md space-y-3">
            <div>
              <label className="block text-yellow-400 text-xs sm:text-sm font-semibold mb-2">
                {step < 19 && <span className="text-red-400">*</span>} {t("required")}
              </label>
              <input
                type={step === 15 ? "date" : step === 16 ? "time" : "text"}
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
                placeholder={step === 15 ? "YYYY-MM-DD" : step === 16 ? "HH:MM" : ""}
                min={step === 16 ? "00:00" : undefined}
                max={step === 16 ? "23:59" : undefined}
                className="w-full px-3 sm:px-4 py-3 sm:py-3 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 font-semibold shadow-lg text-base"
                autoFocus
                aria-label={`Input for step ${step}`}
              />
            </div>
            {error && <div className="text-red-400 text-xs sm:text-sm font-semibold bg-red-900 bg-opacity-20 p-2 rounded">{error}</div>}
            <div className="flex gap-2 sm:gap-3">
              {step > 0 && step < 19 && (
                <button
                  onClick={goBack}
                  className="flex-1 px-3 sm:px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-bold transition text-sm sm:text-base"
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
                className="flex-1 px-3 sm:px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition transform hover:scale-105 shadow-lg text-sm sm:text-base"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
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

      {/* Logo watermark — sized at 120vmax so white JPEG corners always bleed off-screen */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          width: "120vmax",
          height: "120vmax",
          transform: "translate(-50%, -50%)",
          backgroundImage: "url('/shime-logo.jpeg')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "contain",
          opacity: 0.07,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Dark vignette so edges stay deep and readable */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 35%, rgba(15,23,42,0.75) 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
      <Toast {...toast} />

      <header className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-6 sm:py-8 border-b-2 border-yellow-500 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-full sm:max-w-5xl mx-auto px-4">
          <div className="mb-6 animate-fadeIn text-center">
            <h1 className="brand-font text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">Shime Events</h1>
            <p className="text-white text-xs sm:text-sm opacity-90 tracking-wide">Professional Event Planning & Coordination</p>
          </div>

          {step > 0 && language && step < 19 && (
            <div className="space-y-2 animate-fadeIn">
              <div className="flex justify-between items-center text-xs text-yellow-400 mb-2 font-semibold">
                <span>{t("stepOf")} {getStepDisplay()}/{TOTAL_STEPS}</span>
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

      <main className="max-w-full sm:max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-24 sm:pb-20">
        <div className="space-y-3 mb-6 sm:mb-8 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-2 sm:pr-4 rounded-lg">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`animate-fadeIn flex ${msg.type === "agent" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-xs sm:max-w-sm px-3 sm:px-4 py-2 sm:py-3 rounded-xl ${
                  msg.type === "agent"
                    ? "bg-gradient-to-br from-slate-700 to-slate-800 border-l-4 border-yellow-500 text-white shadow-lg"
                    : "bg-gradient-to-br from-yellow-500 to-yellow-600 text-slate-900 font-semibold shadow-lg"
                } text-xs sm:text-sm leading-relaxed`}
              >
                {msg.type === "agent" && msg.secondary ? (
                  <>
                    <p className="whitespace-pre-line font-semibold text-white">{msg.text}</p>
                    <hr className="border-yellow-500 border-opacity-30 my-2" />
                    <p className="whitespace-pre-line text-gray-400 text-xs">{msg.secondary}</p>
                  </>
                ) : (
                  <p className="whitespace-pre-line">{msg.text}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="max-w-full sm:max-w-md mx-auto px-2 sm:px-0 space-y-3 sm:space-y-4">
          {renderStep()}
        </div>

        {/* Floating QR Button */}
        <button
          onClick={() => setShowQRSection(!showQRSection)}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full shadow-2xl hover:from-purple-700 hover:to-purple-800 transition transform hover:scale-110 flex items-center justify-center font-bold text-lg sm:text-xl z-40"
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
    </div>
  );
}
