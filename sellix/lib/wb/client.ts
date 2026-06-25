/**
 * Клиент Wildberries API. Все базовые адреса вынесены в WB_HOSTS — если WB
 * сменит домены, правим здесь. Токен продавца передаётся в заголовке Authorization.
 *
 * Документация: https://dev.wildberries.ru
 */
export const WB_HOSTS = {
  content: "https://content-api.wildberries.ru",
  prices: "https://discounts-prices-api.wildberries.ru",
  statistics: "https://statistics-api.wildberries.ru",
  analytics: "https://seller-analytics-api.wildberries.ru",
  feedbacks: "https://feedbacks-api.wildberries.ru",
  advert: "https://advert-api.wildberries.ru",
  supplies: "https://supplies-api.wildberries.ru",
  common: "https://common-api.wildberries.ru",
};

type Host = keyof typeof WB_HOSTS;

async function wbFetch<T>(
  host: Host,
  path: string,
  token: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${WB_HOSTS[host]}${path}`, {
    ...init,
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`WB ${host}${path} → ${res.status} ${body.slice(0, 200)}`);
  }
  // Некоторые методы возвращают пустое тело
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

export class WBClient {
  constructor(private token: string) {}

  /** Проверка валидности токена (дешёвый запрос). */
  async ping(): Promise<boolean> {
    try {
      await wbFetch(
        "feedbacks",
        "/api/v1/feedbacks/count-unanswered",
        this.token
      );
      return true;
    } catch {
      try {
        await wbFetch("common", "/ping", this.token);
        return true;
      } catch {
        return false;
      }
    }
  }

  /** Карточки товаров (артикулы, названия, бренды). */
  async getCards(limit = 100): Promise<any[]> {
    const data = await wbFetch<any>("content", "/content/v2/get/cards/list", this.token, {
      method: "POST",
      body: JSON.stringify({
        settings: { cursor: { limit }, filter: { withPhoto: -1 } },
      }),
    });
    return data?.cards ?? [];
  }

  /** Текущие цены и скидки. */
  async getPrices(limit = 1000): Promise<any[]> {
    const data = await wbFetch<any>(
      "prices",
      `/api/v2/list/goods/filter?limit=${limit}&offset=0`,
      this.token
    );
    return data?.data?.listGoods ?? [];
  }

  /** Установить цену и скидку для артикула (репрайсер). */
  async setPrice(nmId: number, price: number, discount?: number): Promise<void> {
    await wbFetch("prices", "/api/v2/upload/task", this.token, {
      method: "POST",
      body: JSON.stringify({
        data: [{ nmID: nmId, price, ...(discount != null ? { discount } : {}) }],
      }),
    });
  }

  /** Остатки на складах WB. */
  async getStocks(dateFrom = "2020-01-01"): Promise<any[]> {
    return wbFetch<any[]>(
      "statistics",
      `/api/v1/supplier/stocks?dateFrom=${dateFrom}`,
      this.token
    );
  }

  /** Заказы за период. */
  async getOrders(dateFrom: string): Promise<any[]> {
    return wbFetch<any[]>(
      "statistics",
      `/api/v1/supplier/orders?dateFrom=${dateFrom}`,
      this.token
    );
  }

  /** Продажи (выкупы) за период. */
  async getSales(dateFrom: string): Promise<any[]> {
    return wbFetch<any[]>(
      "statistics",
      `/api/v1/supplier/sales?dateFrom=${dateFrom}`,
      this.token
    );
  }

  /** Список отзывов (по умолчанию неотвеченные). */
  async getFeedbacks(isAnswered = false, take = 100): Promise<any[]> {
    const data = await wbFetch<any>(
      "feedbacks",
      `/api/v1/feedbacks?isAnswered=${isAnswered}&take=${take}&skip=0&order=dateDesc`,
      this.token
    );
    return data?.data?.feedbacks ?? [];
  }

  /** Ответить на отзыв. */
  async answerFeedback(feedbackId: string, text: string): Promise<void> {
    await wbFetch("feedbacks", "/api/v1/feedbacks/answer", this.token, {
      method: "POST",
      body: JSON.stringify({ id: feedbackId, text }),
    });
  }

  // ─── Реклама (Promotion API) ─────────────────────────────────
  /** Список ID кампаний по статусам/типам. */
  async getAdvertIds(): Promise<number[]> {
    const data = await wbFetch<any>("advert", "/adv/v1/promotion/count", this.token);
    const ids: number[] = [];
    for (const group of data?.adverts ?? []) {
      for (const a of group?.advert_list ?? []) {
        if (a?.advertId) ids.push(a.advertId);
      }
    }
    return ids;
  }

  /** Детали кампаний по ID (название, тип, статус, текущий CPM). */
  async getAdvertsInfo(ids: number[]): Promise<any[]> {
    if (ids.length === 0) return [];
    const data = await wbFetch<any>("advert", "/adv/v1/adverts", this.token, {
      method: "POST",
      body: JSON.stringify(ids.slice(0, 50)),
    });
    return Array.isArray(data) ? data : [];
  }

  /** Статистика кампаний за период (показы, клики, расход, заказы, выручка). */
  async getAdvertStats(ids: number[], from: string, to: string): Promise<any[]> {
    if (ids.length === 0) return [];
    const data = await wbFetch<any>("advert", "/adv/v2/fullstats", this.token, {
      method: "POST",
      body: JSON.stringify(ids.slice(0, 50).map((id) => ({ id, dates: [from, to] }))),
    });
    return Array.isArray(data) ? data : [];
  }

  /** Изменить ставку (CPM) кампании. */
  async setAdvertCpm(advertId: number, type: number, cpm: number, param?: number): Promise<void> {
    await wbFetch("advert", "/adv/v1/cpm", this.token, {
      method: "POST",
      body: JSON.stringify({ advertId, type, cpm, ...(param != null ? { param } : {}) }),
    });
  }

  // ─── Приёмка складов (Supplies API) ─────────────────────────
  /** Список складов WB. */
  async getWarehouses(): Promise<any[]> {
    const data = await wbFetch<any>("supplies", "/api/v1/warehouses", this.token);
    return Array.isArray(data) ? data : [];
  }

  /** Коэффициенты приёмки. coefficient: -1 недоступно, 0 бесплатно, >0 платный множитель. */
  async getAcceptanceCoefficients(warehouseIDs?: number[]): Promise<any[]> {
    const q = warehouseIDs?.length ? `?warehouseIDs=${warehouseIDs.join(",")}` : "";
    const data = await wbFetch<any>("supplies", `/api/v1/acceptance/coefficients${q}`, this.token);
    return Array.isArray(data) ? data : [];
  }

  // ─── Контент (SEO карточки) ──────────────────────────────────
  /** Обновить тексты карточки (best-effort: WB требует полный объект карточки). */
  async updateCardText(nmId: number, title: string, description: string): Promise<void> {
    const cards = await this.getCards(100);
    const card = cards.find((c: any) => (c.nmID ?? c.nmId) === nmId);
    if (!card) throw new Error("Карточка не найдена для обновления");
    card.title = title;
    card.description = description;
    await wbFetch("content", "/content/v2/cards/update", this.token, {
      method: "POST",
      body: JSON.stringify([card]),
    });
  }
}
