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
}
