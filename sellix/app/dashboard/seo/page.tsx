import { eq } from "drizzle-orm";
import { PageShell } from "@/components/dashboard/PageShell";
import { SeoStudio } from "@/components/dashboard/SeoStudio";
import { getCurrentUser } from "@/lib/auth/session";
import { getStoreForUser } from "@/lib/wb/store";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";

export default async function SeoPage() {
  const user = await getCurrentUser();
  let list: { id: string; nmId: number; title: string | null; category: string | null; brand: string | null }[] = [];
  if (user) {
    const store = await getStoreForUser(user.id);
    if (store) {
      list = await db
        .select({
          id: products.id,
          nmId: products.nmId,
          title: products.title,
          category: products.category,
          brand: products.brand,
        })
        .from(products)
        .where(eq(products.storeId, store.id))
        .limit(100);
    }
  }

  return (
    <PageShell title="SEO карточек">
      <div className="bento-lime mb-4 p-6">
        <div className="font-display text-xl font-bold">ИИ напишет SEO за вас</div>
        <div className="text-sm text-ink/80">
          Продающий заголовок и описание под запросы покупателей — и сразу в карточку WB.
        </div>
      </div>
      <SeoStudio products={list} />
    </PageShell>
  );
}
