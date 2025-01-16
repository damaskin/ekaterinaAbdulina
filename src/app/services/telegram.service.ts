import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from "@angular/common";
import {ITelegramWebAppData, User} from "../interface/telegram-web-app-data";
import {TranslateService} from "@ngx-translate/core";
import {ITelegramUser} from "../interface/telegram-user";
import {FirebaseService} from "./firebase.service";

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

  constructor(@Inject(DOCUMENT) private _document: Document,
              private translate: TranslateService,
              private readonly firebaseService: FirebaseService,) {
    this.window = this._document.defaultView;
    this.tg = this.window!.Telegram.WebApp;

    this.tg.expand();
    this.tg.isClosingConfirmationEnabled = true;

    localStorage.setItem('telegramWebAppData', JSON.stringify(this.tg));

    this.translate.use(this.tg?.initDataUnsafe?.user?.language_code!);
    this.initUser();
  }

  getTelegramWebAppData(): any {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
      return window.Telegram.WebApp.initDataUnsafe.user || null;
    }
    return null;
  }

  showMainBtn(text: string = 'Main button text') {
    this.tg.MainButton.setText(text);
    this.tg.MainButton.show();
  }

  hideMainBtn() {
    this.tg.MainButton.hide();
  }

  getClientPlatform(): string {
    return this.tg.platform;
  }

  initUser(): ITelegramUser | User {
    const clientPlatform = this.getClientPlatform();
    const userData = localStorage.getItem('userData');
    if (clientPlatform === 'unknown') {
      if (!userData) {
        return {} as User;
      } else {
        this.telegramUser = JSON.parse(userData);
        this.saveTelegramUser(this.telegramUser);
        return this.telegramUser;
      }
    } else {
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

}
