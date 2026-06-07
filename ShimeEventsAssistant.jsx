import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";

const translations = {
  en: {
    welcome: "✨ Welcome to Shime Events & Planning ✨\nYour dream event starts here. We are delighted to have you with us today.",
    selectLanguage: "Please choose your preferred language:",
    askNationality: "What is your nationality?",
    askPhone: "Please enter your phone number (e.g. +251911234567):",
    invalidPhone: "❌ Invalid phone number. Please try again.",
    askIdType: "Please enter your ID or Passport number:",
    invalidId: "❌ Invalid ID/Passport. Please try again.",
    askPlan: "Please choose your event plan:",
    askFullName: "Please enter your full name:",
    askPassword: "Create a 6-digit PIN or enter your ID number for verification:",
    askPhoneContact: "Please enter your contact phone number:",
    askContactMethod: "How would you prefer to be contacted?",
    askEventType: "What type of event are you planning?",
    askDate: "Please enter the date of your event:",
    dateBooked: "⚠️ That date is already booked. Please choose a different date.",
    askTime: "Please enter the preferred time of your event:",
    timeBooked: "⚠️ That date/time is already booked. Please choose a different time.",
    askCountry: "In which country will the event take place?",
    askCity: "In which city will the event take place?",
    askLocation: "Please provide the specific venue or location address:",
    noticeTitle: "💳 Payment & Terms Notice",
    noticeBody: "To confirm your booking, please pay the deposit via:\n\n🏦 CBE WALLET\nAccount: 1000XXXXXXXX\nName: Shime Events & Planning\n\nDeposit by Plan:\n• Essential  –  ETB 5,000\n• Standard   –  ETB 10,000\n• Premium    –  ETB 20,000\n• Elite      –  ETB 40,000\n\nBy clicking 'I Accept', you agree to our Terms & Conditions.",
    termsTitle: "TERMS & CONDITIONS – SHIME EVENTS & PLANNING",
    termsText: `1. A non-refundable deposit is required to secure your booking.
2. Full payment is due 14 days before the event.
3. Cancellations within 7 days of the event forfeit 50% of total payment.
4. Shime Events & Planning reserves the right to substitute vendors of equal quality.
5. The client is responsible for accurate information provided during booking.
6. Any changes to date, venue, or guest count must be requested in writing.
7. Force majeure clauses apply for events outside our control.
8. Disputes are subject to Ethiopian jurisdiction.

By signing and submitting this form, you agree to all terms above.`,
    acceptTerms: "✅ I Accept the Terms & Conditions",
    shareWhatsapp: "📲 Share via WhatsApp",
    viewBooking: "📋 View My Full Booking",
    downloadPdf: "⬇️ Download Booking PDF",
    sendInstructions: "Please send:\n1. Proof of payment (screenshot/PDF)\n2. Signed Terms & Conditions (downloaded PDF)\n\nSend to:\n📱 WhatsApp: +251 91 234 5678\n✉️ Telegram: @ShimeEvents",
    bookingConfirmed: "✨ Your booking is confirmed!",
    essentialPlan: "Essential",
    standardPlan: "Standard",
    premiumPlan: "Premium",
    elitePlan: "Elite",
    termsAccepted: "✅ You have accepted our Terms & Conditions.",
    proceedBooking: "Proceed to Booking Summary",
    contactUs: "📲 Contact Us on WhatsApp",
  },
  am: {
    welcome: "✨ በ Shime Events & Planning ደህና መጡ ✨\nየእርስዎ ህልም ያለው イベント እዚህ ይጀምራል። ዛሬ ከእርስዎ ጋር ሊሆን በኩራት ነን።",
    selectLanguage: "እባክዎን ተመራጭ ቋንቋዎን ይምረጡ:",
    askNationality: "ተዋለድነትዎ ምንድን ነው?",
    askPhone: "እባክዎን ስልክ ቁጥርዎን ያስገቡ (ለምሳሌ +251911234567):",
    invalidPhone: "❌ ተገቢ ያልሆነ ስልክ ቁጥር። እንደገና ይሞክሩ።",
    askIdType: "እባክዎን ID ወይም ፓስፖርት ቁጥርዎን ያስገቡ:",
    invalidId: "❌ ተገቢ ያልሆነ ID/ፓስፖርት። እንደገና ይሞክሩ።",
    askPlan: "እባክዎን ለአደራ ዓይነትዎ ሚና ይምረጡ:",
    askFullName: "እባክዎን ሙሉ ስሙን ያስገቡ:",
    askPassword: "6-ዲጂት ፒን ይፍጠሩ ወይም ID ቁጥርዎን ያስገቡ:",
    askPhoneContact: "እባክዎን የእርስዎ ኮንታክት ስልክ ቁጥር ያስገቡ:",
    askContactMethod: "እንዴት ለአንተ 連絡 ማድረግ ትመርጥ?",
    askEventType: "ምን ዓይነት ইভেન্ট ሳይሬክ ነው?",
    askDate: "እባክዎን ለስለት ታሪክ ያስገቡ:",
    dateBooked: "⚠️ ይህ ቀን ተያዘ። እሌ ሰውነት ይምረጡ።",
    askTime: "እባክዎን የተመረጠውን ሰዓት ያስገቡ:",
    timeBooked: "⚠️ ይህ ቀን/ሰዓት ተያዘ። ሌላ ሰዓት ይምረጡ።",
    askCountry: "ስልትዋ በ የት ሀገር ይሆናል?",
    askCity: "ስልትዋ በ የት ከተማ ይሆናል?",
    askLocation: "እባክዎን ለውጤቱ ሙሉ አድራሻ ያስገቡ:",
    noticeTitle: "💳 ክፍያ ወደ ውል ማስታወሻ",
    noticeBody: "ውርሱን ለማረጋገጥ, እባክዎን ክፍያ በሚከተለው መንገድ ያደርጉ:\n\n🏦 CBE WALLET\nHesaab: 1000XXXXXXXX\nSemie: Shime Events & Planning\n\nክፍያ በ ሚና:\n• Essential  –  ብር 5,000\n• Standard   –  ብር 10,000\n• Premium    –  ብር 20,000\n• Elite      –  ብር 40,000\n\nበ 'ተቀብያለሁ' ጠቅ, ከኛ ውል ስምምነት ተስማምተዋል.",
    termsTitle: "ውል ስምምነት – SHIME EVENTS & PLANNING",
    termsText: `1. ውርሱን ለማረጋገጥ ጊዜ-ማይወስድ ክፍያ ያስፈልጋል።
2. ሙሉ ክፍያ ከአደራ 14 ቀን በፊት ይከሰታል።
3. በአደራ ውስጥ 7 ቀን ውስጥ ሥራ ማስቋረጥ 50% ር ይጠፋል።
4. Shime Events & Planning ተመሳሳይ ጥራት ያላቸውን ነባሪዎችን መለዋወጥ ይችላል።
5. ዓ/ቁ ሙሉ እና ትክክለኛ መረጃ ተጠያቂ ነው።
6. ወደ ቀን, ሙሉ, ወይም ስብሰባ ቁጥር ለውጥ በጽሁፍ መጠየቅ አስፈላጊ ነው።
7. ታናናሽ ሁኔታዎች ከእኛ ሊወጡ የሚችሉ ከሆኑ ተፈጥሮ ሊተገበር ይችላል።
8. ክርክር በኢትዮጵያ ሕግ ይመገባል።

ይህን ሞዱ በመፈረም, ከሁሉም ሙሉ ውሎች ጋር ተስማምተዋል።`,
    acceptTerms: "✅ ውሎችን ተቀብያለሁ",
    shareWhatsapp: "📲 በ WhatsApp ላክ",
    viewBooking: "📋 ሙሉ ውርሱን ይመልከቱ",
    downloadPdf: "⬇️ PDF ድቅድቅ",
    sendInstructions: "እባክዎን ይላኩ:\n1. ክፍያ ማስረጃ (ታሪክ/PDF)\n2. የተፈረመ ውል (PDF)\n\nልኩ:\n📱 WhatsApp: +251 91 234 5678\n✉️ Telegram: @ShimeEvents",
    bookingConfirmed: "✨ ውርስዎ ተረጋግጧል!",
    essentialPlan: "Essential",
    standardPlan: "Standard",
    premiumPlan: "Premium",
    elitePlan: "Elite",
    termsAccepted: "✅ ውሎችን ተቀብያለሁ።",
    proceedBooking: "ወደ ውርስ ማጠቃለያ ይቀጥሉ",
    contactUs: "📲 በ WhatsApp ገንዘብ",
  }
};

const BOOKED_SLOTS = [
  { date: "2025-12-25", time: null },
  { date: "2026-01-01", time: "14:00" },
  { date: "2026-02-14", time: null },
  { date: "2026-06-15", time: "10:00" },
  { date: "2026-07-04", time: null },
];

const DEPOSIT_AMOUNTS = {
  "Essential": 5000,
  "Standard": 10000,
  "Premium": 20000,
  "Elite": 40000,
};

export default function ShimeAssistant() {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState("en");
  const [messages, setMessages] = useState([]);
  const [bookingData, setBookingData] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const chatEndRef = useRef(null);

  const t = (key) => translations[language][key] || translations.en[key];

  const addAgentMessage = (text) => {
    setMessages((prev) => [...prev, { type: "agent", text }]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { type: "user", text }]);
  };

  const validatePhone = (phone) => /^\+[0-9]{9,14}$/.test(phone);
  const validateId = (id) => /^[A-Z]{0,2}[0-9]{6,12}$/i.test(id);
  const validateName = (name) => name.trim().split(" ").length >= 2 && name.length >= 5;

  const isDateBooked = (date, time = null) => {
    return BOOKED_SLOTS.some(slot => slot.date === date && (slot.time === null || slot.time === time));
  };

  const isDateInFuture = (date) => {
    return new Date(date) > new Date();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const goldColor = [201, 168, 76];
    const darkColor = [11, 17, 32];
    const textColor = [250, 247, 240];

    // Page 1 - Cover
    doc.setFillColor(11, 17, 32);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setTextColor(...goldColor);
    doc.setFontSize(32);
    doc.text("SHIME EVENTS", pageWidth / 2, 60, { align: "center" });
    doc.setFontSize(28);
    doc.text("& PLANNING", pageWidth / 2, 85, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(...textColor);
    doc.text("Where Dreams Become Celebrations", pageWidth / 2, 110, { align: "center" });

    doc.setTextColor(...goldColor);
    doc.setFontSize(10);
    const refNum = `SE-${Date.now()}`;
    doc.text(`Booking Reference: ${refNum}`, pageWidth / 2, 140, { align: "center" });

    const today = new Date().toLocaleDateString();
    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    doc.text(`Date of Booking: ${today}`, pageWidth / 2, 150, { align: "center" });

    // Page 2 - Details
    doc.addPage();
    doc.setFillColor(11, 17, 32);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setTextColor(...goldColor);
    doc.setFontSize(14);
    doc.text("CLIENT INFORMATION", 20, 20);
    doc.setLineWidth(0.5);
    doc.setDrawColor(...goldColor);
    doc.line(20, 22, pageWidth - 20, 22);

    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    let yPos = 32;
    const details = [
      [`Full Name: ${bookingData.fullName || ""}`, 0],
      [`Nationality: ${bookingData.nationality || ""}`, 0],
      [`Phone: ${bookingData.phoneNumber || ""}`, 0],
      [`Contact Phone: ${bookingData.contactPhone || ""}`, 0],
      [`ID/Passport: ${bookingData.idNumber || ""}`, 0],
      [`Preferred Contact: ${bookingData.contactMethod || ""}`, 0],
    ];

    details.forEach(([detail]) => {
      doc.text(detail, 20, yPos);
      yPos += 8;
    });

    yPos += 5;
    doc.setTextColor(...goldColor);
    doc.setFontSize(14);
    doc.text("EVENT DETAILS", 20, yPos);
    yPos += 2;
    doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);
    yPos += 10;

    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    const eventDetails = [
      [`Event Type: ${bookingData.eventType || ""}`, 0],
      [`Selected Plan: ${bookingData.plan || ""}`, 0],
      [`Date: ${bookingData.eventDate || ""}`, 0],
      [`Time: ${bookingData.eventTime || ""}`, 0],
      [`Country: ${bookingData.eventCountry || ""}`, 0],
      [`City: ${bookingData.eventCity || ""}`, 0],
      [`Venue/Location: ${bookingData.eventLocation || ""}`, 0],
    ];

    eventDetails.forEach(([detail]) => {
      doc.text(detail, 20, yPos);
      yPos += 8;
    });

    yPos += 5;
    doc.setTextColor(...goldColor);
    doc.setFontSize(14);
    doc.text("PAYMENT DETAILS", 20, yPos);
    yPos += 2;
    doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);
    yPos += 10;

    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    const deposit = DEPOSIT_AMOUNTS[bookingData.plan] || 0;
    doc.text(`Deposit Amount: ETB ${deposit.toLocaleString()}`, 20, yPos);
    yPos += 8;
    doc.text("Payment Method: CBE WALLET", 20, yPos);
    yPos += 8;
    doc.text("Account: 1000XXXXXXXX", 20, yPos);
    yPos += 8;
    doc.text(`Reference: ${bookingData.fullName || ""}`, 20, yPos);

    // Page 3 - Terms
    doc.addPage();
    doc.setFillColor(11, 17, 32);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setTextColor(...goldColor);
    doc.setFontSize(12);
    doc.text("TERMS & CONDITIONS", 20, 20);
    doc.line(20, 22, pageWidth - 20, 22);

    doc.setTextColor(...textColor);
    doc.setFontSize(8);
    const termsLines = doc.splitTextToSize(t("termsText"), pageWidth - 40);
    let termsY = 30;
    termsLines.forEach((line) => {
      if (termsY > 270) {
        doc.addPage();
        doc.setFillColor(11, 17, 32);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
        termsY = 20;
      }
      doc.text(line, 20, termsY);
      termsY += 4;
    });

    // Page 4 - Signature
    doc.addPage();
    doc.setFillColor(11, 17, 32);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setTextColor(...goldColor);
    doc.setFontSize(12);
    doc.text("AGREEMENT & SIGNATURE", 20, 20);
    doc.line(20, 22, pageWidth - 20, 22);

    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    const agreementText = `By signing below, I ${bookingData.fullName || "[Name]"} confirm that I have read, understood, and agreed to all Terms & Conditions of Shime Events & Planning. I also confirm that all information provided is accurate.`;
    const agreementLines = doc.splitTextToSize(agreementText, pageWidth - 40);
    let sigY = 35;
    agreementLines.forEach((line) => {
      doc.text(line, 20, sigY);
      sigY += 6;
    });

    sigY += 20;
    doc.text("Client Signature: _________________________", 20, sigY);
    sigY += 10;
    doc.text("Full Name: _________________________", 20, sigY);
    sigY += 10;
    doc.text("Date: _________________________", 20, sigY);

    sigY += 20;
    doc.setTextColor(...goldColor);
    doc.setFontSize(9);
    doc.text("Please send this signed document along with proof of payment to:", 20, sigY);
    sigY += 8;
    doc.setTextColor(...textColor);
    doc.setFontSize(8);
    doc.text("📱 WhatsApp: +251 91 234 5678", 20, sigY);
    sigY += 6;
    doc.text("✉️ Telegram: @ShimeEvents", 20, sigY);

    doc.save(`ShimeEvents_Booking_${(bookingData.fullName || "Client").replace(/ /g, "_")}.pdf`);
  };

  const handleNext = (value) => {
    let isValid = true;
    let errorMsg = "";

    switch (step) {
      case 0:
        addUserMessage(value);
        setStep(1);
        addAgentMessage(t("selectLanguage"));
        return;

      case 1:
        setLanguage(value);
        addUserMessage(value === "en" ? "English" : "አማርኛ");
        setStep(2);
        addAgentMessage(translations[value]["askNationality"]);
        return;

      case 2:
        if (!value || value.length < 3) {
          isValid = false;
          errorMsg = "Nationality must be at least 3 characters";
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, nationality: value });
          setStep(3);
          addAgentMessage(t("askPhone"));
        } else {
          setError(errorMsg);
        }
        return;

      case 3:
        if (!validatePhone(value)) {
          isValid = false;
          errorMsg = t("invalidPhone");
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, phoneNumber: value });
          setStep(4);
          addAgentMessage(t("askIdType"));
        } else {
          setError(errorMsg);
        }
        return;

      case 4:
        if (!validateId(value)) {
          isValid = false;
          errorMsg = t("invalidId");
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, idNumber: value });
          setStep(5);
          addAgentMessage(t("askPlan"));
        } else {
          setError(errorMsg);
        }
        return;

      case 5:
        addUserMessage(value);
        setBookingData({ ...bookingData, plan: value });
        setStep(6);
        addAgentMessage(t("askFullName"));
        return;

      case 6:
        if (!validateName(value)) {
          isValid = false;
          errorMsg = "Please enter a full name (first and last name, min 5 chars)";
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, fullName: value });
          setStep(7);
          addAgentMessage(t("askPassword"));
        } else {
          setError(errorMsg);
        }
        return;

      case 7:
        if (value.length < 6) {
          isValid = false;
          errorMsg = "PIN must be at least 6 characters";
        }
        if (isValid) {
          addUserMessage("••••••");
          setBookingData({ ...bookingData, verificationPin: value });
          setStep(8);
          addAgentMessage(t("askPhoneContact"));
        } else {
          setError(errorMsg);
        }
        return;

      case 8:
        if (!validatePhone(value)) {
          isValid = false;
          errorMsg = t("invalidPhone");
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, contactPhone: value });
          setStep(9);
          addAgentMessage(t("askContactMethod"));
        } else {
          setError(errorMsg);
        }
        return;

      case 9:
        addUserMessage(value);
        setBookingData({ ...bookingData, contactMethod: value });
        setStep(10);
        addAgentMessage(t("askEventType"));
        return;

      case 10:
        addUserMessage(value);
        setBookingData({ ...bookingData, eventType: value });
        if (value === "Custom Event") {
          addAgentMessage("Please describe your event:");
          // Keep step at 10 for custom description
        } else {
          setStep(11);
          addAgentMessage(t("askDate"));
        }
        return;

      case 11:
        if (!isDateInFuture(value)) {
          isValid = false;
          errorMsg = "Please select a future date";
        } else if (isDateBooked(value)) {
          isValid = false;
          errorMsg = t("dateBooked");
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, eventDate: value });
          setStep(12);
          addAgentMessage(t("askTime"));
        } else {
          setError(errorMsg);
        }
        return;

      case 12:
        if (isDateBooked(bookingData.eventDate, value)) {
          isValid = false;
          errorMsg = t("timeBooked");
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, eventTime: value });
          setStep(13);
          addAgentMessage(t("askCountry"));
        } else {
          setError(errorMsg);
        }
        return;

      case 13:
        if (!value || value.length < 2) {
          isValid = false;
          errorMsg = "Country must be at least 2 characters";
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, eventCountry: value });
          setStep(14);
          addAgentMessage(t("askCity"));
        } else {
          setError(errorMsg);
        }
        return;

      case 14:
        if (!value || value.length < 2) {
          isValid = false;
          errorMsg = "City must be at least 2 characters";
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, eventCity: value });
          setStep(15);
          addAgentMessage(t("askLocation"));
        } else {
          setError(errorMsg);
        }
        return;

      case 15:
        if (!value || value.length < 3) {
          isValid = false;
          errorMsg = "Location must be at least 3 characters";
        }
        if (isValid) {
          addUserMessage(value);
          setBookingData({ ...bookingData, eventLocation: value });
          setStep(16);
          addAgentMessage(t("noticeTitle"));
        } else {
          setError(errorMsg);
        }
        return;

      case 16:
        setStep(17);
        addAgentMessage(t("bookingConfirmed"));
        return;

      default:
        return;
    }

    setInputValue("");
  };

  const handlePlanSelect = (planName) => {
    const icon = {
      "Essential": "🎉",
      "Standard": "⭐",
      "Premium": "💎",
      "Elite": "👑",
    }[planName];
    addUserMessage(`${icon} ${planName}`);
    setBookingData({ ...bookingData, plan: planName });
    setStep(6);
    addAgentMessage(t("askFullName"));
  };

  const handleEventType = (type) => {
    addUserMessage(type);
    setBookingData({ ...bookingData, eventType: type });
    setStep(11);
    addAgentMessage(t("askDate"));
  };

  const handleContactMethod = (method) => {
    addUserMessage(method);
    setBookingData({ ...bookingData, contactMethod: method });
    setStep(10);
    addAgentMessage(t("askEventType"));
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    addAgentMessage(t("termsAccepted"));
  };

  useEffect(() => {
    if (step === 0) {
      addAgentMessage(t("welcome"));
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex gap-3">
            <button
              onClick={() => handleNext("Hello! Let's begin")}
              className="px-4 py-2 bg-[#C9A84C] text-[#0B1120] rounded-full hover:brightness-110 transition"
            >
              👋 Hello! Let's begin
            </button>
            <button
              onClick={() => handleNext("Hi, I'm ready")}
              className="px-4 py-2 bg-[#C9A84C] text-[#0B1120] rounded-full hover:brightness-110 transition"
            >
              🚀 Hi, I'm ready
            </button>
          </div>
        );

      case 1:
        return (
          <div className="flex gap-3">
            <button
              onClick={() => handleNext("en")}
              className="px-4 py-2 bg-[#C9A84C] text-[#0B1120] rounded-full hover:brightness-110 transition"
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => handleNext("am")}
              className="px-4 py-2 bg-[#C9A84C] text-[#0B1120] rounded-full hover:brightness-110 transition"
            >
              🇪🇹 አማርኛ
            </button>
          </div>
        );

      case 5:
        return (
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Essential", icon: "🎉", desc: "Basic event setup" },
              { name: "Standard", icon: "⭐", desc: "Full coordination" },
              { name: "Premium", icon: "💎", desc: "Premium vendors" },
              { name: "Elite", icon: "👑", desc: "Luxury experience" },
            ].map((plan) => (
              <button
                key={plan.name}
                onClick={() => handlePlanSelect(plan.name)}
                className="p-3 bg-[#1a1f2e] border border-[#C9A84C] rounded-lg hover:bg-[#C9A84C] hover:text-[#0B1120] transition text-left"
              >
                <div className="text-xl">{plan.icon}</div>
                <div className="font-bold">{plan.name}</div>
                <div className="text-xs opacity-75">{plan.desc}</div>
              </button>
            ))}
          </div>
        );

      case 9:
        return (
          <div className="flex gap-3">
            <button
              onClick={() => handleContactMethod("Telegram")}
              className="px-4 py-2 bg-[#C9A84C] text-[#0B1120] rounded-full hover:brightness-110 transition"
            >
              💬 Telegram
            </button>
            <button
              onClick={() => handleContactMethod("WhatsApp")}
              className="px-4 py-2 bg-[#C9A84C] text-[#0B1120] rounded-full hover:brightness-110 transition"
            >
              💬 WhatsApp
            </button>
          </div>
        );

      case 10:
        return (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {[
              { type: "Wedding", icon: "💍" },
              { type: "Graduation", icon: "🎓" },
              { type: "Birthday", icon: "🎂" },
              { type: "Anniversary", icon: "💕" },
              { type: "Custom Event", icon: "✨" },
            ].map((event) => (
              <button
                key={event.type}
                onClick={() => handleEventType(event.type)}
                className="p-2 bg-[#1a1f2e] border border-[#C9A84C] rounded-lg hover:bg-[#C9A84C] hover:text-[#0B1120] transition text-center"
              >
                <div className="text-xl">{event.icon}</div>
                <div className="text-sm">{event.type}</div>
              </button>
            ))}
          </div>
        );

      case 16:
        return (
          <div className="w-full max-w-2xl bg-[#1a1f2e] border border-[#C9A84C] rounded-lg p-6 space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#C9A84C] mb-2">{t("noticeTitle")}</h2>
            </div>

            <div className="bg-[#0B1120] p-4 rounded text-[#FAF7F0] text-sm whitespace-pre-line mb-4">
              {t("noticeBody")}
            </div>

            {!showTerms && (
              <button
                onClick={() => setShowTerms(true)}
                className="w-full text-left px-4 py-2 bg-[#2a2f3e] hover:bg-[#3a3f4e] rounded text-[#C9A84C] transition"
              >
                📄 View Terms & Conditions
              </button>
            )}

            {showTerms && (
              <div className="bg-[#0B1120] p-4 rounded text-[#FAF7F0] text-xs max-h-64 overflow-y-auto mb-4">
                <h3 className="text-[#C9A84C] font-bold mb-2">{t("termsTitle")}</h3>
                <p className="whitespace-pre-line">{t("termsText")}</p>
              </div>
            )}

            {!termsAccepted ? (
              <button
                onClick={handleAcceptTerms}
                className="w-full px-4 py-3 bg-[#C9A84C] text-[#0B1120] rounded-lg font-bold hover:brightness-110 transition"
              >
                {t("acceptTerms")}
              </button>
            ) : (
              <>
                <div className="text-green-400 text-sm mb-4">{t("termsAccepted")}</div>
                <button
                  onClick={() => handleNext("")}
                  className="w-full px-4 py-3 bg-[#C9A84C] text-[#0B1120] rounded-lg font-bold hover:brightness-110 transition mb-2"
                >
                  {t("proceedBooking")}
                </button>
                <button
                  onClick={() => {
                    const whatsappMsg = `I am booking with Shime Events & Planning. My name is ${bookingData.fullName}. Event date: ${bookingData.eventDate}. Plan: ${bookingData.plan}.`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`, "_blank");
                  }}
                  className="w-full px-4 py-3 bg-[#25D366] text-white rounded-lg font-bold hover:brightness-110 transition"
                >
                  {t("shareWhatsapp")}
                </button>
              </>
            )}
          </div>
        );

      case 17:
        return (
          <div className="w-full max-w-2xl bg-[#1a1f2e] border border-[#C9A84C] rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-[#C9A84C] text-center mb-6">✨ {t("viewBooking")}</h2>

            <div className="bg-[#0B1120] p-4 rounded text-[#FAF7F0] text-sm space-y-2">
              <div><strong>Full Name:</strong> {bookingData.fullName}</div>
              <div><strong>Nationality:</strong> {bookingData.nationality}</div>
              <div><strong>Phone:</strong> {bookingData.phoneNumber}</div>
              <div><strong>ID/Passport:</strong> {bookingData.idNumber}</div>
              <div><strong>Contact Method:</strong> {bookingData.contactMethod}</div>

              <div className="border-t border-[#C9A84C] pt-3 mt-3">
                <div><strong>Event Type:</strong> {bookingData.eventType}</div>
                <div><strong>Plan:</strong> {bookingData.plan}</div>
                <div><strong>Date:</strong> {bookingData.eventDate}</div>
                <div><strong>Time:</strong> {bookingData.eventTime}</div>
                <div><strong>Country:</strong> {bookingData.eventCountry}</div>
                <div><strong>City:</strong> {bookingData.eventCity}</div>
                <div><strong>Venue:</strong> {bookingData.eventLocation}</div>
              </div>

              <div className="border-t border-[#C9A84C] pt-3 mt-3">
                <div><strong>Deposit:</strong> ETB {(DEPOSIT_AMOUNTS[bookingData.plan] || 0).toLocaleString()}</div>
                <div><strong>Payment Method:</strong> CBE WALLET</div>
                <div><strong>Account:</strong> 1000XXXXXXXX</div>
              </div>
            </div>

            <button
              onClick={generatePDF}
              className="w-full px-4 py-3 bg-[#C9A84C] text-[#0B1120] rounded-lg font-bold hover:brightness-110 transition"
            >
              {t("downloadPdf")}
            </button>

            <button
              onClick={() => {
                window.open("https://wa.me/251912345678", "_blank");
              }}
              className="w-full px-4 py-3 bg-[#25D366] text-white rounded-lg font-bold hover:brightness-110 transition"
            >
              {t("contactUs")}
            </button>

            <div className="bg-[#0B1120] p-4 rounded text-[#FAF7F0] text-xs whitespace-pre-line">
              {t("sendInstructions")}
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full">
            <input
              type={step === 7 ? "password" : step === 11 ? "date" : step === 12 ? "time" : "text"}
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
              placeholder={step === 11 ? "YYYY-MM-DD" : ""}
              className="w-full px-4 py-3 bg-[#FAF7F0] text-[#0B1120] rounded-full focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            />
            {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
            <button
              onClick={() => {
                if (inputValue.trim()) {
                  handleNext(inputValue);
                  setInputValue("");
                }
              }}
              className="mt-3 w-full px-4 py-2 bg-[#C9A84C] text-[#0B1120] rounded-full font-bold hover:brightness-110 transition"
            >
              Continue
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] font-['Lato']" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(201, 168, 76, 0.05) 0%, transparent 50%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');

        * {
          font-family: 'Lato', sans-serif;
        }

        .brand-font {
          font-family: 'Playfair Display', serif;
        }

        .fade-in {
          animation: fadeIn 0.8s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <header className="bg-gradient-to-b from-[#0B1120] to-[#0B1120] py-6 border-b border-[#C9A84C] border-opacity-20">
        <div className="max-w-4xl mx-auto px-4 text-center fade-in">
          <h1 className="brand-font text-4xl font-bold text-[#C9A84C] mb-2">Shime Events</h1>
          <p className="text-[#FAF7F0] text-sm opacity-75">Where Dreams Become Celebrations</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-16">
        <div className="space-y-4 mb-8">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`fade-in ${
                msg.type === "agent"
                  ? "flex justify-start"
                  : "flex justify-end"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
                  msg.type === "agent"
                    ? "bg-[#1a1f2e] border-l-4 border-[#C9A84C] text-[#FAF7F0]"
                    : "bg-[#C9A84C] text-[#0B1120]"
                } whitespace-pre-line text-sm`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {renderStep()}
        </div>

        <div ref={chatEndRef} />
      </main>
    </div>
  );
}
