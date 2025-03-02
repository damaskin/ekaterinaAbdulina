import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { ITelegramWebAppData, User } from "../interface/telegram-web-app-data";
import { TranslateService } from "@ngx-translate/core";
import { ITelegramUser } from "../interface/telegram-user";
import { FirebaseService } from "./firebase.service";
import { Observable, forkJoin, of } from 'rxjs';
import { HttpClient } from "@angular/common/http";

declare global {
  interface Window {
    Telegram: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class TelegramService {
  window;
  tg;
  webAppData!: ITelegramWebAppData;
  telegramUser!: ITelegramUser;
  private botToken: string = '7704154428:AAHdcik32zNrRNqvNE4KGGUl5lzT3buYWTA'; // токен вашего телеграм-бота
  private telegramApiUrl = 'https://api.telegram.org/bot7704154428:AAHdcik32zNrRNqvNE4KGGUl5lzT3buYWTA';
  // ID администраторов для уведомлений
  private adminUserIds: number[] = [112004130, 210311255];

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private translate: TranslateService,
    private readonly firebaseService: FirebaseService,
    private http: HttpClient
  ) {
    this.window = this._document.defaultView;
    this.tg = this.window?.Telegram?.WebApp;

    // Если мы запускаемся внутри Telegram, сохраняем данные пользователя
    if (this.tg && this.tg.initDataUnsafe && this.tg.initDataUnsafe.user) {
      // Расширяем окно, отключаем вертикальные свайпы и включаем подтверждение закрытия
      this.tg.expand();
      this.tg.disableVerticalSwipes();
      this.tg.isClosingConfirmationEnabled = true;

      // Сохраняем данные пользователя в localStorage для последующего восстановления
      localStorage.setItem('userData', JSON.stringify(this.tg.initDataUnsafe.user));

      // Устанавливаем язык для переводов
      this.translate.use(this.tg.initDataUnsafe.user.language_code);
    }

    // Инициализируем данные пользователя: если запустились вне Telegram, попробуем восстановить их из localStorage
    this.initUser();
  }

  getTelegramWebAppData(): any {
    if (this.tg && this.tg.initDataUnsafe) {
      return this.tg.initDataUnsafe.user || null;
    }
    return null;
  }

  showMainBtn(text: string = 'Main button text') {
    if (this.tg) {
      this.tg.MainButton.setText(text);
      this.tg.MainButton.show();
    }
  }

  hideMainBtn() {
    if (this.tg) {
      this.tg.MainButton.hide();
    }
  }

  getClientPlatform(): string {
    return this.tg ? this.tg.platform : 'unknown';
  }

  initUser(): ITelegramUser | User {
    const clientPlatform = this.getClientPlatform();
    const userData = localStorage.getItem('userData');

    // Если клиентская платформа неизвестна (например, после редиректа с платежной системы),
    // пытаемся восстановить данные из localStorage
    if (clientPlatform === 'unknown') {
      if (!userData) {
        return {} as User;
      } else {
        this.telegramUser = JSON.parse(userData);
        this.saveTelegramUser(this.telegramUser);
        return this.telegramUser;
      }
    } else {
      // Если мы внутри Telegram, берем данные напрямую
      this.telegramUser = this.tg.initDataUnsafe.user;
      this.saveTelegramUser(this.telegramUser);
      return this.telegramUser;
    }
  }

  saveTelegramUser(user: ITelegramUser) {
    this.firebaseService.saveUser(user).catch((err) => {
      console.error('Error saving user:', err);
    });
  }

  // Отправляем сообщение пользователю
  public sendMessage(chat_id: number, category: { title: string, price: number }): Observable<any> {
    const text = `Здравствуйте, ${this.telegramUser.first_name}!

Ваш платёж за услугу «${category.title}», стоимостью ${category.price} руб, успешно выполнен.

Благодарим за использование наших услуг!`;

    const body = {
      chat_id,
      text,
      parse_mode: 'HTML'
    };
    console.log('Отправка сообщения:', body);
    return this.http.post(`${this.telegramApiUrl}/sendMessage`, body);
  }

  public sendMessage2(chat_id: number, category: { title: string, price: number }): Observable<any> {
    const text = `Здравствуйте, Екатерина!
Ваш клиент "Raynor" оплатил услугу «${category.title}», стоимостью ${category.price} руб.`;

    const body = {
      chat_id,
      text,
      parse_mode: 'HTML'
    };
    console.log('Отправка сообщения:', body);
    return this.http.post(`${this.telegramApiUrl}/sendMessage`, body);
  }

  // Отправляем уведомление администраторам о статусе заказа "оплачен"
  public sendOrderPaidNotificationsToAdmins(order: any): Observable<any[]> {
    if (!order) {
      console.error('Нет данных заказа для отправки уведомления');
      return of([]);
    }

    const user = order.user || this.telegramUser;
    const category = order.category;
    const orderId = order.id;
    const paymentMethod = order.paymentMethod;
    const paymentAmount = category ? category.price : 'Неизвестно';

    // Формируем текст сообщения с деталями заказа
    const text = `🔔 Новый оплаченный заказ!
    
📋 Детали заказа:
ID: ${orderId}
Услуга: ${category ? category.title : 'Неизвестно'}
Сумма: ${paymentAmount} ₽
Метод оплаты: ${paymentMethod || 'Неизвестно'}
Дата: ${new Date().toLocaleString('ru-RU')}

👤 Информация о клиенте:
ID: ${user.id || 'Неизвестно'}
Имя: ${user.first_name || ''} ${user.last_name || ''}
Имя пользователя: ${user.username ? '@' + user.username : 'Не указано'}`;

    // Отправляем сообщения всем администраторам
    const notifications = this.adminUserIds.map(adminId => {
      const body = {
        chat_id: adminId,
        text,
        parse_mode: 'HTML'
      };
      console.log(`Отправка уведомления администратору ID ${adminId}:`, body);
      return this.http.post(`${this.telegramApiUrl}/sendMessage`, body);
    });

    // Возвращаем наблюдаемый объект, который завершится после отправки всех уведомлений
    return forkJoin(notifications);
  }

  // Отправка уведомления администраторам о заполненной форме
  public sendFormNotificationToAdmins(formData: any, formId: string, orderId: string | null): Observable<any[]> {
    if (!formData) {
      console.error('Нет данных формы для отправки уведомления');
      return of([]);
    }

    // Создаем текстовое представление формы
    const formText = this.formatFormDataForTelegram(formData, orderId);
    
    // Получаем пользователя из данных формы или из сохраненных данных
    const user = this.telegramUser;
    
    // Получаем URL фотографий для отправки
    const photoUrls = this.extractPhotoUrlsFromForm(formData);
    
    // Подготавливаем данные для отправки
    const notificationData = {
      formId,
      orderId,
      userId: user?.id,
      userName: user?.username || user?.first_name || 'Unknown',
      formText,
      photos: photoUrls
    };
    
    // Отправляем сообщение администраторам
    return this.sendFormDataToAdmins(notificationData);
  }
  
  // Форматирование данных формы для Telegram
  private formatFormDataForTelegram(formData: any, orderId: string | null): string {
    let result = 'Новая анкета\n\n';
    
    // Добавляем информацию о заказе и пользователе
    result += `🔹 ID Заказа: ${orderId || 'Не указан'}\n`;
    result += `🔹 ID Пользователя: ${this.telegramUser?.id || 'Неизвестен'}\n`;
    result += `🔹 Пользователь: ${this.telegramUser?.username || this.telegramUser?.first_name || 'Неизвестен'}\n\n`;
    
    // Добавляем персональную информацию
    result += '👤 Личная информация:\n';
    result += `  - ФИО: ${formData.personalInfo?.fullName || 'Не указано'}\n`;
    result += `  - Возраст: ${formData.personalInfo?.age || 'Не указан'}\n`;
    result += `  - Место жительства: ${formData.personalInfo?.location || 'Не указано'}\n`;
    result += `  - Род деятельности: ${formData.personalInfo?.occupation || 'Не указано'}\n`;
    result += `  - Хобби: ${formData.personalInfo?.hobbies || 'Не указано'}\n`;
    result += `  - Семейное положение: ${formData.personalInfo?.maritalStatus ? 'В браке' : 'Не в браке'}\n\n`;
    
    // Добавляем информацию о стиле
    result += '👔 Стиль и предпочтения:\n';
    result += `  - Обычный образ: ${formData.style?.usualOutfit || 'Не указано'}\n`;
    result += `  - Желаемый стиль: ${formData.style?.desiredStyle || 'Не указано'}\n`;
    result += `  - Предпочитаемые цвета: ${formData.style?.dominantColors || 'Не указано'}\n`;
    result += `  - Предпочитаемые бренды: ${formData.style?.preferredBrands || 'Не указано'}\n`;
    result += `  - Желаемое впечатление: ${formData.style?.desiredImpression || 'Не указано'}\n`;
    result += `  - Стоп-лист вещей: ${formData.style?.stopList || 'Не указано'}\n\n`;
    
    // Дополнительная информация
    result += '📝 Дополнительная информация:\n';
    result += `  - Следит за трендами: ${formData.additional?.followsFashion || 'Не указано'}\n`;
    result += `  - Важные мнения: ${formData.additional?.importantOpinion || 'Не указано'}\n`;
    result += `  - Опыт со стилистом: ${formData.additional?.previousStylist || 'Не указано'}\n`;
    result += `  - Дополнительно: ${formData.additional?.additionalInfo || 'Не указано'}\n`;
    
    return result;
  }
  
  // Извлечение URL фотографий из формы
  private extractPhotoUrlsFromForm(formData: any): string[] {
    const lifePhotos = formData.style?.lifePhotos || [];
    const inspirationPhotos = formData.style?.inspirationPhotos || [];
    
    // Собираем все URL оригинальных изображений
    const photoUrls: string[] = [];
    
    // Добавляем URL из lifePhotos
    lifePhotos.forEach((photo: any) => {
      if (photo.originalUrl) {
        photoUrls.push(photo.originalUrl);
      } else if (photo.url) {
        photoUrls.push(photo.url);
      }
    });
    
    // Добавляем URL из inspirationPhotos
    inspirationPhotos.forEach((photo: any) => {
      if (photo.originalUrl) {
        photoUrls.push(photo.originalUrl);
      } else if (photo.url) {
        photoUrls.push(photo.url);
      }
    });
    
    // Возвращаем не более 10 фотографий
    return photoUrls.slice(0, 10);
  }
  
  // Отправка данных формы администраторам
  private sendFormDataToAdmins(notificationData: any): Observable<any[]> {
    const { formId, orderId, userId, userName, formText, photos } = notificationData;
    
    // Формируем заголовок сообщения
    const title = `📋 ${orderId ? 'Обновлена' : 'Новая'} анкета клиента`;
    
    // Формируем текст сообщения
    const text = `${title}\n\n${formText}`;
    
    // Формируем сообщения для каждого администратора
    const notifications = this.adminUserIds.map(adminId => {
      // Отправляем текстовое сообщение
      const textMessage = this.http.post(`${this.telegramApiUrl}/sendMessage`, {
        chat_id: adminId,
        text,
        parse_mode: 'HTML'
      });
      
      // Если есть фотографии, отправляем их в виде группы (альбома)
      if (photos && photos.length > 0) {
        // API Telegram ограничивает до 10 фото в одной группе, разбиваем на группы если нужно
        const photoGroups: string[][] = [];
        
        // Разбиваем фотографии на группы по 10 штук
        for (let i = 0; i < photos.length; i += 10) {
          photoGroups.push(photos.slice(i, i + 10));
        }
        
        // Создаем запросы для каждой группы фотографий
        const photoGroupRequests = photoGroups.map((group, groupIndex) => {
          // Подготавливаем медиа группу для отправки
          const media = group.map((photoUrl: string, index: number) => {
            return {
              type: 'photo',
              media: photoUrl,
              // Добавляем подпись только к первому фото в первой группе
              caption: (groupIndex === 0 && index === 0) ? 
                `Оригинальные фото из анкеты клиента ${userName} (ID: ${userId})` : '',
              parse_mode: 'HTML'
            };
          });
          
          // Отправляем группу фото
          return this.http.post(`${this.telegramApiUrl}/sendMediaGroup`, {
            chat_id: adminId,
            media: media
          });
        });
        
        // Объединяем текстовое сообщение и все группы фото
        return forkJoin([textMessage, ...photoGroupRequests]);
      } else {
        // Если фотографий нет, отправляем только текстовое сообщение
        return textMessage;
      }
    });
    
    // Объединяем все уведомления в один Observable
    return forkJoin(notifications);
  }
}
