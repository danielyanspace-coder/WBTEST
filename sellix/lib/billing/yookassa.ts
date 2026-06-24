/**
 * Клиент ЮKassa. Включается, когда заданы YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY.
 * Док: https://yookassa.ru/developers/api
 */
const BASE = "https://api.yookassa.ru/v3";

export function hasYooKassa() {
  return Boolean(process.env.YOOKASSA_SHOP_ID && process.env.YOOKASSA_SECRET_KEY);
}

function auth() {
  const token = Buffer.from(
    `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`
  ).toString("base64");
  return `Basic ${token}`;
}

/** Создать платёж, вернуть ссылку на оплату. */
export async function createYooPayment(opts: {
  amountKopecks: number;
  description: string;
  returnUrl: string;
  metadata: Record<string, string>;
  idempotenceKey: string;
}): Promise<{ confirmationUrl: string; id: string }> {
  const res = await fetch(`${BASE}/payments`, {
    method: "POST",
    headers: {
      Authorization: auth(),
      "Content-Type": "application/json",
      "Idempotence-Key": opts.idempotenceKey,
    },
    body: JSON.stringify({
      amount: { value: (opts.amountKopecks / 100).toFixed(2), currency: "RUB" },
      capture: true,
      confirmation: { type: "redirect", return_url: opts.returnUrl },
      description: opts.description,
      metadata: opts.metadata,
    }),
  });
  if (!res.ok) throw new Error(`YooKassa ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return { confirmationUrl: data.confirmation?.confirmation_url, id: data.id };
}
