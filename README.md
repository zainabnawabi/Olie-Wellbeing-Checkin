# Olie · Private Weekly Mind & Mood Check-In

An interactive, calm DASS-21 digital wellbeing check-in web application guided by **Olie**, paired with Firebase Firestore cloud persistence, a hidden authenticated Practitioner Portal, branded PDF summary export, and a standalone Python CustomTkinter desktop companion (`dass21_app.py`).

## Features

- **Patient Check-In Experience:** Guided step-by-step check-in with Olie, calming Web Audio soundscapes (Rain, Ocean Waves, Forest Breeze, or Quiet), mute/volume controls, guided breathing pause, and interactive kindness exercises.
- **Branded PDF Report (`Save My Summary`):** Generates a colorful, high-resolution PDF summary matching the app's visual palette using `jspdf` and HTML5 Canvas with clear, everyday language.
- **Hidden Practitioner Portal (`/#practitioner` or `/?practitioner=1`):** Completely absent from the patient interface and locked behind Firebase Authentication + Firestore Security Rules (`firestore.rules.example`). Lets the practitioner view live submissions and export a consolidated Excel (`.xlsx`) or `.csv` workbook containing all responses.
- **Desktop Companion (`dass21_app.py`):** Standalone Python CustomTkinter desktop application for offline practitioner workflows.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, `jspdf`
- **Backend & Auth:** Firebase Firestore + Firebase Authentication
- **Spreadsheets:** SheetJS (`xlsx`)
- **Desktop App (Optional):** Python 3, `customtkinter`, `pandas`, `openpyxl`

## Configuration (Environment Variables)

This repository intentionally stores **no keys, project IDs, database IDs, or personal emails** in source code.

1. Copy `.env.example` to `.env` for local runs (or add the same keys under **Environment Variables** when deploying a Static Site on Render):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_DATABASE_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_PRACTITIONER_EMAILS`
2. Deploy Firestore rules using `firestore.rules.example` as your template (replacing `practitioner@example.com` with your own verified practitioner email in Firebase Console).
3. In Firebase Console under **Authentication -> Settings -> Authorized domains**, add your hosting domain (such as `your-app.onrender.com`).

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Building for Production (Render Static Site)

- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

## License

Released under the [MIT License](LICENSE).
