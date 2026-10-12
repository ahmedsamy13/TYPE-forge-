# SMSM Type Forge

A clean single-page JSON-to-TypeScript converter built with React, TSX, Tailwind CSS v4 and Vite. Conversion runs entirely in your browser. No input is stored or uploaded.

## Local development

Requires Node.js 22.18 or later for the test runner.

```sh
npm install
npm run dev -- --port 5174
npm test
npm run build
npm run preview
```

## Features

- Live JSON conversion with clear JSON and type-name validation.
- Named nested interfaces or type aliases with collision-safe names.
- Merges object shapes across array items, infers unions and missing optional fields.
- Export, optional-property and readonly-property settings. Readonly also uses ReadonlyArray.
- Primitive and array roots use type aliases, even in interface mode.
- Null is preserved, dates remain strings, empty arrays use unknown[], empty objects get an unknown index signature.
- JSON formatting, example/reset, clear, copy and `.ts` download.
- Responsive, keyboard-accessible single-page layout.
- Resource limits: 250,000 characters, 40 nested inference levels and 25,000 visited values.

A sample cannot reveal all valid API responses. Review inferred definitions against the real API contract. Generated TypeScript does not provide runtime validation. Input changes clear invalid output and disable export. Clipboard requires HTTPS or localhost and browser support.

## Validation

Tests compile generated output with the TypeScript compiler and verify representative samples are assignable. They cover unions, nested objects, missing fields, empty values, quoted property names, name collisions and settings.

## Research

- [TypeScript: Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [TypeScript: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)

## Deploy

`npm run build` produces `dist/` for any static host. No backend is required. For hosting under a subdirectory, set Vite's `base` to that path. Serve over HTTPS for clipboard support.
