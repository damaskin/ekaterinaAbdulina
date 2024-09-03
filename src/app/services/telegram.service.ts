import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from "@angular/common";
import {ITelegramWebAppData, User} from "../interface/telegram-web-app-data";
import {TranslateService} from "@ngx-translate/core";
import {ITelegramUser} from "../interface/telegram-user";

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
              private translate: TranslateService) {
    this.window = this._document.defaultView;
    this.tg = this.window!.Telegram.WebApp;

    // По умолчанию во весь экран
    this.tg.expand();
    this.tg.isClosingConfirmationEnabled = true;

    localStorage.setItem('telegramWebAppData', JSON.stringify(this.tg));

    this.translate.use(this.tg?.initDataUnsafe?.user?.language_code!);
    this.initUser();
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
        return this.telegramUser;
      }
    } else {
      this.telegramUser = this.tg.initDataUnsafe.user;
      return this.telegramUser;
    }
  }

}
