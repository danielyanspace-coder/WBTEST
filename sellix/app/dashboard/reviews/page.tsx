import { PageShell } from "@/components/dashboard/PageShell";
import { getCurrentUser } from "@/lib/auth/session";
import { getFeedbacks } from "@/lib/data/dashboard";
import { ReviewsList, type ReviewItem } from "@/components/dashboard/ReviewsList";

const DEMO: ReviewItem[] = [
  { id: "demo-1", productName: "Платье летнее", authorName: "Анна", rating: 5, text: "Платье шикарное, размер в размер!", answered: false, answerText: null },
  { id: "demo-2", productName: "Куртка", authorName: "Игорь", rating: 2, text: "Пришло помятым, долго ехало.", answered: false, answerText: null },
  { id: "demo-3", productName: "Футболка", authorName: "Мария", rating: 4, text: "Хорошо, но цвет чуть темнее.", answered: false, answerText: null },
];

export default async function ReviewsPage() {
  const user = await getCurrentUser();
  const real = user ? await getFeedbacks(user.id) : [];
  const demo = real.length === 0;
  const items: ReviewItem[] = demo
    ? DEMO
    : real.map((r) => ({
        id: r.id,
        productName: r.productName,
        authorName: r.authorName,
        rating: r.rating,
        text: r.text,
        answered: r.answered,
        answerText: r.answerText,
      }));

  return (
    <PageShell title="Отзывы и вопросы">
      <ReviewsList items={items} demo={demo} />
    </PageShell>
  );
}
