# Hyain ✈️  
### Intent-aware flight search MVP

Hyain is an experimental flight search MVP that interprets **natural language intent**
(e.g. “cheap flights to Paris”, “fastest flight today”, “next weekend getaway”)
and ranks results accordingly instead of relying only on filters.

This project focuses on **intent detection, ranking logic, and clean UX**, not real airline APIs (yet).

---

## 🚀 Features

- 🔍 Natural-language style search (free-text input)
- 🧠 Intent detection (CHEAPEST / FASTEST / BEST)
- 🏷️ Smart result tagging (e.g. 💸 Cheapest, ⚡ Fastest)
- 📊 Ranking logic instead of basic filtering
- 🧼 Safe, immutable backend logic (no shared-state bugs)
- ⚡ Built with Next.js App Router + TypeScript

---

## 🧠 How it works (high level)

1. User enters a free-text query  
2. Query is tokenised and cleaned (stop words removed)
3. Intent words (cheap / fast / today / weekend) are detected
4. Flights are ranked based on intent
5. The best-matching result is tagged and highlighted

This mimics how a human would search rather than how traditional filters work.

---

## 🛠 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **React**
- **Tailwind CSS**
- Mock flight data (for MVP)

---

## ▶️ Running locally

```bash
npm install
npm run dev
