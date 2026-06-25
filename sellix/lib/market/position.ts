/**
 * Поиск позиции артикула по ключевому запросу через бесплатный публичный
 * поиск WB. Без токена. Смотрим до 3 страниц (≈300 мест); если не нашли —
 * позиция считается «вне топ-300».
 */
const SEARCH = "https://search.wb.ru";

export async function findPosition(query: string, nmId: number, maxPages = 3): Promise<number | null> {
  let rank = 0;
  for (let page = 1; page <= maxPages; page++) {
    const url =
      `${SEARCH}/exactmatch/ru/common/v9/search` +
      `?appType=1&curr=rub&dest=-1257786&resultset=catalog&sort=popular&spp=30&suppressSpellcheck=false` +
      `&page=${page}&query=${encodeURIComponent(query)}`;
    let products: any[] = [];
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 SELLIX" },
        cache: "no-store",
      });
      if (!res.ok) break;
      const data = await res.json();
      products = data?.data?.products ?? [];
    } catch {
      break;
    }
    if (products.length === 0) break;
    for (const p of products) {
      rank++;
      if (p.id === nmId) return rank;
    }
    await new Promise((r) => setTimeout(r, 120));
  }
  return null; // вне отслеживаемого топа
}
