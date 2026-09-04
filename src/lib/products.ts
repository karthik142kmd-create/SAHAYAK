import { queryOptions } from "@tanstack/react-query";
import { supabase, SUPABASE_URL } from "./supabase";

export const BUCKET = "product-images";
const PUBLIC_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

export type ProductImage = {
  id: string;
  product_id: string;
  storage_path: string | null;
  image_url: string | null;
  is_primary: boolean | null;
  display_order: number | null;
};

export type Product = {
  id: string;
  title: string;
  description: string | null;
  material: string | null;
  craft_type: string | null;
  price: number | null;
  stock_quantity: number | null;
  status: string | null;
};

export type ProductWithImages = Product & {
  images: { url: string; isPrimary: boolean; order: number }[];
  primaryImageUrl: string | null;
};

/** Strip stray characters and bucket prefixes that may be stored in the DB. */
function normalizeStoragePath(raw: string): string {
  let path = raw.trim().replace(/^[=\s]+/, "");
  // If a full URL was stored in storage_path, keep only the object path.
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const at = path.indexOf(marker);
  if (at !== -1) path = path.slice(at + marker.length);
  path = path.replace(/^\/+/, "");
  if (path.startsWith(`${BUCKET}/`)) path = path.slice(BUCKET.length + 1);
  return path;
}

/** Build the public URL for an object in the product-images bucket. */
export function publicImageUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null;
  const path = normalizeStoragePath(storagePath);
  if (!path) return null;
  return (
    supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl ?? PUBLIC_PREFIX + path
  );
}

/**
 * A stored image_url is only usable if it points at THIS project's storage host.
 * (Some rows contain typo'd hostnames, which fail to load.)
 */
function sanitizeStoredUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const url = raw.trim().replace(/^[=\s]+/, "");
  if (!/^https?:\/\//i.test(url)) return null;
  return url.startsWith(PUBLIC_PREFIX) ? url : null;
}

function resolveImageUrl(image: ProductImage): string | null {
  // Prefer a valid stored public URL, otherwise derive it from storage_path.
  return sanitizeStoredUrl(image.image_url) ?? publicImageUrl(image.storage_path);
}

export async function fetchProducts(): Promise<ProductWithImages[]> {
  const { data: products, error } = await supabase
    .from("products")
    .select("id,title,description,material,craft_type,price,stock_quantity,status")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const list = (products ?? []) as Product[];
  if (list.length === 0) return [];

  const { data: imageRows, error: imgError } = await supabase
    .from("product_images")
    .select("id,product_id,storage_path,image_url,is_primary,display_order")
    .in(
      "product_id",
      list.map((p) => p.id),
    );
  if (imgError) throw imgError;

  const byProduct = new Map<string, ProductWithImages["images"]>();
  for (const row of (imageRows ?? []) as ProductImage[]) {
    const url = resolveImageUrl(row);
    if (!url) continue;
    const entry = {
      url,
      isPrimary: row.is_primary === true,
      order: row.display_order ?? Number.MAX_SAFE_INTEGER,
    };
    const bucket = byProduct.get(row.product_id) ?? [];
    bucket.push(entry);
    byProduct.set(row.product_id, bucket);
  }

  return list.map((product) => {
    const images = (byProduct.get(product.id) ?? []).sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return a.order - b.order;
    });
    return { ...product, images, primaryImageUrl: images[0]?.url ?? null };
  });
}

export const productsQueryOptions = queryOptions({
  queryKey: ["products"],
  queryFn: fetchProducts,
});
