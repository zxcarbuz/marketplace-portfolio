import {config, calculate} from './config.js';
export const money = value => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
export function composeOrder(selected) {
  const result = calculate(selected);
  return [
    'Здравствуйте! Хочу обсудить дизайн карточек.',
    `Площадка: ${selected.platform}`,
    `Один товар, слайдов: ${result.count}`,
    `Стиль: ${config.styleNames[selected.style]}`,
    `Дополнительно: ${selected.extras.map(key => config.extraNames[key]).join(', ') || 'без допуслуг'}`,
    `Срочность: ${selected.urgent ? 'нужна, обсудим срок' : 'обычная'}`,
    `Предварительная стоимость: ${money(result.total)}`,
    selected.comment ? `О товаре: ${selected.comment}` : '',
    'Понимаю, что окончательные цену и сроки нужно согласовать.'
  ].filter(Boolean).join('\n');
}
export function telegramURL(selected) {
  return `https://t.me/${config.telegram}?text=${encodeURIComponent(composeOrder(selected))}`;
}
