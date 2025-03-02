export interface IUser {
  fullName: string;
  isPremium: boolean;
   /** Дата авторизации в виде Unix timestamp */
   auth_date: number;

   /** Имя пользователя */
   first_name: string;
   last_name: string;
 
   /** Хеш, используемый для проверки целостности данных */
   hash: string;
 
   /** Уникальный идентификатор пользователя в Telegram */
   id: string;
 
   /** URL фотографии профиля пользователя */
   photo_url?: string;
 
   /** Имя пользователя в Telegram (если есть) */
   username?: string;
 
   /** Является ли пользователь администратором */
   isAdmin?: boolean;
 
   /** Является ли пользователь активным */
   isActive?: boolean;

   /** Дата создания пользователя в виде Unix timestamp */
   created_at?: string;

   /** Язык пользователя */
   language_code?: string;

   /** Дата последнего входа в виде Unix timestamp */
   lastLoginDate?: string;
} 