import { Injectable } from '@angular/core';
import IMask from 'imask';

@Injectable({
  providedIn: 'root'
})
export class PriceFormatterService {

  constructor() {}

  formatPrice(price: number | string): string {
    if (price === undefined || price === null) {
      return '0 руб';
    }

    // Преобразуем входное значение в строку
    const priceStr = price.toString();

    // Создаем экземпляр маски
    const maskOptions = {
      mask: Number,
      thousandsSeparator: ' ',
      radix: ',',
      scale: 0,
      signed: false,
      normalizeZeros: true,
      padFractionalZeros: false,
    };

    // Создаем временный DOM-элемент для применения маски
    const tempInput = document.createElement('input');
    tempInput.value = priceStr;

    // Применяем маску к элементу
    const maskInstance = IMask(tempInput, maskOptions);

    // Получаем отформатированное значение
    const formattedValue = maskInstance.value;

    // Уничтожаем экземпляр маски
    maskInstance.destroy();

    return formattedValue + ' руб';
  }
}
