traff-29 — an AI-powered traffic awareness app designed for Bengaluru, focusing on modelling, visualising, and communicating the patterns behind congestion.

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Key routes:

- `/` — Home (overview and CTAs)
- `/simulate` — Interactive simulation (time/density/mode → SEEP placeholders, explanation, reflection, snapshot)
- `/about` — Criterion A — Learning goal & interest

Optional configuration:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — when set, you can integrate a live map for the simulation canvas.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to load [Geist](https://vercel.com/font).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
