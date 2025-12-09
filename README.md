# AI-Powered Daily Time Tracking & Analytics Dashboard

**Short description:** A responsive web app to log daily activities in minutes, validate total ≤ 1440, and show a date-based analytics dashboard (charts + timeline). Uses Firebase Authentication + Firestore. AI tools were used for UI brainstorming, color palette and initial component scaffolding.

**Live demo:** _(https://github.com/krishna-28131)_

**Video walkthrough:** _(https://drive.google.com/drive/home)_

---

## Features
- Sign in with Google or Email (Firebase Auth)
- Create, edit, delete activities per date
- Total minutes per day validated (≤ 1440)
- Remaining minutes indicator
- Analyse button (enabled when total ≥ 1440) to view analytics
- Dashboard: total hours, pie chart by category, timeline
- Beautiful “No data available” view and CTA
- Responsive layout (mobile-first)

---

## Tech stack
- Frontend: HTML / Tailwind CSS / JS
- Charts: Chart.js
- Backend: Firebase Authentication + Firestore
- Deploy: GitHub Pages

---

## How to run locally

1. Clone the repo
```bash
git clone https://github.com/krishna-28131/AI-Usage-Skills-Evaluation.git>/time-tracker-ai-dashboard.git
cd time-tracker-ai-dashboard
