import { Topbar } from "@/components/dashboard/Topbar";

/** Обёртка контента страницы кабинета: топбар + отступы. */
export function PageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Topbar title={title} />
      <div className="flex-1 p-5">{children}</div>
    </div>
  );
}

/** Заглушка для разделов, у которых пока готов только UI. */
export function ComingSoon({ what }: { what: string }) {
  return (
    <div className="bento flex flex-col items-center justify-center p-12 text-center">
      <div className="mb-3 rounded-full bg-lime/15 px-3 py-1 text-xs font-semibold text-lime">
        В разработке
      </div>
      <h3 className="font-display text-xl font-bold">{what}</h3>
      <p className="mt-2 max-w-md text-sm text-muted">
        Интерфейс готов, подключаем данные из WB API и логику. Появится в одном из
        ближайших обновлений — следите за уведомлениями.
      </p>
    </div>
  );
}
