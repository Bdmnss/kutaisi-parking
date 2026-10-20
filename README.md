# Parking Airport Kutaisi – website

24/7 car park at Kutaisi International Airport, Georgia · +995 544 55 57 57 · kutaisiparking@gmail.com

React 18 + Vite 5, Tailwind CSS 3 (theme color `primary` = #0E3A53, `white`), React Router 6.

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run lint
```

## Structure
```
public/logo.jpg          logo – replace this file to swap (path set in src/data/site.js)
src/components/          Layout, Header, Footer, Logo, WhatsAppButton, ui (Spinner, EmptyState, Field, Alert, PageHeader)
src/pages/               Home, Prices, Booking, Esim, MyBooking, Contact (FAQ), NotFound
src/data/                site info, nav, mock JSON (prices, eSIM packages, vouchers, bookings, FAQ)
src/services/api.js      mock service layer with simulated latency (swap for real HTTP later)
src/services/pricing.js  day count + price rules
scripts/screenshots.mjs  Playwright screenshots + overflow check (needs `npx vite preview --port 4173`)
```

## Routes
`/` Home · `/prices` · `/booking` · `/esim` · `/my-booking` · `/contact` · `*` 404

## Business rules
- 10 GEL per started 24 h day; eSIM packages from 20 GEL.
- Booking: dates/times → **car plate (required, used for automatic gate opening)** → contact → eSIM + voucher → payment + summary → confirmation.
- 1 free parking day per booking when the customer buys a GLOBALCELL eSIM in the booking or already has one. Parking voucher is applied **after** the free day; eSIM vouchers apply to the eSIM price.
- Payment: full now (guaranteed) · 1-day fee now + rest on arrival (guaranteed, **default**) · pay on arrival (NOT guaranteed, amber warning, result "Request received").
- Demo vouchers: `WELCOME10`, `PARK5`, `ESIM5`. Demo booking lookup: `KP-1001` / `AA-123-BB`.
- New bookings and eSIMs are stored in `localStorage` (mock only). No real payment is processed.

## Notes
- Floating WhatsApp button (https://wa.me/995559995112) on every page.
- For SPA hosting, configure a fallback to `index.html` for client-side routes.
