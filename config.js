// Единственный источник тарифов. Все цены в рублях, за один товар.
export const config = {
  brand: 'DXRK', telegram: 'dxrkchxosoff',
  prices: { cover: 1200, slide: 600, styles: { minimal: 0, bold: 300, premium: 500 }, extras: { retouch: 500, copy: 400, adaptation: 600 }, urgentMultiplier: 1.5 },
  styleNames: { minimal: 'Минимализм', bold: 'Яркая инфографика', premium: 'Премиальный' },
  extraNames: { retouch: 'Ретушь фото', copy: 'Тексты для слайдов', adaptation: 'Адаптация под вторую площадку' }
};
export function calculate({slides = 5, style = 'minimal', extras = [], urgent = false} = {}) {
  const count = Math.max(1, Math.min(20, Math.trunc(Number(slides) || 1)));
  const p = config.prices;
  const base = p.cover + (count - 1) * p.slide;
  const styling = p.styles[style] ?? 0;
  const additions = [...new Set(extras)].reduce((sum, key) => sum + (p.extras[key] ?? 0), 0);
  const subtotal = base + styling + additions;
  return { count, base, styling, additions, surcharge: urgent ? Math.round(subtotal * (p.urgentMultiplier - 1)) : 0, total: Math.round(subtotal * (urgent ? p.urgentMultiplier : 1)) };
}
