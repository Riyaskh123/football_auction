# Football Auction — Match Day Auction Room

Two synced screens for a live football/team auction:

- **`/display`** — big animated screen for a projector/TV. Shows the current player,
  live bid, and every team's logo + remaining budget. No controls here.
- **`/control`** — the auctioneer's panel (phone/laptop). Picks the next player at
  random, records bids per team, and marks a player SOLD or UNSOLD.
- **`/register`** — public form for players to add themselves before the event
  (name, phone, position, jersey #, photo). Share this link freely.
- **`/admin/registrations`** — where the organizer reviews each registration,
  sets a base price, and approves it into the auction pool (or rejects it).
  Treat this link like `/control` — don't share it publicly.

Both screens read/write the same Firestore database, so anything the auctioneer
does on `/control` appears on `/display` within a second, on any device, on the
same network or over the internet.

---

## 1. Create your Firebase project (one-time, ~5 minutes)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and
   click **Add project**. Name it anything (e.g. `football-auction`). You can
   disable Google Analytics for this project, it's not needed.
2. Once created, click the **`</>` (Web) icon** on the project overview page to
   register a web app. Give it a nickname, you do **not** need Firebase Hosting
   at this step.
3. Firebase will show you a `firebaseConfig` object with keys like `apiKey`,
   `authDomain`, etc. Keep this tab open — you'll paste these into `.env`.
4. In the left sidebar, go to **Build → Firestore Database → Create database**.
   Start in **test mode** for now (see the security note below), pick the
   region closest to you.

### Copy your config into `.env`

```bash
cp .env.example .env
```

Open `.env` and fill in the six `VITE_FIREBASE_*` values from step 3.

### Firestore security rules (important before your real event)

Test mode allows anyone to read/write your database, which is fine while
building but not for the actual auction. Before going live, go to
**Firestore → Rules** and use something like:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null; // requires login to write
    }
  }
}
```

The simplest version for a one-day event run by a trusted operator is to just
leave read/write open (`allow read, write: if true;`) and instead **not share
the `/control` URL publicly** — only give it to the auctioneer's device.
Anyone with the link can act as the auctioneer, so treat that URL like a
password.

---

## 2. Install and run locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

This starts the app at `http://localhost:5173`. Open:

- `http://localhost:5173/control` on your laptop/phone — click
  **Load sample data** the first time to seed 6 sample teams and 24 sample
  players so you can try the flow immediately.
- `http://localhost:5173/display` on the projector-connected machine (or
  another tab).

To let a second physical device on the same Wi-Fi reach it, use your
computer's LAN IP instead of `localhost`, e.g. `http://192.168.1.20:5173/display`
(Vite prints this automatically — look for the "Network:" URL when you run
`npm run dev`).

---

## 3. Add your real teams and players

Sample data lives only in Firestore once seeded — the easiest way to load
your real roster is directly in the **Firebase Console → Firestore Database**:

- **`teams` collection** — one document per team:
  ```json
  {
    "name": "Desert Falcons",
    "shortName": "DFC",
    "logoUrl": "https://...",
    "budget": 10000,
    "spent": 0,
    "color": "1E3A2C"
  }
  ```
- **`players` collection** — one document per player:
  ```json
  {
    "name": "Mohammed Al Amri",
    "jerseyNo": 7,
    "position": "FWD",
    "basePrice": 150,
    "photoUrl": "https://...",
    "status": "available",
    "soldTo": null,
    "soldPrice": null
  }
  ```

Delete the sample docs first if you want a clean slate (select all → delete
in the console), or just overwrite them.

For a large roster, it's faster to write a small script with the
`firebase-admin` SDK and a CSV of your players — ask me and I can generate
that importer for you once you know your real data columns.

---

## 4. Player photos & team logos (image hosting)

You need public image URLs for `photoUrl` / `logoUrl`. Two easy free options:

**Option A — Firebase Storage** (same project, simplest):
1. Firebase Console → **Build → Storage → Get started**.
2. Upload each photo, click it, copy the **download URL**, paste into the
   matching Firestore field.

**Option B — Cloudinary** (used by the `/register` page, so players can upload
a photo straight from their phone):

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. Your **cloud name** is shown on the dashboard home page right after login
   → copy it into `VITE_CLOUDINARY_CLOUD_NAME`.
3. Go to **Settings (gear icon) → Upload → Upload presets → Add upload preset**.
4. Set **Signing Mode** to **Unsigned** (required — the browser uploads
   directly, with no server/API secret involved). Save, then copy the preset
   name into `VITE_CLOUDINARY_UPLOAD_PRESET`.

Without these two values set, `/register` still works but photo upload will
show an error — everything else (name, position, jersey #) still submits fine.

For team logos, pasting a URL straight into Firestore is still the fastest
path since there are only a handful of teams.

---

## 5. Deploy so the auctioneer and projector don't need your laptop running

Easiest free option — **Firebase Hosting**:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # choose your project, "dist" as the public dir, single-page app: yes
npm run build
firebase deploy
```

You'll get a URL like `https://football-auction.web.app`. Share
`.../display` with the projector machine and `.../control` with the
auctioneer only.

(Vercel or Netlify work identically — just point them at this repo with
build command `npm run build` and output directory `dist`.)

---

## 6. Registration → approval → auction flow

1. Share the `/register` link with players before the event. They fill in
   name, phone, position, optional jersey number, and optionally upload a
   photo (needs Cloudinary configured — see above). This writes a doc into
   the `registrations` collection with `status: "pending"` — it does **not**
   appear in the auction yet.
2. The organizer opens `/admin/registrations` (also linked from the
   `/control` header, with a badge showing how many are pending), sets a
   **base price** for each player, and clicks **Approve**. This creates the
   actual `players` doc the auction draws from, and marks the registration
   `approved` so it won't show up as pending again. **Reject** instead marks
   it `rejected` without creating a player.
3. From here the normal auction flow below takes over.

You can skip registration entirely and add players directly to Firestore
(section 3 above) if you'd rather not collect self-registrations.

## 7. How the auction flow works

1. Auctioneer opens `/control`, clicks **Call next player** → a random
   `available` player is picked and appears on both screens.
2. As teams bid, the auctioneer taps the team's card (or **+step** buttons /
   a manual amount) to record who's leading and at what price. A team is
   greyed out once a bid would exceed its remaining budget.
3. Auctioneer clicks **Mark SOLD** — the display shows a stamp + confetti
   animation with the winning team and price, the player is removed from the
   pool, and the team's remaining budget updates everywhere instantly.
   **Mark UNSOLD** if no team bids.
4. Click **Call next player** again to continue. **Reset bid** undoes a
   mis-tap on the current player without ending the round.

`Reset entire auction` (bottom of `/control`) wipes all sales and restores
every player to `available` — useful for rehearsals, not for mid-event use.

---

## Project structure

```
src/
  firebase.js                    Firebase init (reads .env)
  hooks/useAuctionData.js        All Firestore reads/writes + auction actions
  hooks/useRegistrations.js      Registration read/write + approve/reject
  utils/cloudinary.js            Unsigned photo upload helper
  data/sampleData.js             Sample teams/players used by "Load sample data"
  pages/Home.jsx                 Landing page linking to all four screens
  pages/DisplayScreen.jsx        Projector screen
  pages/ControlScreen.jsx        Auctioneer panel
  pages/RegisterScreen.jsx       Public player self-registration form
  pages/AdminRegistrations.jsx   Approve/reject registrations, set base price
  components/                    PlayerCard, Scoreboard, TeamStrip, SoldOverlay
```

## Tech stack

React 18 + Vite, Tailwind CSS, Firebase Firestore (real-time sync between
screens), React Router. No custom backend needed — Firestore's live
listeners (`onSnapshot`) are what keep `/display` and `/control` in sync,
so a separate Node/Express server isn't required unless you later want
server-side logic (e.g. bulk CSV import, auth, or payment integration).
