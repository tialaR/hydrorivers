# QA Test Matrix - HydroRivers v066

## Demo accounts
- Shipper: `tiala@hydrorivers.com` / `hydro123`
- Carrier: `joao@naveganorte.com` / `hydro123`
- Admin: `admin@hydrorivers.com` / `hydro123`
- Shipper 2: `mariana@bioamazonia.coop` / `hydro123`
- Carrier 2: `carlos@hidroviasmadeira.com` / `hydro123`

Com `npm run dev`, prefira o [**Mock Mode QA Hub**](MOCK-MODE-QA-HUB.md) em vez de logs no terminal.

## Terminal — Dev Scenario Reporter (opcional)

Blocos legíveis só se `HYDRORIVERS_DEV_SCENARIO_LOGS=true` (função mantida para depuração). Guia completo: [`docs/MOCK-MODE-QA-HUB.md`](MOCK-MODE-QA-HUB.md).

### 1. Authentication
1. Login with each valid account.
2. Reject invalid password.
3. Persist session after refresh.
4. Logout and validate private routes redirect to `/login`.
5. Validate locale persists after login.

### 2. Theme and preferences
1. Switch dark/light theme and refresh.
2. Validate there is no flash during hydration.
3. Validate locale switcher on public and private pages.
4. Validate profile and theme persistence in local storage.

### 3. Cargo marketplace
1. Open `/cargas` and confirm 30+ cargo cards are visible.
2. Search by route, cargo title and producer.
3. Open bottom-sheet filters on mobile.
4. Filter by status, type and route.
5. Validate cards are fully clickable.
6. Validate icon changes by cargo family and stronger route UI.
7. Validate long titles do not overflow the card.

### 4. Cargo detail
1. Open `/cargas/cargo-001`.
2. Confirm route spotlight, stronger icons and document section.
3. Trigger fake proposal submission and validate success toast.
4. Validate form fields: amount, ETA, vessel compatibility, document readiness, operation plan, contact channel, notes.
5. Validate tooltip in document items.

### 5. Vessels
1. Open `/embarcacoes` and inspect cards.
2. Validate additional vessel data: certifications, readiness, inspection and sustainability.
3. Open vessel details and confirm layout hierarchy.

### 6. Negotiations
1. Open `/negociacoes`.
2. Validate new fake negotiations and stage labels.
3. Open negotiation detail states (quote, counteroffer, contract).

### 7. Tracking
1. Open `/rastreio`.
2. Validate richer step timeline and step states.
3. Confirm fake tracking events are displayed in order.
4. Validate icon clarity for waterway monitoring context.

### 8. Impact
1. Open `/impacto`.
2. Confirm page renders without runtime error.
3. Open each impact story card and validate localization.

### 9. Responsive behavior
1. Validate 390x844, 430x932, 768x1024 and 1440x900 breakpoints.
2. Validate floating QA mock panel does not block navigation.
3. Validate fixed header, blur and reduced radius consistency.

### 10. Internationalization
1. Test `pt-BR`, `en`, `es` on dashboard, cargos, detail and impact.
2. Confirm component labels and document labels are translated.
3. Confirm proper nouns and route names remain intact where appropriate.
