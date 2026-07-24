Disabled the TypeScript demo page to prevent duplicate route errors.

I replaced app/demo/page.tsx with a non-exporting placeholder so only app/demo/page.jsx registers the /demo route.
