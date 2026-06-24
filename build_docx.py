# -*- coding: utf-8 -*-
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

# Уникальные функции, сгруппированные по категориям.
# Каждая функция встречается ОДИН раз (без повторов между сервисами), названий сервисов нет.
DATA = [
    ("Аналитика продаж и товаров", [
        "Расчёт реальных продаж конкурентов (по разнице остатков)",
        "Динамика продаж и выручки (ежедневная / помесячная)",
        "Аналитика по артикулу, бренду, продавцу и категории",
        "ABC-анализ",
        "XYZ-анализ",
        "Прогноз продаж",
        "Прогноз маржи и прибыли",
        "Тепловая карта продаж",
        "Отслеживание ключевых метрик (дашборд)",
        "Расчёт упущенной (потерянной) выручки",
        "Поиск самых ходовых и прибыльных товаров",
        "Скоринг товаров",
    ]),
    ("Аналитика конкурентов и ниш", [
        "Мониторинг конкурентов (цены, продажи, остатки)",
        "Поиск и анализ прибыльных ниш",
        "Поиск трендовых товаров",
        "Отслеживание трендов рынка",
        "Видимость карточек в категориях",
        "Анализ рекламных стратегий конкурентов",
        "Нейросеть для подбора ниш",
    ]),
    ("Финансы и юнит-экономика", [
        "Расчёт чистой прибыли и рентабельности",
        "Расчёт юнит-экономики",
        "Калькулятор прибыли",
        "Отчёт о прибылях и убытках (P&L)",
        "План-факт анализ",
        "Учёт расходов, комиссий, логистики и хранения",
        "Контроль выплат Wildberries",
        "Движение денег",
        "Расчёт выкупаемости",
        "Анализ себестоимости",
    ]),
    ("Склад и поставки", [
        "Контроль остатков в реальном времени",
        "Расчёт и планирование поставок по складам",
        "Раскладка по складам",
        "Анализ оборачиваемости",
        "Управление закупками",
        "Логистика и контроль лимитов на складах",
    ]),
    ("Реклама и продвижение", [
        "Биддер / автобиддер (автоуправление ставками)",
        "Аналитика эффективности рекламы",
        "Анализ органического и рекламного трафика",
        "Анализ внешнего трафика",
        "Прогноз просмотров",
        "Ставки для вывода в топ",
    ]),
    ("SEO и карточки товара", [
        "Подбор и кластеризация ключевых запросов",
        "Отслеживание позиций в поиске",
        "SEO-оптимизация и адаптация карточек",
        "AI-генератор описаний",
        "AI-фотограф (генерация изображений карточки)",
        "AI-анализ карточек",
    ]),
    ("CRM: работа с клиентами и отзывами", [
        "Автоответы на отзывы по шаблонам",
        "Управление рейтингом магазина",
        "Лента и мониторинг отзывов и вопросов",
        "Контроль скорости реакции на отзывы",
        "Управление из единого кабинета (WB / Ozon / Я.Маркет)",
    ]),
    ("Управление ценами", [
        "Репрайсер (автоматическая корректировка цен)",
        "Контроль и оптимизация цен",
        "Мониторинг цен конкурентов",
    ]),
    ("Контроль операций и прочее", [
        "Лента заказов и возвратов в реальном времени",
        "География заказов",
        "Контроль самовыкупов",
        "Уведомления (Telegram-боты)",
        "Плагины / расширения для браузера (Chrome)",
        "Мобильное приложение",
        "Поддержка дропшиппинга",
        "Аудит магазина",
    ]),
]

doc = Document()

# Базовый шрифт
style = doc.styles['Normal']
style.font.name = 'Calibri'
style.font.size = Pt(11)

# Заголовок
title = doc.add_heading('Сервисы аналитики и CRM для Wildberries', level=0)
sub = doc.add_paragraph('Сравнительная матрица функций (уникальный список, без повторов и названий сервисов)')
sub.runs[0].italic = True
sub.runs[0].font.color.rgb = RGBColor(0x66, 0x66, 0x66)

total = sum(len(items) for _, items in DATA)
meta = doc.add_paragraph(f'Категорий: {len(DATA)}    •    Уникальных функций: {total}    •    Дата: 24.06.2026')
meta.runs[0].font.size = Pt(9)
meta.runs[0].font.color.rgb = RGBColor(0x88, 0x88, 0x88)

doc.add_paragraph()

def shade_cell(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)

def set_cell_text(cell, text, bold=False, color=None, size=11, white=False):
    cell.text = ''
    p = cell.paragraphs[0]
    run = p.add_run(text)
    run.bold = bold
    run.font.size = Pt(size)
    if white:
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    elif color:
        run.font.color.rgb = color

# Таблица: №, Категория, Функция
table = doc.add_table(rows=1, cols=3)
table.style = 'Light Grid Accent 1'
table.alignment = WD_TABLE_ALIGNMENT.CENTER

hdr = table.rows[0].cells
for i, h in enumerate(['№', 'Категория', 'Функция']):
    set_cell_text(hdr[i], h, bold=True, white=True, size=11)
    shade_cell(hdr[i], '4472C4')

n = 0
for cat, items in DATA:
    for j, func in enumerate(items):
        n += 1
        row = table.add_row().cells
        set_cell_text(row[0], str(n), size=10, color=RGBColor(0x88,0x88,0x88))
        # Категорию пишем только в первой строке группы, иначе пусто (слияние визуально)
        set_cell_text(row[1], cat if j == 0 else '', bold=(j == 0), size=10,
                      color=RGBColor(0x1F,0x38,0x64))
        set_cell_text(row[2], func, size=10)
        # лёгкая зебра по категориям
        if (DATA.index((cat, items)) % 2) == 1:
            for c in row:
                shade_cell(c, 'F2F5FB')

# Ширины колонок
for row in table.rows:
    row.cells[0].width = Inches(0.4)
    row.cells[1].width = Inches(2.4)
    row.cells[2].width = Inches(4.0)

doc.add_paragraph()
note = doc.add_paragraph(
    'Источники: МойСклад, Uniseller, MPAgency, DTF, Optomus. '
    'Список собран по обзорам топовых сервисов (MPSTATS, MarketGuru, Moneyplace, Анабар, '
    'Маяк, EGGHEADS и др.); функции дедуплицированы.'
)
note.runs[0].font.size = Pt(8)
note.runs[0].font.color.rgb = RGBColor(0x99, 0x99, 0x99)

out = '/home/user/WBTEST/WB_сервисы_функции_матрица.docx'
doc.save(out)
print('Saved:', out, 'rows:', n)
