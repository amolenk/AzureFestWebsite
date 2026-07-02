# Azure Fest Website — Agent Guide

Conference website for [Azure Fest](https://www.azurefest.nl), a free one-day community event focused on Azure technologies.

## Repository Layout

```
src-react/          Next.js 15 web application (primary)
src-dotnet/         .NET 8 CLI tool for importing Sessionize data
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript |
| Styling | Bootstrap 5, SASS |
| Testing | Playwright |
| Linting | ESLint (Next.js config) |
| Data import | .NET 8 console app |

## Key Files

| File | Purpose |
|---|---|
| `src-react/src/config/website-settings.ts` | Central config: current edition, dates, sponsors, organizers |
| `src-react/src/config/admitto-settings.ts` | Server-only Admitto API configuration |
| `src-react/src/lib/conference-data.ts` | Server-side data loader — reads JSON files from `public/data/` |
| `src-react/src/api/admitto.ts` | Admitto ticket API integration |
| `src-react/public/data/<year>.json` | Per-edition speaker/session data (imported from Sessionize) |
| `src-dotnet/AzureFest.SessionizeImport/` | CLI tool that pulls data from Sessionize and writes the JSON files |

## Development Commands

All commands run from `src-react/`:

```bash
npm run dev    # Dev server with Turbopack
npm run build  # Production build
npm start      # Production server (via server.js)
npm run lint   # ESLint
```

## Architecture Notes

### Edition Model
The site supports multiple conference years. Each edition has:
- A data file at `public/data/<year>.json` (speakers, sessions, rooms)
- Settings in `website-settings.ts` (dates, CFP status, registration window, sponsors)
- Dynamic routes under `app/(default)/[edition]/`

The `currentEdition` field in `website-settings.ts` controls which edition is "live".

### Data Flow
```
Sessionize API
  → src-dotnet CLI (AzureFest.SessionizeImport)
    → public/data/<year>.json
      → conference-data.ts (server-side, filesystem read)
        → React components via page props
```

All data loading is server-side (no client fetching of JSON files). `conference-data.ts` reads directly from the filesystem.

### Routing
```
/                          Home (current edition)
/speakers                  Speaker list
/agenda                    Session schedule
/tickets                   Registration flow
/code-of-conduct
/[edition]/session/[id]    Session detail (e.g. /2026/session/abc)
/[edition]/speaker/[id]    Speaker detail
```

### Ticket Registration Flow
Managed via the Admitto API (`src/api/admitto.ts`). The flow is:
1. Email entry → OTP sent
2. OTP verification
3. Personal details
4. Confirmation / QR code

## Common Tasks

### Update conference data for a new edition
1. Run the .NET importer: `dotnet run --project src-dotnet/AzureFest.SessionizeImport -- <sessionize-id> <year>`
2. Verify the generated `src-react/public/data/<year>.json`
3. Add edition settings to `website-settings.ts`

### Add or update a sponsor / organizer
Edit `website-settings.ts` — sponsors and organizers are defined inline there, not in the JSON data files.

### Change which edition is live
Set `currentEdition` in `website-settings.ts`.

## Constraints

- Data loading must stay server-side; do not introduce `fetch()` calls for the local JSON files in client components.
- Bootstrap class names are used directly in JSX — avoid introducing a conflicting CSS framework.
- The `.NET` importer targets `net8.0`; do not upgrade without testing the Unidecode.NET dependency.
