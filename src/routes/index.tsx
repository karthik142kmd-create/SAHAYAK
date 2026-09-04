import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { productsQueryOptions, type ProductWithImages } from "@/lib/products";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueryOptions),
  component: Index,
  head: () => ({
    meta: [
      { title: "Artisan Showcase — Handmade Crafts Marketplace" },
      {
        name: "description",
        content:
          "Browse handmade terracotta, bamboo and handwoven crafts. Each piece is made by hand, with material, craft type, price and stock shown.",
      },
      { property: "og:title", content: "Artisan Showcase — Handmade Crafts Marketplace" },
      {
        property: "og:description",
        content: "Handmade crafts with materials, prices and live stock availability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function ProductCard({ product }: { product: ProductWithImages }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const image = product.images[index];
  const inStock = (product.stock_quantity ?? 0) > 0;

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        {image && !failed ? (
          <img
            src={image.url}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => {
              console.error("[product image failed]", {
                product: product.title,
                url: image.url,
              });
              setFailed(true);
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            Image unavailable
          </div>
        )}
        {product.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {product.images.map((img, i) => (
              <button
                key={img.url}
                aria-label={`View image ${i + 1} of ${product.title}`}
                onClick={() => {
                  setIndex(i);
                  setFailed(false);
                }}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === index ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="space-y-3 p-5">
        <h3 className="font-serif text-xl leading-tight text-foreground">{product.title}</h3>
        {product.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        )}
        <dl className="space-y-1 text-sm">
          {product.material && (
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Material</dt>
              <dd className="text-foreground">{product.material}</dd>
            </div>
          )}
          {product.craft_type && (
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Craft</dt>
              <dd className="text-foreground">{product.craft_type}</dd>
            </div>
          )}
        </dl>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-lg font-semibold text-foreground">
            {product.price != null ? inr.format(product.price) : "—"}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              inStock
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {inStock ? `In stock · ${product.stock_quantity}` : "Out of stock"}
          </span>
        </div>
      </div>
    </article>
  );
}

function Index() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.title, p.description, p.material, p.craft_type]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [products, query]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-serif text-2xl tracking-tight text-foreground">
            Artisan Showcase
          </span>
          <div className="relative sm:w-80">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search crafts, materials…"
              aria-label="Search products"
              className="w-full rounded-full border border-border bg-card py-2.5 pr-4 pl-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
        </div>
      </header>

      <section className="border-b border-border bg-[image:var(--gradient-hero)]">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center sm:py-24">
          <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
            Handmade · Small batch
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            Crafted by hand, made to be lived with
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            A small collection of clay, bamboo and woven pieces — each one shaped in the
            workshop, never mass produced.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl text-foreground">The collection</h2>
          <span className="text-sm text-muted-foreground">
            {filtered.length} of {products.length} products
          </span>
        </div>
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            No pieces match “{query}”.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Artisan Showcase — handmade goods, made in small batches.
      </footer>
    </div>
  );
}
