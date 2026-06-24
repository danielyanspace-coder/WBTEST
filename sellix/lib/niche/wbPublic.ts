/**
 * Внешняя аналитика ниш по ПУБЛИЧНОМУ каталогу Wildberries (без токена).
 * Это открытые данные витрины. Точные продажи WB не отдаёт — поэтому показываем
 * честные оценки по числу отзывов/цене и помечаем их как приблизительные.
 */
const SEARCH_HOST = "https://search.wb.ru";

export type NicheProduct = {
  id: number;
  name: string;
  brand: string;
  supplierId: number;
  price: number; // рубли
  rating: number;
  feedbacks: number;
};

export type NicheReport = {
  query: string;
  sample: number;
  sellers: number;
  price: { min: number; avg: number; max: number };
  avgRating: number;
  totalFeedbacks: number;
  topBrands: { brand: string; count: number }[];
  topProducts: NicheProduct[];
};

function parsePrice(p: any): number {
  const size = p.sizes?.[0]?.price;
  const kopecks =
    size?.total ?? size?.product ?? p.salePriceU ?? p.priceU ?? 0;
  return Math.round(kopecks / 100);
}

export async function fetchNicheProducts(query: string): Promise<NicheProduct[]> {
  const url =
    `${SEARCH_HOST}/exactmatch/ru/common/v9/search` +
    `?appType=1&curr=rub&dest=-1257786&resultset=catalog&sort=popular&spp=30&suppressSpellcheck=false` +
    `&query=${encodeURIComponent(query)}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 SELLIX" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`WB search ${res.status}`);
  const data = await res.json();
  const products = data?.data?.products ?? [];
  return products.slice(0, 100).map((p: any) => ({
    id: p.id,
    name: p.name ?? "",
    brand: p.brand ?? "—",
    supplierId: p.supplierId ?? 0,
    price: parsePrice(p),
    rating: p.reviewRating ?? p.rating ?? 0,
    feedbacks: p.feedbacks ?? 0,
  }));
}

export async function analyzeNiche(query: string): Promise<NicheReport> {
  const products = await fetchNicheProducts(query);
  if (products.length === 0) {
    return {
      query,
      sample: 0,
      sellers: 0,
      price: { min: 0, avg: 0, max: 0 },
      avgRating: 0,
      totalFeedbacks: 0,
      topBrands: [],
      topProducts: [],
    };
  }

  const prices = products.map((p) => p.price).filter((x) => x > 0);
  const sellers = new Set(products.map((p) => p.supplierId)).size;
  const totalFeedbacks = products.reduce((a, p) => a + p.feedbacks, 0);
  const avgRating =
    products.reduce((a, p) => a + p.rating, 0) / (products.length || 1);

  const brandCount = new Map<string, number>();
  for (const p of products) brandCount.set(p.brand, (brandCount.get(p.brand) ?? 0) + 1);
  const topBrands = [...brandCount.entries()]
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    query,
    sample: products.length,
    sellers,
    price: {
      min: Math.min(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / (prices.length || 1)),
      max: Math.max(...prices),
    },
    avgRating: Math.round(avgRating * 10) / 10,
    totalFeedbacks,
    topBrands,
    topProducts: [...products].sort((a, b) => b.feedbacks - a.feedbacks).slice(0, 10),
  };
}
