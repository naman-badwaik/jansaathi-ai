# JANSAATHI AI (जनसाथी AI)
> **Government services, made simpler for everyone.**
>
> ## 🚀 Live Demo

**Try JANSAATHI AI here:**  
👉 https://jansaathi-ai-rho.vercel.app

*Government Services, Made Simpler for Everyone.*

JANSAATHI AI is an intelligent citizen-service agent built to help Indian citizens discover government welfare schemes, understand eligibility criteria, analyse required documents, prepare applications, and track progress across central and state portals.

---

## Tech Stack
- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler:** [Vite](https://vite.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Quality & Linting:** Oxlint + TypeScript strict type-checking

---

## Design System & Theme
- **Primary Colours:** Deep Navy (`#0f172a`, `#080e1e`) & White
- **Accents:** Subtle Saffron (Amber/Orange `#ea580c`, `#f97316`) & India Green (`#16a34a`, `#138808`)
- **Components:** Rounded cards (`rounded-2xl`, `rounded-3xl`), soft shadows, accessible typography, and smooth transitions.
- **Accessibility:** Multilingual switcher (Hindi, English, Marathi, Bengali, Telugu, Tamil) and dynamic font-scaling toggles.

---

## Foundation Architecture (Phase 1)
- **1. Landing Page (`/`):** Public-facing portal featuring JANSAATHI branding, official tagline, Get Started button, interactive Voice Assistant launcher, core platform pillars, and step-by-step citizen guides.
- **2. Dashboard:** Personalised citizen command centre with:
  - Personalised Welcome Section
  - Discover Government Schemes Card
  - Document Assistant Card
  - My Applications Card
  - Find Assistance Centre Card
  - Recent Activity & Audit Timeline
- **3. Functional Sidebar Navigation:**
  - Dashboard
  - Discover Schemes
  - Document Assistant
  - My Applications
  - Assistance Centres
  - My Profile
- **4. AI Assistant Panel:** Slide-over assistant drawer with:
  - Animated assistant avatar
  - Chat interface layout with quick query suggestions
  - Text input with character limits and send triggers
  - Voice interaction launcher
- **5. Voice Assistant Modal:** Audio wave visualization and microphone listening simulation with Indic language selection.
- **6. Clearly Labelled Placeholders:** Honest status notifications indicating features scheduled for live AI and government departmental API integration in Phase 2.

---

## How to Run Locally

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### Installation & Execution
```bash
# 1. Clone or navigate to the project directory
cd e:/downloads/code_shetra

# 2. Install dependencies (if not already installed)
npm install

# 3. Start the Vite local development server
npm run dev

# 4. Open in browser
# http://localhost:5173
```

### Production Build & Preview
```bash
# Build production bundle with TypeScript verification
npm run build

# Preview production build locally
npm run preview
```
