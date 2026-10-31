# 🏏 [Bride] & [Groom]: Turf Day — Pre-Wedding Invitation & RSVP

A high-performance, mobile-first invitation and RSVP website designed for informal pre-wedding turf events (cricket face-off, tug-of-war, custom jersey handover, and dinner under the floodlights). Engineered to look stunning and load ultra-fast when shared via WhatsApp.

---

## ✨ Features

- **Mobile-First & WhatsApp Ready:** Built for 375px mobile viewports with responsive scaling, fast load times, and custom Open Graph preview tags (shows title, couple photo, and teaser text on WhatsApp/iMessage).
- **One Config to Rule Everything (`src/config.js`):** Change bride & groom names, nicknames, event dates, turf venue, Google Maps link, timeline, photo gallery captions, team colors, and jersey size chart all in a single file.
- **Visual Evening Itinerary & Timeline:** Step-by-step match schedule with cricket and celebration motifs. Includes a hidden, easy-to-enable **"Surprise segment"** slot (`config.surpriseSegment.enabled: true`).
- **Live Squad Face-Off Banner:** Real-time tug-of-war scoreboard showing how many guests have drafted into **Team Bride** vs **Team Groom**.
- **Interactive Multi-Step RSVP Form (Google Forms style):**
  1. Full Name (required)
  2. Team Selection (large interactive squad cards with team colors and badges)
  3. Preferred Date (Jan 28 or Jan 29 toggle cards)
  4. "Jersey available. Do you need one?" (Yes / No toggle)
  5. Jersey Size Selector (XS, S, M, L, XL, XXL, 3XL) with a **"View Size Chart"** modal. Auto-hidden if guest selects "No".
  - Duplicate prevention guard (guests can re-submit to update their RSVP choices without creating duplicate entries).
  - Double-submit protection & clear validation error states.
- **Celebratory Confirmation Screen:**
  - Full-screen confetti cannon animation.
  - Digital personalized **"Turf Match Ticket / Pass"** with player name, squad badge, match date, and jersey size.
  - One-click **"Add to Calendar"** (.ics file download & Google Calendar link).
  - **"Share with Friends"** WhatsApp button with pre-filled match invite text.
- **Protected Organizer Admin Portal (`/admin`):**
  - Secured by passcode via `VITE_ADMIN_PASSCODE` (default: `turf2026`).
  - Real-time guest count cards: Total Guests, Team Bride vs Groom ratio, Date attendance breakdown.
  - **Jersey Tally Matrix:** Size-by-size breakdown (XS through 3XL) for placing custom vendor manufacturing orders instantly.
  - Search by player name & filter by Team, Date, or Jersey status.
  - One-click **"Export CSV"** button.
- **Dual-Mode Database Architecture:**
  - Connects to **Firebase Firestore** (`rsvps` collection) in real-time when `.env` keys are provided.
  - Automatically falls back to a real-time synchronized local store pre-seeded with sample guests for testing when Firebase credentials are not yet configured.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser (switch to Mobile Device Mode in DevTools at 375px).

### 3. Access Admin Dashboard
Navigate to [http://localhost:5173/#admin](http://localhost:5173/#admin) or click the shield icon in the footer/navigation.
- Default Passcode: `turf2026`

---

## 🎨 How to Customize All Personal Content

Open [`src/config.js`](file:///src/config.js). Every piece of text is documented with comments:

### 1. Couple Names & Nicknames
```javascript
couple: {
  brideName: "Ananya",
  groomName: "Rohan",
  brideNickname: "The Spin Queen",
  groomNickname: "The Power Hitter",
  hashtag: "#AnanyaBowledRohan",
  heroSubtitle: "A relaxed, fun-filled pre-wedding cricket face-off...",
  heroImage: "https://... or /photos/hero.jpg",
}
```

### 2. Event Dates & Venue
```javascript
dates: [
  { id: "2026-01-28", shortDate: "Jan 28", fullDate: "Wednesday, Jan 28, 2026", time: "5:00 PM – 8:00 PM" },
  { id: "2026-01-29", shortDate: "Jan 29", fullDate: "Thursday, Jan 29, 2026", time: "5:00 PM – 8:00 PM" },
],
venue: {
  name: "Kick-Off Arena & Cricket Turf",
  address: "Off Linking Road, Bandra West, Mumbai 400050",
  googleMapsUrl: "https://maps.google.com/?q=...",
}
```

### 3. Activating the Surprise Segment
Under `src/config.js`, set `enabled: true`:
```javascript
surpriseSegment: {
  enabled: true, // Flip to true to show in the timeline!
  time: "7:00 PM",
  title: "Surprise Sangeet Teaser & Dance Battle 💃🕺",
  description: "An impromptu flashmob & dance face-off before cake cutting!",
}
```

### 4. Customizing Jersey Sizes & Measurements
Edit `jerseySizeChart` in `src/config.js`:
```javascript
jerseySizeChart: [
  { size: "XS", chest: 86, length: 64, shoulder: 40 },
  { size: "S", chest: 91, length: 66, shoulder: 42 },
  ...
]
```

### 5. Adding Couple Photos
1. Drop image files into `/public/photos/` (e.g. `hero.jpg`, `story1.jpg`, `story2.jpg`).
2. In `src/config.js`, point the image paths to `/photos/hero.jpg` or use web URLs.

---

## 🔐 Connecting Firebase Firestore

To store all RSVPs in a live Google Cloud Firestore database:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Create a project**.
2. Under **Build**, select **Firestore Database** and click **Create database** (Start in **Production mode** or **Test mode**).
3. In Project Settings (gear icon) > **General**, scroll to "Your apps" and add a **Web app** (`</>`).
4. Copy the Firebase config object.
5. In your project root, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
6. Fill in the values:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:...
   VITE_ADMIN_PASSCODE=your_secret_passcode
   ```
7. Apply Firestore Security Rules:
   In the Firebase Console under **Firestore Database > Rules**, paste the rules from [`firestore.rules`](file:///firestore.rules) and click **Publish**.

Now every RSVP is saved in real time to the `rsvps` collection in Firestore!

---

## 🚢 Deployment

### Option A: Deploy to Vercel (Recommended)
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **Add New > Project**.
3. Import this repository.
4. Under **Environment Variables**, add the variables from your `.env` (`VITE_ADMIN_PASSCODE`, `VITE_FIREBASE_...`).
5. Click **Deploy**.

### Option B: Deploy to Firebase Hosting
1. Install the Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in:
   ```bash
   firebase login
   ```
3. Initialize hosting (choose existing project and specify `dist` as public directory):
   ```bash
   firebase init hosting
   ```
4. Build and deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## 📱 Testing & Quality Assurance
- **Tested on 375px mobile viewport** (iPhone SE, iPhone 12/13/14, Pixel 7).
- Zero layout shift with responsive typography and accessible color contrast.
- Confetti celebration runs smoothly with hardware acceleration.
