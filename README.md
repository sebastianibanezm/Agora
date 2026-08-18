This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## PostHog analytics

The marketing site initializes PostHog from `instrumentation-client.ts`. Add these public environment variables to every Vercel environment that should collect analytics:

```bash
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_your_project_token
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

`NEXT_PUBLIC_` variables are embedded in the browser bundle at build time. The project token is intentionally public; never put a PostHog personal API key in either variable. If either variable is missing, analytics remains disabled and the site continues normally.

PostHog collects automatic page views, page leaves, clicks, and session recordings. Session replay is enabled with all form inputs masked. The site also captures these explicit events:

| Event | Properties |
| --- | --- |
| `contact_cta_clicked` | `source`: `hero` or `cta_band` |
| `resource_clicked` | `source`, `path` |
| `contact_form_started` | None |
| `contact_form_submitted` | `annual_container_volume` |
| `contact_form_failed` | `reason`, optional `status_code` |

Names, email addresses, and company names are never included in captured event properties. After `/api/contact` returns success, the browser is identified with the normalized submitted email and the lead properties are attached to that PostHog person. This merges the earlier anonymous journey into the converted lead's profile.
