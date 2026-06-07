# Shime Events & Planning - AI Booking Assistant

A luxury event planning booking application with bilingual support (English/Amharic), conversational AI chatbot, and PDF contract generation.

## Features

✨ **17-Step Booking Flow**
- Bilingual support (English & Amharic)
- Complete client information collection
- Event details capture
- Real-time date/time availability checking
- Terms & Conditions acceptance
- Automatic PDF booking contract generation

🎨 **Luxury Aesthetic**
- Navy & gold color scheme (#0B1120, #C9A84C)
- Responsive chat UI
- Smooth animations
- Professional typography (Playfair Display & Lato)

💳 **Payment Integration Ready**
- CBE Wallet payment details
- Deposit amounts by plan (Essential/Standard/Premium/Elite)
- WhatsApp integration for sharing bookings

📄 **PDF Generation**
- Multi-page booking contracts
- Cover page with booking reference
- Client & event details
- Terms & Conditions
- Signature page

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **jsPDF** - PDF generation
- **Vercel** - Deployment platform

## Installation

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to Vercel

### Option 1: Via GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Shime Events AI Assistant"
   git branch -M main
   git remote add origin https://github.com/yourusername/shime-events.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects it's a Vite project
   - Click "Deploy"

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For production deployment
vercel --prod
```

## Project Structure

```
shime/
├── index.html              # HTML entry point
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
├── postcss.config.js       # PostCSS config
├── vercel.json             # Vercel deployment config
├── .gitignore              # Git ignore rules
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Main component (ShimeAssistant)
    └── index.css           # Global styles & Tailwind imports
```

## Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Booking Flow (17 Steps)

0. **Welcome** - Greeting with action buttons
1. **Language** - English or Amharic selection
2. **Nationality** - Client nationality
3. **Phone** - Phone number validation
4. **ID** - ID/Passport validation
5. **Plan** - Event plan selection (Essential/Standard/Premium/Elite)
6. **Full Name** - Full name validation
7. **PIN** - Security PIN/password
8. **Contact Phone** - Primary contact number
9. **Contact Method** - Telegram or WhatsApp
10. **Event Type** - Wedding/Graduation/Birthday/Anniversary/Custom
11. **Event Date** - Date picker with availability check
12. **Event Time** - Time picker with slot validation
13. **Country** - Event country
14. **City** - Event city
15. **Location** - Venue/location address
16. **Terms & Payment** - Terms acceptance & payment notice
17. **Confirmation** - Booking summary & PDF download

## Booked Slots (Demo)

The following dates/times are hardcoded as unavailable for demo purposes:
- 2025-12-25 (full day)
- 2026-01-01 14:00 (specific time)
- 2026-02-14 (full day)
- 2026-06-15 10:00 (specific time)
- 2026-07-04 (full day)

## PDF Download

The PDF booking contract includes:
1. **Cover Page** - Company branding & booking reference
2. **Details Page** - Client & event information
3. **Terms Page** - Full terms & conditions
4. **Signature Page** - Space for client signature

## Environment Variables

Optional environment variables (see `.env.example`):
- `VITE_WHATSAPP_NUMBER` - WhatsApp contact number
- `VITE_TELEGRAM_HANDLE` - Telegram handle

## Payment Details

**CBE WALLET:**
- Account Number: 1000XXXXXXXX
- Account Name: Shime Events & Planning

**Deposit by Plan:**
- Essential: ETB 5,000
- Standard: ETB 10,000
- Premium: ETB 20,000
- Elite: ETB 40,000

## Browser Support

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Private project for Shime Events & Planning.
