# Overbase

Overbase is a SvelteKit dashboard backed by Convex. The dashboard routes render data on the
server, so the app requires a reachable Convex deployment in local development, CI, preview,
and production.

## Runtime contract

- SvelteKit SSR and server actions talk to Convex over HTTP through Convex's SvelteKit default
  `PUBLIC_CONVEX_URL` environment variable.
- `CONVEX_DEPLOYMENT` is for the Convex CLI (`convex dev`, codegen, deploy) and is not read by
  the SvelteKit server.
- If Convex is unavailable, the app responds with `503 Service Unavailable` and setup guidance
  instead of a raw `500 fetch failed`.

## Local development

1. Install dependencies with `npm install`.
2. Copy the required env vars from `.env.example` into `.env.local` if you have not already set
   them up.
3. Start the full app runtime with `npm run dev`.

`npm run dev` is the expected entrypoint. It starts `convex dev`, waits for the first successful
`Convex functions ready!` push, and only then launches Vite. Extra CLI args are forwarded to Vite,
so commands like
`npm run dev -- --open` still work.

## Environment

- `CONVEX_DEPLOYMENT`: Convex CLI target for local development, codegen, and deploy commands.
- `DEFAULT_BROKER_KEY`: Immutable broker key for the pre-auth default broker used by My Deals.
- `PUBLIC_CONVEX_URL`: Convex HTTP URL used by the app's server-rendered routes.
- `PUBLIC_CONVEX_SITE_URL`: Convex HTTP actions URL managed by Convex for SvelteKit.

For local development, `convex dev` manages these values in `.env.local`. If your local env file
still contains an older `CONVEX_URL` entry, remove it so Convex can manage the SvelteKit defaults.
Preview, CI, and production still need a reachable `PUBLIC_CONVEX_URL` in their own environment.

## Verification

- `npm run lint`
- `npm run check`
- `npm run test`
- `npm run verify`

Any environment that exercises server-rendered routes must also have a reachable
`PUBLIC_CONVEX_URL`.

## Build and preview

Use `npm run build` to create the SvelteKit build output and `npm run preview` to serve it
locally. Both preview and production still depend on a reachable Convex backend via
`PUBLIC_CONVEX_URL`.
