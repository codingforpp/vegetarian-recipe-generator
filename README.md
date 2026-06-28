# 🌱 Acre — Farm Jobs

A calm, beautiful way to manage every job on your hobby farm — from the repair
you spotted on a walk, to machinery servicing, to the scheduled seasonal jobs
that come round each year.

Acre is a **mobile-first, installable web app (PWA)**. It runs entirely on your
phone, works offline, and keeps all your data privately on your device. No
account, no sign-up, no cloud.

---

## ✨ What it does

- **Today** — a warm dashboard showing what's overdue, due today, and coming up
  this week, with a daily progress ring.
- **Quick Capture** — the big ➕ button. Spotted a broken fence post while
  walking the paddock? Snap a photo, set a priority and area, and capture it in
  seconds before you forget. Add several in a row without leaving the screen.
- **Jobs** — your full job list with search, category/area filters, and smart
  sorting (overdue → priority → due date).
- **Plan** — a month calendar with coloured dots per job, tap any day to see
  what's scheduled.
- **The Farm** — manage your **Equipment** (with service intervals, service
  history and "log service done today") and your **Areas** (paddocks, sheds,
  orchard, garden…).

### Built for real farm life

- **Recurring & seasonal jobs** — daily, weekly, monthly, seasonal or yearly.
  Completing a recurring job automatically schedules the next one.
- **Service tracking** — equipment shows when its next service is due (or how
  overdue it is) based on the interval you set.
- **Photos** — attach photos to any job, captured straight from your camera.
- **Checklists** — break a big job (like a tractor service) into steps.
- **Priorities** — Low → Normal → High → Urgent, with urgent jobs surfaced first.
- **Light & dark** — a hand-tuned earthy palette that follows your system or can
  be locked to light/dark.
- **Haptics & motion** — subtle, considered feedback throughout.

---

## 🛠 Tech

- **React + TypeScript + Vite**
- **Tailwind CSS** with a custom farm-inspired design system
- **Framer Motion** for fluid sheets, transitions and gestures
- **Zustand** with `localStorage` persistence
- **vite-plugin-pwa** for offline + installability

## 🚀 Run it

```bash
npm install
npm run dev      # open the printed URL on your phone (same network)
```

Build for production:

```bash
npm run build
npm run preview
```

## 📱 Install on your phone

1. Open the app's URL in Safari (iOS) or Chrome (Android).
2. **Share → Add to Home Screen** (iOS) or **⋮ → Install app** (Android).
3. Launch it from your home screen — it runs full-screen, like a native app,
   and works without a connection.

---

Everything you add stays on your device. To start fresh or restore the sample
farm, use **Settings → Data**.
