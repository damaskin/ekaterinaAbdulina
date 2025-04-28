import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { ITelegramWebAppData, User } from "../interface/telegram-web-app-data";
import { TranslateService } from "@ngx-translate/core";
import { ITelegramUser } from "../interface/telegram-user";
import { FirebaseService } from "./firebase.service";
import { Observable, forkJoin, of } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { WebApp } from '@twa-dev/types';

declare global {
  interface Window {
    Telegram: any;
  }
}

interface FormPhoto {
  url: string;
  fieldId: string;
  fieldLabel: string;
}

@Injectable({
  providedIn: 'root'
})
export class TelegramService {
  webAppData!: ITelegramWebAppData;
  telegramUser!: ITelegramUser;
  private botToken: string = '7704154428:AAHdcik32zNrRNqvNE4KGGUl5lzT3buYWTA'; // токен вашего телеграм-бота
  private telegramApiUrl = 'https://api.telegram.org/bot7704154428:AAHdcik32zNrRNqvNE4KGGUl5lzT3buYWTA';
  // ID администраторов для уведомлений
  private adminUserIds: number[] = [112004130, 210311255];
  public webApp: WebApp = window.Telegram.WebApp;

  private mainButtonHandler: VoidFunction | null = null;
  private secondaryButtonHandler: VoidFunction | null = null;
  private backButtonHandler: VoidFunction | null = null;
  private settingsButtonHandler: VoidFunction | null = null;

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private translate: TranslateService,
    private readonly firebaseService: FirebaseService,
    private http: HttpClient
  ) {

    // Если мы запускаемся внутри Telegram, сохраняем данные пользователя
    if (this.webApp && this.webApp.initDataUnsafe && this.webApp.initDataUnsafe.user) {
      // Расширяем окно, отключаем вертикальные свайпы и включаем подтверждение закрытия
      this.webApp.expand();
      this.webApp.disableVerticalSwipes();
      this.webApp.isClosingConfirmationEnabled = true;

      // Сохраняем данные пользователя в localStorage для последующего восстановления
      localStorage.setItem('userData', JSON.stringify(this.webApp.initDataUnsafe.user));

      // Устанавливаем язык для переводов
      this.translate.use(this.webApp.initDataUnsafe.user.language_code!);
    }

    // Инициализируем данные пользователя: если запустились вне Telegram, попробуем восстановить их из localStorage
    this.initUser();
  }

  init(): void {
    this.webApp.ready();
    this.webApp.expand();
  }

  cleanup(): void {
    // Очищаем обработчики событий
    if (this.mainButtonHandler) {
      this.webApp.offEvent('mainButtonClicked', this.mainButtonHandler);
      this.mainButtonHandler = null;
    }
    if (this.secondaryButtonHandler) {
      this.webApp.offEvent('secondaryButtonClicked', this.secondaryButtonHandler);
      this.secondaryButtonHandler = null;
    }
    if (this.backButtonHandler) {
      this.webApp.offEvent('backButtonClicked', this.backButtonHandler);
      this.backButtonHandler = null;
    }
    if (this.settingsButtonHandler) {
      this.webApp.offEvent('settingsButtonClicked', this.settingsButtonHandler);
      this.settingsButtonHandler = null;
    }
  }

  getWebApp(): WebApp {
    return this.webApp;
  }

  getUser(): any {
    return this.webApp.initDataUnsafe.user;
  }

  getUserId(): string {
    return this.telegramUser?.id?.toString() || '';
  }

  getUserName(): string {
    return this.telegramUser?.first_name || '';
  }

  getUserPhone(): string {
    return this.telegramUser?.phone_number || '';
  }

  isAdmin(): boolean {
    const userId = this.getUserId();
    return userId === '123456789'; // Замените на реальный ID администратора
  }

  showMainButton(text: string, callback: VoidFunction): void {
    this.mainButtonHandler = callback;
    this.webApp.MainButton.setText(text);
    this.webApp.MainButton.show();
    this.webApp.MainButton.onClick(callback);
  }

  showSecondaryButton(text: string, callback: VoidFunction): void {
    this.secondaryButtonHandler = callback;
    this.webApp.SecondaryButton.setText(text);
    this.webApp.SecondaryButton.show();
    this.webApp.SecondaryButton.onClick(callback);
  }

  hideAllButtons(): void {
    this.hideMainButton();
    this.hideSecondaryButton();
  }

  hideMainButton(): void {
    this.webApp.MainButton.hide();
  }

  hideSecondaryButton(): void {
    this.webApp.SecondaryButton.hide();
  }

  showBackButton(callback: VoidFunction): void {
    this.backButtonHandler = callback;
    this.webApp.BackButton.show();
    this.webApp.BackButton.onClick(callback);
  }

  hideBackButton(): void {
    this.webApp.BackButton.hide();
  }

  showSettingsButton(callback: VoidFunction): void {
    this.settingsButtonHandler = callback;
    this.webApp.SettingsButton.show();
    this.webApp.SettingsButton.onClick(callback);
  }

  hideSettingsButton(): void {
    this.webApp.SettingsButton.hide();
  }

  getTelegramWebAppData(): any {
    if (this.webApp && this.webApp.initDataUnsafe) {
      return this.webApp.initDataUnsafe.user || null;
    }
    return null;
  }

  showMainBtn(text: string = 'Main button text') {
    if (this.webApp) {
      this.webApp.MainButton.setText(text);
      this.webApp.MainButton.show();
    }
  }

  hideMainBtn() {
    if (this.webApp) {
      this.webApp.MainButton.hide();
    }
  }

  getClientPlatform(): string {
    return this.webApp ? this.webApp.platform : 'unknown';
  }

  initUser(): ITelegramUser {
    const clientPlatform = this.getClientPlatform();
    const userData = localStorage.getItem('userData');

    console.log(this.webApp);

    // Если клиентская платформа неизвестна (например, после редиректа с платежной системы),
    // пытаемся восстановить данные из localStorage
    if (clientPlatform === 'unknown') {
      if (!userData) {
        return {} as ITelegramUser;
      } else {
        this.telegramUser = JSON.parse(userData);
        this.saveTelegramUser(this.telegramUser);
        return this.telegramUser;
      }
    } else {
      console.log(2);
      // Если мы внутри Telegram, берем данные напрямую
      this.telegramUser = this.webApp?.initDataUnsafe?.user! as ITelegramUser;
      console.log(this.webApp?.initDataUnsafe?.user);

      const storedUser = sessionStorage.getItem('telegramUser');
      if (storedUser && !this.telegramUser) {
        this.telegramUser = JSON.parse(storedUser);
        return this.telegramUser;
      } else {
        this.saveTelegramUser(this.telegramUser);
        return this.telegramUser;
      }

    }
  }

  saveTelegramUser(user: ITelegramUser) {
    console.log(user);
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
  public sendFormNotificationToAdmins(formData: any, formId: string, orderId: string | null, categoryFields: any[]): Observable<any[]> {
    if (!formData) {
      console.error('Нет данных формы для отправки уведомления');
      return of([]);
    }

    // Создаем текстовое представление формы
    const { text, photos } = this.formatFormDataForTelegram(formData, orderId, categoryFields);

    // Получаем пользователя из данных формы или из сохраненных данных
    const user = this.telegramUser;

    // Подготавливаем данные для отправки
    const notificationData = {
      formId,
      orderId,
      userId: user?.id,
      userName: user?.username || user?.first_name || 'Unknown',
      formText: text,
      photos: photos
    };

    // Отправляем сообщение администраторам
    return this.sendFormDataToAdmins(notificationData);
  }

  // Форматирование данных формы для Telegram
  private formatFormDataForTelegram(formData: any, orderId: string | null, fields: any[]): { text: string, photos: FormPhoto[] } {
    let result = '';
    const photos: FormPhoto[] = [];

    // Добавляем информацию о заказе и пользователе
    result += `🔹 ID Заказа: ${orderId || 'Не указан'}\n`;
    result += `🔹 ID Пользователя: ${this.telegramUser?.id || 'Неизвестен'}\n`;
    result += `🔹 Пользователь: ${this.telegramUser?.username || this.telegramUser?.first_name || 'Неизвестен'}\n\n`;

    // Сортируем поля по позиции
    const sortedFields = [...fields].sort((a, b) => a.position - b.position);
    
    sortedFields.forEach(field => {
      const value = formData[field.id];
      
      // Пропускаем пустые значения и неактивные поля
      if (value === null || value === undefined || !field.isActive) return;
      
      if (field.type === 'separator') {
        result += `\n${field.label}\n`;
      } else if (field.type === 'file' && Array.isArray(value) && value.length > 0) {
        result += `  - ${field.label}: ${value.length} шт.\n`;
        // Собираем URL фотографий с информацией о поле
        value.forEach((photo: any) => {
          if (photo.originalUrl) {
            photos.push({
              url: photo.originalUrl,
              fieldId: field.id,
              fieldLabel: field.label
            });
          }
        });
      } else if (field.type === 'checkbox') {
        result += `  - ${field.label}: ${value ? 'Да' : 'Нет'}\n`;
      } else {
        result += `  - ${field.label}: ${value}\n`;
      }
    });

    return { text: result, photos };
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

      // Если есть фотографии, отправляем их группами по полям
      if (photos && photos.length > 0) {
        // Группируем фотографии по полям
        const groupedPhotos = photos.reduce((acc: { [key: string]: FormPhoto[] }, photo: FormPhoto) => {
          if (!acc[photo.fieldId]) {
            acc[photo.fieldId] = [];
          }
          acc[photo.fieldId].push(photo);
          return acc;
        }, {});

        // Отправляем каждую группу фотографий одним сообщением
        const photoGroupRequests = Object.entries(groupedPhotos).map((entry) => {
          const [fieldId, fieldPhotos] = entry as [string, FormPhoto[]];
          const mediaGroup = fieldPhotos.map((photo, index) => ({
            type: 'photo',
            media: photo.url,
            caption: index === 0 ? fieldPhotos[0].fieldLabel : undefined
          }));

          return this.http.post(`${this.telegramApiUrl}/sendMediaGroup`, {
            chat_id: adminId,
            media: mediaGroup
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
