# FoodyLoop

> **Smart Surplus Food Recovery, Dynamic AI Demand Forecasting & Seva Platform**  
> *Pilot Region: Mathura - Vrindavan - Barsana*

FoodyLoop connects local bhojanalayas, sweet shops, dhabas, ashrams, NGOs, and volunteer couriers to eliminate edible food waste and feed destitute elders and pilgrims in real time.

---

## Key Capabilities

1. **Daily Dynamic AI Demand Forecasting**:
   - Rolling 7-day calendar forecast starting from current date.
   - Calibrated to Mathura-Vrindavan temple footfall, Parikrama surges, and festival calendars.
   - 95% Confidence Intervals with explainable kitchen preparation batches.

2. **Database & Realtime Sync**:
   - Live synchronization with Supabase PostgreSQL.
   - Cache-first architecture providing 0ms latency on low-end and high-end mobile devices.
   - Supabase Realtime channel subscription for instant cross-tab and cross-device updates.

3. **Food Safety Engine (FSSAI Regulated)**:
   - Dynamic holding temperature verification (hot-held >60°C, room temp 4-hour window, cold chain <5°C).
   - Category-specific decay curves for grains, gravies, dairy, sweets, and breads.

4. **Multi-Role Workflows**:
   - **Shopkeeper**: Declare surplus, view sales vs. prep analytics, and track shop reputation.
   - **NGO / Ashram**: Claim matching surplus donations with atomic concurrency protection.
   - **Volunteer Courier**: 4-digit pickup and delivery OTP verification with route optimization.
   - **Devotee / Donor**: Sponsor fresh meals and bhandaras with instant digital certificates.
   - **Admin / Food Safety Officer**: View regulatory register, inspect immutable audit logs, and test concurrency locks.

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/ImBajrangi/FoodyLoop.git
cd FoodyLoop

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS (Duolingo-inspired accessible gamified design)
- **Database**: Supabase PostgreSQL (Row-Level Security & Realtime)
- **Icons**: Lucide React
- **Animations**: Canvas Confetti

---

## License
MIT License. Dedicated with devotion to the service of Braj Dham.
