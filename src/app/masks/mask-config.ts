export const MASKS = {
  // Только цифры
  number: { mask: Number },
  // Маска для Фамилия Имя Отчество
  fullName: { mask: /^[А-Яа-яёЁA-Za-z\s]*$/ },
  // Маска для возраста
  age: { mask: '00', min: 18, max: 99 },
  // Маска для место жительства
  location: { mask: /^[А-Яа-яёЁA-Za-z\s]*$/ },
  // Маска для род деятельности
  occupation: { mask: /^[А-Яа-яёЁA-Za-z\s]*$/ },
  // Маска для хобби
  hobbies: { mask: /^[А-Яа-яёЁA-Za-z\s]*$/ },
  // Маска для роста
  height: { mask: Number, min: 100, max: 240 },
  // Маска для размера ноги
  shoeSize: { mask: Number, min: 30, max: 50 },
  // Маска для размера груди
  bust: { mask: Number, min: 30, max: 200 },
  // Маска для обхвата талии
  waist: { mask: Number, min: 30, max: 200 },
  // Маска для обхвата бедер
  hips: { mask: Number, min: 30, max: 200 },
}; 