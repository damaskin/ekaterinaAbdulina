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

  public mainButtonClickHandler: () => void = () => {};
  public backButtonClickHandler: () => void = () => {};

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

    this.webApp.onEvent('mainButtonClicked', this.mainButtonClickHandler);
    this.webApp.onEvent('backButtonClicked', this.backButtonClickHandler);
  }

  init(): void {
    this.webApp.ready();
    this.webApp.expand();
  }

  clearTelegramHandlers(): void {
    if (this.webApp) {
      // Удаляем обработчики событий
      this.webApp.offEvent('mainButtonClicked', this.mainButtonClickHandler);
      this.webApp.offEvent('backButtonClicked', this.backButtonClickHandler);

      // Скрываем кнопки
      // this.telegramService.webApp.MainButton.hide();
      // this.telegramService.webApp.BackButton.hide();

      // Очищаем ссылки на обработчики
      this.mainButtonClickHandler = () => {};
      this.backButtonClickHandler = () => {};
    }
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
    this.webApp.MainButton.onClick(this.mainButtonHandler);
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

  showProgressMainBtn() {
    if (this.webApp) {
      this.webApp.MainButton.showProgress(true);
      this.webApp.MainButton.disable();
    }
  }
  hideProgressMainBtn() {
    if (this.webApp) {
      this.webApp.MainButton.hideProgress();
      this.webApp.MainButton.enable();
    }
  }

  getClientPlatform(): string {
    return this.webApp ? this.webApp.platform : 'unknown';
  }

  initUser(): ITelegramUser {
    const clientPlatform = this.getClientPlatform();
    const userData = localStorage.getItem('userData');

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
      // Если мы внутри Telegram, берем данные напрямую
      this.telegramUser = this.webApp?.initDataUnsafe?.user! as ITelegramUser;

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
    this.firebaseService.saveUser(user).catch((err) => {
      console.error('Error saving user:', err);
    });
  }

  // Отправляем уведомление администраторам о статусе заказа "оплачен"
  public sendOrderPaidNotificationsToAdmins(order: any): Observable<any[]> {
    if (!order) {
      console.error('Нет данных заказа для отправки уведомления');
      return of([]);
    }

    const user = order.user || this.telegramUser;
    const paymentData = order.paymentData;
    const orderData = order.orderData;
    const orderId = order.id;

    // Формируем текст сообщения с деталями заказа
    const text = `🔔 Новый оплаченный заказ!

    📋 Детали заказа:
    ID: ${orderId}
    Услуга: ${orderData?.category?.title || 'Неизвестно'}
    Сумма: ${paymentData?.amount?.value || '0'} ₽
    Номер заказа: ${orderId}
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
      return this.http.post(`${this.telegramApiUrl}/sendMessage`, body);
    });

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
      if (value === null || value === undefined || !field.isActive) return;

      if (field.type === 'separator') {
        result += `\n${field.label}\n`;
      } else if (field.type === 'file' && Array.isArray(value) && value.length > 0) {
        result += `  - ${field.label}: ${value.length} шт.\n`;
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
      } else if (field.type === 'color') {
        if (Array.isArray(value)) {
          result += `  - ${field.label}: ${value.map((c: string) => c).join(', ')}\n`;
        } else {
          result += `  - ${field.label}: ${value}\n`;
        }
      } else if (field.type === 'toggle') {
        if (field.allowMultiple && Array.isArray(value)) {
          result += `  - ${field.label}: ${value.join(', ')}\n`;
        } else {
          result += `  - ${field.label}: ${value}\n`;
        }
      } else if (field.type === 'select') {
        if (field.allowMultiple && Array.isArray(value)) {
          result += `  - ${field.label}: ${value.join(', ')}\n`;
        } else {
          result += `  - ${field.label}: ${value}\n`;
        }
      } else if (field.type === 'slider') {
        result += `  - ${field.label}: ${value}${field.unit ? ' ' + field.unit : ''}\n`;
      } else if (field.type === 'diagram') {
        // value — массив значений слайдеров, field.options — массив слайдеров
        if (Array.isArray(value) && Array.isArray(field.options)) {
          result += `  - ${field.label}:\n`;
          field.options.forEach((opt: any, idx: number) => {
            const v = value[idx] ?? '';
            result += `    • ${opt.label}: ${v}${opt.unit ? ' ' + opt.unit : ''}\n`;
          });
        }
      } else if (field.type === 'social') {
        const instagram = formData[field.id + '_instagram'];
        const other = formData[field.id + '_other'];
        if (instagram) result += `  - Instagram: ${instagram}\n`;
        if (other) result += `  - Другое: ${other}\n`;
      } else if (field.type === 'message') {
        // Не добавляем в текст, это просто инфоблок
      } else {
        result += `  - ${field.label}: ${value}\n`;
      }
    });

    return { text: result, photos };
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

  checkMainButtonEvents(): void {
    if (this.webApp) {
      console.log('MainButton события:', {
        mainButtonHandler: this.mainButtonHandler,
        mainButtonClickHandler: this.mainButtonClickHandler,
        isVisible: this.webApp.MainButton.isVisible,
        text: this.webApp.MainButton.text,
        color: this.webApp.MainButton.color,
        textColor: this.webApp.MainButton.textColor,
        isActive: this.webApp.MainButton.isActive,
        isProgressVisible: this.webApp.MainButton.isProgressVisible
      });
      console.log('BackButton события:', {
        backButtonHandler: this.backButtonHandler,
        backButtonClickHandler: this.backButtonClickHandler
      });
    }
  }

  goFullscreen(): void {
    if (this.webApp?.requestFullscreen) {
      this.webApp.requestFullscreen();
    } else {
      console.warn('Полноэкранный режим недоступен');
    }
  }

  /**
   * Подписка на событие изменения полноэкранного режима
   * @param callback (isFullscreen: boolean) => void
   */
  subscribeFullscreenChange(callback: (isFullscreen: boolean) => void): void {
    if (this.webApp?.onEvent) {
      this.webApp.onEvent('fullscreenChanged', (params: any) => {
        callback(!!params);
      });
    }
  }
}
