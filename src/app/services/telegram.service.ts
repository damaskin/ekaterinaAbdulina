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
}
