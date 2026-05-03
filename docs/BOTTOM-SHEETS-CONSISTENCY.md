# Bottom sheets consistency

Version 0.8.0 applies the cargo filter bottom-sheet behavior to the mobile header menu.

## Behavior

- Bottom sheets are rendered through a portal in `document.body`.
- The background content receives a strong blur while the sheet is open.
- The sheet itself uses a solid surface background, not transparency.
- Opening and closing use a smooth slide animation.
- The page scroll is locked while a sheet is open.
- The mobile header sheet supports snap positions:
  - half
  - almost full screen
- Dragging the sheet handle downward closes or collapses it.
- Dragging upward expands it.

## Implemented sheets

- Cargo filters bottom sheet
- Mobile header navigation bottom sheet
