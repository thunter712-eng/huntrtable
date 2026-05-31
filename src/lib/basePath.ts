/**
 * The base path the app is served under.
 *
 * Empty for local dev and root deployments. For GitHub Pages (served at
 * /huntrtable/) the deploy workflow sets NEXT_PUBLIC_BASE_PATH=/huntrtable,
 * which Next inlines at build time. Use this to prefix references to files in
 * /public (icons, manifest, the service worker) which Next does NOT rewrite.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
