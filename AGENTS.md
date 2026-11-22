# ShopLedger

## Stack
- CommonJS Node.js application using Express 4 and body-parser.
- Browser UI is plain HTML, CSS, and JavaScript in `public/`.
- `lib/store.js` reads and writes records in `data/db.json`.

## Module map
- `routes/customers.js` — lists customers and records Khata settlements.
- `routes/orders.js` — lists, fetches, creates, and cancels orders.
- `routes/products.js` — lists products and active coupons.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.
- `lib/coupons.js` — normalizes, validates, and calculates coupons.
- `lib/dates.js` — formats today's date, normalizes date keys, and calculates fiscal years.
- `lib/inventory.js` — finds products, checks/reserves/releases stock, and summarizes inventory.
- `lib/invoice.js` — calculates invoice figures and renders printable invoice HTML.
- `lib/ledger.js` — finds/lists customers and updates Khata charges, reversals, and settlements.
- `lib/orders.js` — adds, fetches, cancels, and filters/sorts orders.
- `lib/pricing.js` — calculates subtotals, discounts, and order totals.
- `lib/reports.js` — calculates dashboard summaries and GST reconciliation.
- `lib/store.js` — reads/writes the JSON store and appends audit entries.
- `lib/tax.js` — resolves GST rates and splits CGST/SGST.

## Commands
- Start the app: `npm start` (runs `node server.js`).
- Run tests: `node --test`.

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests must use in-memory data and never read or write `data/db.json`.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
Order history sorting and date filtering are broken, and Khata settlements corrupt customer balances.
Allowed files: `lib/orders.js` (`list` only), `lib/dates.js`, `lib/ledger.js`, and `routes/customers.js`.
