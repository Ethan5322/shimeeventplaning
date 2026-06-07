import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export const generateCompanyQRPDF = async (qrCodeImage, language = "en") => {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "A4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Background color
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    // Gold border
    pdf.setDrawColor(234, 179, 8); // yellow-500
    pdf.setLineWidth(3);
    pdf.rect(5, 5, pageWidth - 10, pageHeight - 10);

    // Inner accent border
    pdf.setDrawColor(234, 179, 8);
    pdf.setLineWidth(1);
    pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);

    // Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(36);
    pdf.setTextColor(234, 179, 8); // yellow
    pdf.text("SHIME", pageWidth / 2, 30, { align: "center" });

    // Subtitle
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255); // white
    pdf.text("EVENTS & PLANNING", pageWidth / 2, 40, { align: "center" });

    // Decorative line
    pdf.setDrawColor(234, 179, 8);
    pdf.setLineWidth(0.5);
    pdf.line(40, 45, pageWidth - 40, 45);

    // Main heading
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(234, 179, 8);
    const title = language === "en"
      ? "SCAN TO BOOK YOUR EVENT"
      : "ዝግጅትዎን ለመዝገብ ስክ ያድርጉ";
    pdf.text(title, pageWidth / 2, 60, { align: "center" });

    // Subheading
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.setTextColor(200, 200, 200); // light gray
    const subtitle = language === "en"
      ? "Start Your Booking Journey with Shime Events & Planning"
      : "በ Shime Events & Planning ያ አካውንት መፍጠር ጀምሩ";
    pdf.text(subtitle, pageWidth / 2, 70, { align: "center" });

    // QR Code Section
    const qrSize = 80; // Size of QR code
    const qrX = (pageWidth - qrSize) / 2;
    const qrY = 85;

    // QR Code background (white box with border)
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(234, 179, 8);
    pdf.setLineWidth(2);
    pdf.rect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, "FD");

    // Add QR image
    if (qrCodeImage) {
      pdf.addImage(qrCodeImage, "PNG", qrX, qrY, qrSize, qrSize);
    }

    // "Scan Me" label below QR
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setFillColor(234, 179, 8);
    pdf.rect(15, qrY + qrSize + 10, pageWidth - 30, 12, "F");
    pdf.setTextColor(0, 0, 0);
    const scanLabel = language === "en"
      ? "📱 SCAN ME FOR SHIME EVENT PLANNING"
      : "📱 ለ SHIME ዝግጅት ስክ ያድርጉ";
    pdf.text(scanLabel, pageWidth / 2, qrY + qrSize + 16, {
      align: "center",
      maxWidth: pageWidth - 20,
    });

    // Features section
    const features = language === "en"
      ? [
          "✨ Professional Event Planning",
          "🎉 Experienced & Dedicated Team",
          "💎 Premium Packages Available",
          "🌍 Worldwide Event Services",
        ]
      : [
          "✨ ሙያዊ ዝግጅት",
          "🎉 ልምድ ያለበት ቡድን",
          "💎 ፕሪሚየም ፓኬጆች",
          "🌍 የዓለም ሙያ",
        ];

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(255, 255, 255);

    let featureY = qrY + qrSize + 40;
    features.forEach((feature) => {
      pdf.text(feature, 20, featureY);
      featureY += 8;
    });

    // Footer section
    const footerY = pageHeight - 35;

    // Divider line
    pdf.setDrawColor(234, 179, 8);
    pdf.setLineWidth(0.5);
    pdf.line(20, footerY - 10, pageWidth - 20, footerY - 10);

    // Contact info
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(200, 200, 200);

    const contact = language === "en"
      ? [
          "📞 WhatsApp: +251 91 234 5678",
          "✉️ Email: contact@shimeeventplaning.com",
          "📱 Telegram: @ShimeEvents",
        ]
      : [
          "📞 WhatsApp: +251 91 234 5678",
          "✉️ Email: contact@shimeeventplaning.com",
          "📱 Telegram: @ShimeEvents",
        ];

    let contactY = footerY;
    contact.forEach((line) => {
      pdf.text(line, pageWidth / 2, contactY, { align: "center" });
      contactY += 6;
    });

    // Copyright
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    const copyright = language === "en"
      ? "© 2024-2025 Shime Events & Planning. Making Celebrations Memorable."
      : "© 2024-2025 Shime Events & Planning. ዝግጅቶችን ታሪክ አይነት";
    pdf.text(copyright, pageWidth / 2, pageHeight - 8, {
      align: "center",
      maxWidth: pageWidth - 10,
    });

    return pdf;
  } catch (error) {
    console.error("Error generating company QR PDF:", error);
    throw error;
  }
};

// Generate and download company QR PDF
export const downloadCompanyQRPDF = async (qrCodeImage, language = "en") => {
  try {
    const pdf = await generateCompanyQRPDF(qrCodeImage, language);
    const fileName = language === "en"
      ? "Shime-Events-Booking-QR.pdf"
      : "Shime-Events-Booking-QR-am.pdf";
    pdf.save(fileName);
  } catch (error) {
    console.error("Error downloading PDF:", error);
    throw error;
  }
};

// Generate company QR code image
export const generateCompanyQRCode = async (url) => {
  try {
    const qrImage = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.95,
      margin: 1,
      width: 400,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return qrImage;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};
