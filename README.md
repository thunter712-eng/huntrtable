# YappoZappo 💬

**Great conversations start here.**

A mobile-first conversation game inspired by the classic Gabbit family device.
Tap a colorful button, hear a question read aloud, and start talking — perfect
for family dinners, road trips, youth groups, small groups, and devotions.

Built with **Next.js · React · TypeScript · Tailwind CSS**. No backend required.

## Features

- 🎨 Five large, glossy 3D category buttons (This or That, What If?, Favorites, Family & Friends, Faith)
- 🎲 **Surprise Me** button for a random category
- 🔊 Reads questions aloud with the browser Speech Synthesis API (friendly, slightly slower voice) — toggle on/off
- 📳 Haptic feedback on supported devices
- 🃏 Big animated question card with large, readable typography
- 🔁 Repeat & Next controls
- 🚫 No-repeat shuffle: questions never repeat until the whole category is used, then it reshuffles
- 💾 Progress remembered via localStorage
- 🎉 Confetti every 25 questions
- 🌙 Light & dark mode (follows system preference, then remembers your choice)
- 📲 Installable as a PWA, works offline
- 250 family-friendly questions (50 per category), suitable for ages 10–80

## Getting started

```bash
npm install
npm run icons   # generate PNG PWA icons from public/icons/source-icon.png
npm run dev     # http://localhost:3000
```

> Speech, haptics, and the service worker require a real browser. Speech sounds
> best on iOS Safari and macOS. The service worker only registers in a
> production build (`npm run build && npm start`).

## Project structure

```
src/
├── app/
│   ├── layout.tsx        # fonts, metadata, PWA + theme bootstrapping
│   ├── page.tsx          # the single-screen experience
│   └── globals.css       # theme tokens + the tactile candy-button styling
├── components/
│   ├── CategoryButton.tsx
│   ├── SurpriseButton.tsx
│   ├── QuestionCard.tsx
│   ├── Controls.tsx
│   ├── ThemeToggle.tsx
│   └── PwaRegister.tsx
├── data/                 # 50 questions per category (JSON)
│   ├── this-or-that.json
│   ├── what-if.json
│   ├── favorites.json
│   ├── family-friends.json
│   └── faith.json
└── lib/
    ├── types.ts
    ├── categories.ts     # category metadata + colors, loads question data
    ├── useQuestions.ts   # no-repeat shuffle engine + localStorage
    ├── useSpeech.ts      # Speech Synthesis wrapper
    ├── useHaptics.ts     # Vibration API wrapper
    ├── useTheme.ts       # light/dark with no-flash init script
    └── confetti.ts       # milestone celebration
```

## Adding questions

Edit the JSON files in `src/data/`. Each file is a flat array of strings. The
shuffle engine adapts automatically — no other changes needed.

## Deploy to Vercel

Push to a Git repo and import it at [vercel.com/new](https://vercel.com/new), or:

```bash
npm i -g vercel && vercel
```

Zero configuration required.
