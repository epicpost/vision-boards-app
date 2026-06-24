# EpicPost Web App

Local development guide for the EpicPost TanStack/Vite web app.

## Requirements

- Bun, recommended because the repo includes `bun.lock`
- Node.js 22.12+ if you prefer npm

Vite 7 does not run on Node 20.18.x. Use the version from `.nvmrc`:

```sh
nvm install
nvm use
node --version
```

## Setup

Install dependencies:

```sh
bun install
```

If you are using npm instead:

```sh
npm install
```

## Environment

The app uses the production API by default:

```txt
https://epicapi.epicpost.app
```

To point the app at another API, create `.env.local`:

```sh
VITE_API_BASE_URL=http://localhost:8000
```

## Run Locally

Start the dev server:

```sh
bun run dev
```

Or with npm:

```sh
npm run dev
```

Open the local URL printed by Vite, usually:

```txt
http://localhost:5173
```

If that port is already in use, Vite will print a different port.

## Useful Commands

```sh
bun run lint
bun run build
bun run preview
```

Npm equivalents:

```sh
npm run lint
npm run build
npm run preview
```

## Troubleshooting

If `bun` is not installed, install it from https://bun.sh or use npm.

If `npm run dev` prints `Vite requires Node.js version 20.19+ or 22.12+`, your shell is using an older Node. Run:

```sh
nvm install 22.12.0
nvm use 22.12.0
npm run dev
```

If the dev server starts but API-backed data does not load, confirm `VITE_API_BASE_URL` points to a reachable backend and that you are signed in when viewing authenticated pages.

If a production build fails in the Nitro/Vercel bundling step with a TanStack export mismatch, verify the TanStack package versions in `package.json` and the lockfile are aligned before changing app code.

