import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

const translations = {
  en: {
    welcome: "Welcome to Shime Events & Planning",
    welcomeSubtitle: "Your Trusted Partner for Unforgettable Celebrations",
    welcomeDesc: "We specialize in creating bespoke events tailored to your vision.",
    selectLanguage: "Select your preferred language:",
    askNationality: "What is your nationality?",
    askResidency: "Which country do you currently reside in?",
    askPhone: "What is your phone number? (Format: +country code + number)",
    invalidPhone: "❌ Invalid phone number. Please use format: +251911234567",
    phoneCountryMismatch: "⚠️ Your phone number country code doesn't match your residence country. Please verify.",
    askEmail: "What is your email address?",
    invalidEmail: "❌ Invalid email. Please enter a valid email address.",
    askIdType: "Please enter your ID or Passport number:",
    invalidId: "❌ Invalid ID/Passport. Please try again.",
    askFullName: "What is your full name?",
    invalidName: "❌ Please enter a valid full name (first and last name).",
    askPassword: "Create a security PIN (6+ digits):",
    askPhoneContact: "What is your contact phone number?",
    askContactMethod: "How would you prefer to be contacted?",
    askEventType: "What type of event are you planning?",
    askEventCountry: "In which country will the event be held?",
    eventCountryMismatch: "⚠️ Note: Your event is in a different country than your residence.",
    askEventCity: "In which city will the event take place?",
    cityCountryMismatch: "⚠️ Please ensure the city matches your selected country.",
    askDate: "When will your event take place?",
    dateBooked: "⚠️ This date is unavailable. Please select another date.",
    askTime: "What time would you prefer?",
    timeBooked: "⚠️ This time slot is unavailable. Please select another time.",
    askLocation: "What is the venue location/address?",
    noticeTitle: "Booking Confirmation & Payment",
    noticeBody: "To secure your booking, please submit payment:\n\n🏦 CBE WALLET\nAccount: 1000XXXXXXXX\nName: Shime Events & Planning",
    termsTitle: "TERMS & CONDITIONS",
    termsText: `1. A non-refundable deposit is required to secure your booking.
2. Full payment is due 14 days before the event.
3. Cancellations within 7 days of the event forfeit 50% of total payment.
4. Shime Events & Planning reserves the right to substitute vendors of equal quality.
5. The client is responsible for accurate information provided during booking.
6. Any changes to date, venue, or guest count must be requested in writing.
7. Force majeure clauses apply for events outside our control.
8. All disputes are subject to Ethiopian jurisdiction.

By signing this agreement, you confirm that you have read and accepted all terms.`,
    acceptTerms: "✅ I Accept the Terms & Conditions",
    shareWhatsapp: "📲 Share via WhatsApp",
    viewBooking: "📋 Booking Confirmation",
    downloadPdf: "⬇️ Download Contract",
    sendInstructions: "Next Steps:\n1. Send proof of payment\n2. Send signed contract\n\nSubmit to:\n📱 WhatsApp: +251 91 234 5678\n✉️ Telegram: @ShimeEvents",
    bookingConfirmed: "Booking Confirmed",
    termsAccepted: "✅ Terms accepted successfully.",
    proceedBooking: "Review Booking",
    contactUs: "📲 Contact Us",
    stepOf: "Step",
    estimatedDeposit: "Estimated Deposit:",
    signature: "Signature",
    elegance: "Elegance",
    premium: "Premium",
    exclusive: "Exclusive",
    selectPackage: "Select your event package:",
  },
  am: {
    welcome: "በ Shime Events & Planning ደህና መጡ",
    welcomeSubtitle: "ለተረጋገጥ አጠቃሉ ዝግጅት ታሪካዊ አጋዥ",
    welcomeDesc: "እኛ በእርስዎ ራዕይ ላይ ተመስርተው ልዩ ዝግጅቶችን ይፈጥራለን።",
    selectLanguage: "ተመራጭ ቋንቋዎን ይምረጡ:",
    askNationality: "ተዋለድነትዎ ምንድን ነው?",
    askResidency: "በአሁኑ ጊዜ በ የት ሀገር ነው የሚኖሩት?",
    askPhone: "ስልክ ቁጥርዎ ምንድን ነው? (ገጽታ: +251911234567)",
    invalidPhone: "❌ ተገቢ ያልሆነ ስልክ ቁጥር። እንደገና ይሞክሩ።",
    phoneCountryMismatch: "⚠️ ስልክ ቁጥርዎ ከደረሰበት ሀገር ጋር አይዛመድም። እባክዎ ያረጋግጡ።",
    askEmail: "ኢሜይሉ ምንድን ነው?",
    invalidEmail: "❌ ተገቢ ያልሆነ ኢሜይል። እባክዎ ትክክለኛ ኢሜይል ያስገቡ።",
    askIdType: "ID ወይም ፓስፖርት ቁጥርዎን ያስገቡ:",
    invalidId: "❌ ተገቢ ያልሆነ ID/ፓስፖርት።",
    askFullName: "ሙሉ ስምዎ ምንድን ነው?",
    invalidName: "❌ ትክክለኛ ሙሉ ስም ያስገቡ።",
    askPassword: "보안 ፒን ይፍጠሩ (6+ አሃዞች):",
    askPhoneContact: "Contact ስልክ ቁጥር ምንድን ነው?",
    askContactMethod: "እንዴት ለአንተ ተገናኝ ማድረግ ትመርጥ?",
    askEventType: "ምን ዓይነት ዝግጅት ነው?",
    askEventCountry: "ዝግጅቱ በ የት ሀገር ይሆናል?",
    eventCountryMismatch: "⚠️ ማስታወሻ: ዝግጅትዎ ከመኖሪያ ሀገር በተለየ ሀገር ነው።",
    askEventCity: "ዝግጅቱ በ የት ከተማ ይሆናል?",
    cityCountryMismatch: "⚠️ ከተማው ከተመረጠው ሀገር ጋር ይዛመድ እንደሆነ ያረጋግጡ።",
    askDate: "ዝግጅትዎ መቼ ይሆናል?",
    dateBooked: "⚠️ ይህ ቀን ተገኝነት የለውም།",
    askTime: "ምን ሰዓት ይመርጣሉ?",
    timeBooked: "⚠️ ይህ ሰዓት ተገኝነት የለውም።",
    askLocation: "ቦታ/አድራሻ ምንድን ነው?",
    noticeTitle: "ዝግጅት ማረጋገጥ እና ክፍያ",
    noticeBody: "ዝግጅትዎን ለማረጋገጥ ክፍያ ያስገቡ:\n\n🏦 CBE WALLET\nHesaab: 1000XXXXXXXX\nSemie: Shime Events & Planning",
    termsTitle: "ውል ስምምነት",
    termsText: `1. ዝግጅቱን ለማረጋገጥ ማይወስድ ክፍያ ያስፈልጋል።
2. ሙሉ ክፍያ ከዝግጅቱ 14 ቀን በፊት ይከሰታል።
3. በዝግጅቱ 7 ቀን ውስጥ ሥራ ማስቋረጥ 50% ይጠፋል።
4. Shime Events & Planning ተመሳሳይ ጥራት ያላቸውን አገልግሎቶችን መለዋወጥ ይችላል።
5. ደንበኛው ስለ ገቢ ትክክለኛ መረጃ ተጠያቂ ነው።
6. ወደ ቀን፣ ቦታ ወይም ስብሰባ ቁጥር ለውጥ በጽሁፍ መጠየቅ ያስፈልጋል።
7. ታናናሽ ሁኔታዎች ተፈጥሯዊ ሚና ይጫወታሉ።
8. ሁሉም ክርክር በኢትዮጵያ ሕግ ይመገባል።

ይህን ስምምነት በመፈረም፣ ሁሉንም ውሎች ተቀብለዋል።`,
    acceptTerms: "✅ ውሎችን ተቀብያለሁ",
    shareWhatsapp: "📲 በ WhatsApp ላክ",
    viewBooking: "📋 ዝግጅት ማረጋገጥ",
    downloadPdf: "⬇️ ውል ድቅድቅ",
    sendInstructions: "ቀጣይ ደረጃ:\n1. ክፍያ ማስረጃ ይላኩ\n2. ውል ይላኩ\n\nልኩ:\n📱 WhatsApp: +251 91 234 5678\n✉️ Telegram: @ShimeEvents",
    bookingConfirmed: "ዝግጅት ተረጋግጧል",
    termsAccepted: "✅ ውሎች ተቀባይ ነበሩ።",
    proceedBooking: "ዝግጅትን ይገምግሙ",
    contactUs: "📲 ያገኙ",
    stepOf: "ደረጃ",
    selectPackage: "የዝግጅት ፓኬጅ ይምረጡ:",
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

const COUNTRIES = ["Ethiopia", "Kenya", "Uganda", "Rwanda", "Tanzania", "South Africa", "Nigeria", "Ghana", "Other"];
const PHONE_CODES = {
  "Ethiopia": "+251",
  "Kenya": "+254",
  "Uganda": "+256",
  "Rwanda": "+250",
  "Tanzania": "+255",
  "South Africa": "+27",
  "Nigeria": "+234",
  "Ghana": "+233",
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
  const chatEndRef = useRef(null);

  const getBilingualText = (key) => {
    if (!language) return translations.en[key];
    const engText = translations.en[key];
    const transText = translations[language][key];
    if (language === "en") return engText;
    return `${engText}\n\n${transText}`;
  };

  const t = (key) => translations[language || "en"][key] || translations.en[key];

  const addAgentMessage = (text) => {
    setMessages((prev) => [...prev, { type: "agent", text }]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { type: "user", text }]);
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
          color: {
            dark: '#d4af37',
            light: '#1a1a2e'
          }
        }
      );
      setQrCode(qrDataUrl);
      return qrDataUrl;
    } catch (err) {
      console.error('QR Code generation failed:', err);
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

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const goldColor = [212, 175, 55];
    const textColor = [255, 255, 255];
    const refNum = `SE-${Date.now()}`;
    const today = new Date().toLocaleDateString();
    const pkgInfo = PACKAGES.find(p => p.name === bookingData.plan);
    const deposit = pkgInfo?.price || 0;

    // Page 1
    doc.setFillColor(26, 26, 46);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setTextColor(...goldColor);
    doc.setFontSize(36);
    doc.text("SHIME EVENTS", pageWidth / 2, 30, { align: "center" });
    doc.setFontSize(16);
    doc.text("& PLANNING", pageWidth / 2, 45, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.text("Professional Event Planning & Coordination", pageWidth / 2, 60, { align: "center" });

    doc.setLineWidth(0.5);
    doc.setDrawColor(...goldColor);
    doc.line(30, 70, pageWidth - 30, 70);

    doc.setFontSize(12);
    doc.setTextColor(...goldColor);
    doc.text("BOOKING CONFIRMATION DOCUMENT", pageWidth / 2, 85, { align: "center" });

    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.text(`Booking Reference: ${refNum}`, pageWidth / 2, 100, { align: "center" });
    doc.text(`Booking Date: ${today}`, pageWidth / 2, 108, { align: "center" });

    let boxY = 125;
    doc.setFillColor(40, 40, 70);
    doc.rect(20, boxY, pageWidth - 40, 60);

    doc.setTextColor(...goldColor);
    doc.setFontSize(11);
    doc.text("BOOKING SUMMARY", 25, boxY + 8);

    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    doc.text(`Client: ${bookingData.fullName}`, 25, boxY + 20);
    doc.text(`Event: ${bookingData.eventType} | Date: ${bookingData.eventDate}`, 25, boxY + 30);
    doc.text(`Package: ${bookingData.plan} | Location: ${bookingData.eventCity}, ${bookingData.eventCountry}`, 25, boxY + 40);
    doc.text(`Deposit: ETB ${deposit.toLocaleString()}`, 25, boxY + 50);

    // Page 2
    doc.addPage();
    doc.setFillColor(26, 26, 46);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setTextColor(...goldColor);
    doc.setFontSize(14);
    doc.text("CLIENT INFORMATION", 20, 15);
    doc.setLineWidth(0.5);
    doc.setDrawColor(...goldColor);
    doc.line(20, 18, pageWidth - 20, 18);

    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    let yPos = 28;
    const clientInfo = [
      ["Full Name", bookingData.fullName || "N/A"],
      ["Email Address", bookingData.email || "N/A"],
      ["Phone Number", bookingData.phoneNumber || "N/A"],
      ["Contact Phone", bookingData.contactPhone || "N/A"],
      ["ID / Passport Number", bookingData.idNumber || "N/A"],
      ["Nationality", bookingData.nationality || "N/A"],
      ["Country of Residence", bookingData.residency || "N/A"],
      ["Preferred Contact Method", bookingData.contactMethod || "N/A"],
      ["Security PIN", bookingData.verificationPin ? "••••••" : "N/A"],
    ];

    clientInfo.forEach(([label, value]) => {
      doc.setTextColor(...goldColor);
      doc.text(`${label}:`, 20, yPos);
      doc.setTextColor(...textColor);
      doc.text(value, 80, yPos);
      yPos += 7;
    });

    doc.setTextColor(...goldColor);
    doc.setFontSize(14);
    doc.text("EVENT DETAILS", 20, yPos + 5);
    doc.line(20, yPos + 8, pageWidth - 20, yPos + 8);

    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    yPos += 18;
    const eventInfo = [
      ["Event Type", bookingData.eventType || "N/A"],
      ["Selected Package", bookingData.plan || "N/A"],
      ["Event Date", bookingData.eventDate || "N/A"],
      ["Event Time", bookingData.eventTime || "N/A"],
      ["Event Country", bookingData.eventCountry || "N/A"],
      ["Event City", bookingData.eventCity || "N/A"],
      ["Venue / Location", bookingData.eventLocation || "N/A"],
    ];

    eventInfo.forEach(([label, value]) => {
      doc.setTextColor(...goldColor);
      doc.text(`${label}:`, 20, yPos);
      doc.setTextColor(...textColor);
      doc.text(value, 80, yPos);
      yPos += 7;
    });

    doc.setTextColor(...goldColor);
    doc.setFontSize(14);
    doc.text("PAYMENT INFORMATION", 20, yPos + 5);
    doc.line(20, yPos + 8, pageWidth - 20, yPos + 8);

    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    yPos += 18;
    doc.text("Payment Method: CBE WALLET", 20, yPos);
    yPos += 7;
    doc.text("Account Number: 1000XXXXXXXX", 20, yPos);
    yPos += 7;
    doc.text("Account Name: Shime Events & Planning", 20, yPos);
    yPos += 7;
    doc.setTextColor(...goldColor);
    doc.text(`Deposit Amount: ETB ${deposit.toLocaleString()}`, 20, yPos);

    // Page 3
    doc.addPage();
    doc.setFillColor(26, 26, 46);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setTextColor(...goldColor);
    doc.setFontSize(14);
    doc.text("TERMS & CONDITIONS", 20, 15);
    doc.line(20, 18, pageWidth - 20, 18);

    doc.setTextColor(...textColor);
    doc.setFontSize(8);
    const termsLines = doc.splitTextToSize(translations.en["termsText"], pageWidth - 40);
    let termsY = 28;

    termsLines.forEach((line) => {
      if (termsY > 270) {
        doc.addPage();
        doc.setFillColor(26, 26, 46);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
        termsY = 20;
      }
      doc.text(line, 20, termsY);
      termsY += 4;
    });

    // Page 4
    doc.addPage();
    doc.setFillColor(26, 26, 46);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setTextColor(...goldColor);
    doc.setFontSize(14);
    doc.text("ELECTRONIC SIGNATURE & CLIENT AGREEMENT", 20, 15);
    doc.line(20, 18, pageWidth - 20, 18);

    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    const agreementText = `I, ${bookingData.fullName}, hereby declare that:

1. I have read and fully understood all Terms & Conditions.
2. I confirm that all information provided is accurate and truthful.
3. I authorize Shime Events & Planning to commence planning services.
4. I agree to the deposit of ETB ${deposit.toLocaleString()} and payment terms.
5. I have received and reviewed my security PIN for account access.

By electronically signing below, I confirm acceptance of this booking agreement.`;

    const agreementLines = doc.splitTextToSize(agreementText, pageWidth - 40);
    let agreementY = 30;
    agreementLines.forEach((line) => {
      doc.text(line, 20, agreementY);
      agreementY += 5;
    });

    agreementY += 10;
    doc.setTextColor(...goldColor);
    doc.setFontSize(10);
    doc.text("ELECTRONIC SIGNATURE", 20, agreementY);

    try {
      const sigImage = generateElectronicSignature();
      doc.addImage(sigImage, "PNG", 20, agreementY + 5, 100, 25);
    } catch (e) {
      doc.setTextColor(...textColor);
      doc.setFontSize(12);
      doc.text(bookingData.fullName.split(" ")[0].charAt(0) + bookingData.fullName.split(" ")[bookingData.fullName.split(" ").length - 1].charAt(0), 25, agreementY + 15);
    }

    agreementY += 35;

    doc.setTextColor(...goldColor);
    doc.setFontSize(8);
    doc.text(`Signed on: ${today}`, 20, agreementY);
    doc.text(`Generated: Automated Electronic Signature`, 20, agreementY + 5);
    doc.text(`Booking Reference: ${refNum}`, 20, agreementY + 10);

    // Footer
    doc.setFillColor(40, 40, 70);
    doc.rect(0, pageHeight - 25, pageWidth, 25);

    doc.setTextColor(...goldColor);
    doc.setFontSize(8);
    doc.text("IMPORTANT: Please keep a copy of this document for your records.", 20, pageHeight - 18);
    doc.text("Send signed contract and proof of payment to: WhatsApp +251 91 234 5678 | Telegram @ShimeEvents", 20, pageHeight - 13);
    doc.text(`Document ID: ${refNum} | Generated: ${new Date().toLocaleString()}`, 20, pageHeight - 3);

    doc.save(`ShimeEvents_Booking_${(bookingData.fullName || "Client").replace(/ /g, "_")}_${refNum.replace("SE-", "")}.pdf`);
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
        return;

      case 1:
        if (!value || value.length < 3) {
          isValid = false;
          errorMsg = "Please enter a valid nationality";
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, nationality: value });
          setStep(2);
          addAgentMessage(getBilingualText("askResidency"));
        } else {
          setError(errorMsg);
        }
        return;

      case 2:
        if (!value || value.length < 2) {
          isValid = false;
          errorMsg = "Please select a country";
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, residency: value });
          setStep(3);
          addAgentMessage(getBilingualText("askPhone"));
        } else {
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
        } else {
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
        } else {
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
        } else {
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
        } else {
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
          setBookingData({ ...bookingData, verificationPin: value });
          setStep(8);
          addAgentMessage(getBilingualText("askPhoneContact"));
        } else {
          setError(errorMsg);
        }
        return;

      case 8:
        if (!validatePhone(value)) {
          isValid = false;
          errorMsg = getBilingualText("invalidPhone");
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, contactPhone: value });
          setStep(9);
          addAgentMessage(getBilingualText("askContactMethod"));
        } else {
          setError(errorMsg);
        }
        return;

      case 9:
        addUserMessage(value);
        setBookingData({ ...bookingData, contactMethod: value });
        setStep(10);
        addAgentMessage(getBilingualText("askEventType"));
        return;

      case 10:
        addUserMessage(value);
        setBookingData({ ...bookingData, eventType: value });
        setStep(11);
        addAgentMessage(getBilingualText("selectPackage"));
        return;

      case 11:
        addUserMessage(`📦 ${value}`);
        setBookingData({ ...bookingData, plan: value });
        setStep(12);
        addAgentMessage(getBilingualText("askEventCountry"));
        return;

      case 12:
        if (!value || value.length < 2) {
          isValid = false;
          errorMsg = "Please enter a valid country";
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, eventCountry: value });

          if (value !== bookingData.residency) {
            addAgentMessage(getBilingualText("eventCountryMismatch"));
          }

          setStep(13);
          addAgentMessage(getBilingualText("askEventCity"));
        } else {
          setError(errorMsg);
        }
        return;

      case 13:
        if (!value || value.length < 2) {
          isValid = false;
          errorMsg = "Please enter a valid city";
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, eventCity: value });
          setStep(14);
          addAgentMessage(getBilingualText("askDate"));
        } else {
          setError(errorMsg);
        }
        return;

      case 14:
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
          setStep(15);
          addAgentMessage(getBilingualText("askTime"));
        } else {
          setError(errorMsg);
        }
        return;

      case 15:
        if (isDateBooked(bookingData.eventDate, value)) {
          isValid = false;
          errorMsg = getBilingualText("timeBooked");
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, eventTime: value });
          setStep(16);
          addAgentMessage(getBilingualText("askLocation"));
        } else {
          setError(errorMsg);
        }
        return;

      case 16:
        if (!value || value.length < 3) {
          isValid = false;
          errorMsg = "Please enter a valid venue";
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, eventLocation: value });
          setStep(17);
          addAgentMessage(getBilingualText("noticeTitle"));
        } else {
          setError(errorMsg);
        }
        return;

      case 17:
        setStep(18);
        addAgentMessage(getBilingualText("bookingConfirmed"));
        return;

      default:
        return;
    }

    setInputValue("");
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
  };

  useEffect(() => {
    if (step === 0 && messages.length === 0) {
      addAgentMessage(`${translations.en.welcome}\n\n${translations.en.welcomeSubtitle}\n\n${translations.en.selectLanguage}`);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (step === 18 && !bookingRefNum) {
      const refNum = `SE-${Date.now()}`;
      setBookingRefNum(refNum);
      generateQRCode(refNum);
    }
  }, [step]);

  const getProgressPercentage = () => {
    return Math.min((step / 18) * 100, 100);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleNext("en")}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition transform hover:scale-105 shadow-lg font-semibold"
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => handleNext("am")}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition transform hover:scale-105 shadow-lg font-semibold"
            >
              🇪🇹 አማርኛ
            </button>
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {COUNTRIES.map((country) => (
              <button
                key={country}
                onClick={() => handleNext(country)}
                className="p-3 bg-gradient-to-br from-slate-700 to-slate-800 border border-blue-500 hover:border-blue-400 rounded-lg hover:bg-gradient-to-br hover:from-blue-700 hover:to-blue-800 transition text-sm font-semibold text-white"
              >
                {country}
              </button>
            ))}
          </div>
        );

      case 9:
        return (
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handleContactMethod("Telegram")}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 font-semibold"
            >
              📱 Telegram
            </button>
            <button
              onClick={() => handleContactMethod("WhatsApp")}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition transform hover:scale-105 font-semibold"
            >
              💬 WhatsApp
            </button>
          </div>
        );

      case 10:
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
              >
                {event.type}
              </button>
            ))}
          </div>
        );

      case 11:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => handlePackageSelect(pkg.name)}
                className="p-6 bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-yellow-500 hover:border-yellow-400 rounded-xl hover:bg-gradient-to-br hover:from-yellow-700 hover:to-yellow-800 transition text-left transform hover:scale-105 shadow-lg"
              >
                <div className="text-3xl mb-2">{pkg.icon}</div>
                <div className="font-bold text-lg text-white">{pkg.name}</div>
                <div className="text-yellow-300 font-semibold mt-2">ETB {pkg.price.toLocaleString()}</div>
              </button>
            ))}
          </div>
        );

      case 12:
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {COUNTRIES.map((country) => (
              <button
                key={country}
                onClick={() => handleNext(country)}
                className="p-3 bg-gradient-to-br from-slate-700 to-slate-800 border border-blue-500 hover:border-blue-400 rounded-lg hover:bg-gradient-to-br hover:from-blue-700 hover:to-blue-800 transition text-sm font-semibold text-white"
              >
                {country}
              </button>
            ))}
          </div>
        );

      case 17:
        return (
          <div className="w-full max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-500 rounded-xl p-6 space-y-4 shadow-2xl">
            <div className="bg-slate-900 p-4 rounded-lg text-white text-sm whitespace-pre-line mb-4 border-l-4 border-yellow-500">
              {getBilingualText("noticeBody")}
            </div>

            {!showTerms && (
              <button
                onClick={() => setShowTerms(true)}
                className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-yellow-400 transition font-semibold"
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
                >
                  {getBilingualText("proceedBooking")}
                </button>
              </>
            )}
          </div>
        );

      case 18:
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
                <div className="text-white font-bold text-sm">{bookingData.email}</div>
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
              <div><strong className="text-yellow-400">Residence:</strong> {bookingData.residency}</div>
              <div><strong className="text-yellow-400">Phone:</strong> {bookingData.phoneNumber}</div>
              <div><strong className="text-yellow-400">Event Type:</strong> {bookingData.eventType}</div>
              <div><strong className="text-yellow-400">Event Date:</strong> {bookingData.eventDate} at {bookingData.eventTime}</div>
              <div><strong className="text-yellow-400">Location:</strong> {bookingData.eventCity}, {bookingData.eventCountry}</div>
              <div><strong className="text-yellow-400">Venue:</strong> {bookingData.eventLocation}</div>
            </div>

            {bookingRefNum && (
              <div className="bg-slate-900 p-4 rounded-lg border-2 border-yellow-500 text-center">
                <div className="text-yellow-400 font-bold mb-3">📱 Booking QR Code</div>
                <div className="flex justify-center">
                  {qrCode ? (
                    <img
                      id="bookingQRCode"
                      src={qrCode}
                      alt="Booking QR Code"
                      className="w-48 h-48 border-2 border-yellow-500 rounded-lg p-2 bg-white"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-slate-700 rounded-lg flex items-center justify-center text-white">Generating QR Code...</div>
                  )}
                </div>
                <div className="text-xs text-gray-300 mt-3">Reference: {bookingRefNum}</div>
                <div className="text-xs text-gray-400 mt-1">Scan to share your booking</div>

                {qrCode && (
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = qrCode;
                      link.download = `ShimeEvents_QRCode_${bookingRefNum}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition transform hover:scale-105 text-sm"
                  >
                    ⬇️ Download QR Code
                  </button>
                )}
              </div>
            )}

            <button
              onClick={generatePDF}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition text-lg mb-2 transform hover:scale-105"
            >
              {getBilingualText("downloadPdf")}
            </button>

            <button
              onClick={() => window.open("https://wa.me/251912345678", "_blank")}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition transform hover:scale-105"
            >
              {getBilingualText("contactUs")}
            </button>

            <div className="bg-slate-900 p-4 rounded-lg text-white text-xs whitespace-pre-line border-l-4 border-yellow-500">
              {getBilingualText("sendInstructions")}
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full max-w-md">
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
            />
            {error && <div className="text-red-400 text-sm mt-2 font-semibold">{error}</div>}
            <button
              onClick={() => {
                if (inputValue.trim()) {
                  handleNext(inputValue);
                  setInputValue("");
                }
              }}
              className="mt-3 w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition text-lg transform hover:scale-105 shadow-lg"
            >
              {language === "en" ? "Continue" : "ቀጥል"}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.05) 0%, transparent 50%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        * { font-family: 'Lato', sans-serif; }
        .brand-font { font-family: 'Playfair Display', serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-in; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.6s ease-in; }
      `}</style>

      <header className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 border-b-2 border-yellow-500 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-6 animate-slideUp">
            <h1 className="brand-font text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">Shime Events</h1>
            <p className="text-white text-sm opacity-90 tracking-wide">Professional Event Planning & Coordination</p>
          </div>

          {step > 0 && step < 18 && (
            <div className="space-y-2 animate-fadeIn">
              <div className="flex justify-between items-center text-xs text-yellow-400 mb-2 font-semibold">
                <span>{t("stepOf")} {step}/18</span>
                <span>{Math.round(getProgressPercentage())}%</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden border border-yellow-500 border-opacity-30">
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
        <div className="space-y-4 mb-8 max-h-[60vh] overflow-y-auto pr-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`animate-fadeIn flex ${msg.type === "agent" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-md px-4 py-3 rounded-xl ${
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
      </main>
    </div>
  );
}
