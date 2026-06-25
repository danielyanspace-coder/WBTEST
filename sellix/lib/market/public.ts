/**
 * Бесплатный публичный API WB (без токена) — снимок по артикулу:
 * цена, суммарный остаток по складам, рейтинг, число отзывов.
 * Снимая это раз в день, мы сами накапливаем историю рынка.
 */
const HOST = "https://card.wb.ru";

export type ItemSnapshot = {
  nmId: number;
  name: string;
  brand: string;
  price: number; // рубли
  stock: number; // суммарно по складам
  rating: number;
  feedbacks: number;
};

export async function fetchItemSnapshot(nmId: number): Promise<ItemSnapshot | null> {
  const url = `${HOST}/cards/v2/detail?appType=1&curr=rub&dest=-1257786&spp=30&nm=${nmId}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 SELLIX" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    const p = data?.data?.products?.[0];
    if (!p) return null;

    let stock = 0;
    let priceKop = 0;
    for (const s of p.sizes ?? []) {
      const pr = s.price;
      if (pr && !priceKop) priceKop = pr.total ?? pr.product ?? 0;
      for (const st of s.stocks ?? []) stock += st.qty ?? 0;
    }
    return {
      nmId,
      name: p.name ?? "",
      brand: p.brand ?? "",
      price: Math.round(priceKop / 100),
      stock,
      rating: p.reviewRating ?? p.rating ?? 0,
      feedbacks: p.feedbacks ?? 0,
    };
  } catch {
    return null;
  }
}
