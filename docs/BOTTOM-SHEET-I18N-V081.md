# HydroRivers v0.8.1 — Header sheet and i18n pass

## Header mobile bottom sheet

The mobile hamburger menu now follows the cargo filter sheet behavior more closely:

- rendered through a portal in `document.body`;
- opened only by click/tap, avoiding the pointerdown/click race that caused flicker;
- no click-to-close handler on the blur layer;
- close by close button, Escape, route change or dragging the sheet handle down;
- background content stays visible but blurred;
- sheet surface is solid, not transparent.

## Internationalization pass

The application now translates a larger portion of mock-driven content using `src/shared/i18n/mock-content.ts`.

This covers more visible content in:
- cargo cards;
- cargo detail;
- dashboard rows;
- government dashboard rows;
- negotiation cards and details;
- tracking timeline;
- vessel cards and details.

Proper names, cities, corridors and company names are intentionally preserved.
