# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

**Charted** is a mobile app (React Native/Expo) for discovering, sharing, and tracking locations with friends. Users drop pins on a map with photos, tags, and visit history, and share them with friends.

## Commands

### Frontend

```bash
cd frontend
npm install
npx expo start -c --tunnel   # development (tunnel mode for device testing)
```

### Backend

```bash
make backend    # sam build && sam local start-api (requires Docker)
make deploy     # deploy to AWS (us-east-2)
```

Or from `backend/charted-backend/`:

```bash
sam build
sam local start-api --env-vars env.json
sam deploy
```

### Backend tests

```bash
cd backend/charted-backend
python -m pytest tests/unit/
python -m pytest tests/integration/   # requires deployed stack + AWS_SAM_STACK_NAME env var
```

## Environment Setup

**Frontend** — create `frontend/.env`:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
EXPO_PUBLIC_GOOGLE_PLACES_KEY=...
```

**Backend** — create `backend/charted-backend/env.json` with Supabase credentials for local Lambda invocation.

Backend deployment requires AWS credentials and SAM CLI + Docker installed locally.

## Architecture

### Frontend (`frontend/`)

**Routing**: Expo Router (file-based). Entry point is `app/_layout.tsx`, which checks Supabase session and redirects to `/(auth)/login` or `/(tabs)/` accordingly. Onboarding (`/onboarding`) gates location permission before reaching tabs.

**Tabs**: Four main sections — `(tabs)/(home)` (map view), `(tabs)/(lists)`, `(tabs)/(friends)`, `(tabs)/(account)`.

**State management**:

- Zustand (`store/pinsStore.ts`) for the global pins list (not in use yet)
- Context API: `context/PinDropContext.tsx` for the pin-creation flow (not in use yet), `context/AuthContext.tsx` for session/user

**Data layer**:

- `lib/supabase.ts` — Supabase client (auth + DB)
- `lib/photoOperations.ts` — photo upload/download/delete via AWS pre-signed URLs
- `lib/pinRefresh.ts` — helper to re-fetch pins and update the Zustand store

**Key UI patterns**:

- `components/` holds modals and overlay sheets (pin detail, pin creation, friend requests, etc.)
- Custom fonts: Raleway family, loaded in `_layout.tsx`
- Theme colors in `constants/Colors.ts`; dark/light mode via `hooks/useColorScheme`

### Backend (`backend/charted-backend/`)

Three independent Python Lambda functions behind API Gateway HTTP API:

- `upload_photo_url` → generates S3 pre-signed PUT URL
- `download_photo_url` → generates S3 pre-signed GET URL
- `delete_photo_url` → generates S3 pre-signed DELETE URL

Infrastructure defined in `template.yaml` (SAM/CloudFormation). Deployed to AWS region `us-east-2`.

Live API base URLs are hardcoded in `frontend/lib/photoOperations.ts` and a config endpoint is hardcoded in `frontend/app/(tabs)/index.tsx`.

### Database

Supabase (PostgreSQL). Key tables: `profiles`, `pins`, `tags`, `lists`, `visits`, `friends`. Auth is handled by Supabase Auth; `profiles` rows are linked to `auth.users`.

## Rules

- Never commit .env values or hardcode secrets
- Never install a new package without asking first
- Never modify the Supabase schema directly — write a migration file
