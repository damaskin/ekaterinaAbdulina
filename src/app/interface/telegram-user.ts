export interface ITelegramUser {
  /** Дата авторизации в виде Unix timestamp */
  auth_date: number;

  /** Имя пользователя */
  first_name: string;

  /** Хеш, используемый для проверки целостности данных */
  hash: string;

  /** Уникальный идентификатор пользователя в Telegram */
  id: number;

  /** URL фотографии профиля пользователя */
  photo_url?: string;

  /** Имя пользователя в Telegram (если есть) */
  username?: string;
}
