# Sahayak

Sahayak is a curated showcase for handmade crafts — clay, bamboo and handwoven goods shaped by artisans in small batches, never mass produced. Every piece lists its material, craft type, price and current stock, so you can find something made to be lived with.

**Live app**: https://render-fixer-friend.lovable.app

## Features

- **Product catalogue** — published products are fetched live from the database, sorted newest first.
- **Multiple images per product** — a primary image is shown first, with full support for additional product photos.
- **Resilient image loading** — image URLs are sanitized and normalized before rendering (stray characters are stripped, and stored URLs are verified to point at this project's storage host); any image that fails to load logs its URL to the console.
- **Live stock and details** — each item displays its material, craft type, price and current stock quantity.

## Tech stack

- [TanStack Start](https://tanstack.com/start) v1 (React 19, Vite) — full-stack framework with file-based routing
- [TanStack Query](https://tanstack.com/query) — data fetching and caching
- [Tailwind CSS](https://tailwindcss.com) v4 + shadcn/ui components
- [Supabase](https://supabase.com) — PostgreSQL database and Storage for product images (`product-images` bucket)

## Project structure

```
src/
├── routes/
│   ├── __root.tsx        # Root layout, fonts, global metadata
│   └── index.tsx         # Home page — product catalogue
├── lib/
│   ├── supabase.ts       # Supabase client + project URL
│   ├── products.ts       # Product/image types, fetching, image URL resolution
│   └── utils.ts          # Shared utilities
├── components/           # UI components (shadcn/ui)
└── styles.css            # Tailwind v4 theme and design tokens
```

## How product data flows

1. The home page fetches all `products` with `status = 'published'`.
2. For those products, matching rows from `product_images` are fetched (`storage_path`, `image_url`, `is_primary`, `display_order`).
3. Each image URL is resolved by preferring a valid stored `image_url` (only if it points at this project's storage host), otherwise deriving the public URL from `storage_path` in the `product-images` bucket.
4. Images are sorted primary-first, then by `display_order`.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

Then open the local dev server URL printed in the terminal.

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c37f1c6d-8e8e-45ae-b980-0799baa8fd54).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.
