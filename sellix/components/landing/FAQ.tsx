const faqs = [
  {
    q: "Это безопасно — давать вам ключ от WB?",
    a: "Да. Ключ WB API даёт доступ только к вашему кабинету продавца и хранится в зашифрованном виде. Мы не передаём данные третьим лицам, а ключ можно отозвать в любой момент в кабинете Wildberries.",
  },
  {
    q: "Я не разбираюсь в аналитике. Разберусь?",
    a: "Для этого мы и сделали SELLIX. Никаких таблиц на 50 колонок: только понятные подсказки и действия. А все сложные слова на сайте можно навести курсором и прочитать простое объяснение.",
  },
  {
    q: "Что входит в бесплатный период?",
    a: "7 дней полного доступа к выбранному тарифу. Карта для старта не нужна — просто регистрируетесь и подключаете магазин.",
  },
  {
    q: "Чем вы лучше других сервисов?",
    a: "Мы собрали функции топовых сервисов (аналитика, умные цены, отзывы, реклама, SEO) в один простой интерфейс и добавили AI-агента, который делает рутину за вас и отвечает на вопросы по справочнику Wildberries.",
  },
  {
    q: "Как работает AI-чат по справочнику?",
    a: "Вы пишете вопрос обычными словами — ИИ находит ответ в правилах и справочнике Wildberries и отвечает со ссылкой на источник, не выдумывая.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="section py-16">
      <h2 className="mb-8 font-display text-3xl font-bold tracking-tight md:text-4xl">
        Частые вопросы
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {faqs.map((f, i) => (
          <details key={i} className="bento group p-6 [&_summary]:cursor-pointer">
            <summary className="flex items-center justify-between font-semibold text-white marker:content-none">
              {f.q}
              <span className="ml-4 text-lime transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
