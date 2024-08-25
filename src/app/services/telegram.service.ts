import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from "@angular/common";

declare global {
  interface Window {
    Telegram: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class TelegramService {
  private telegramApiUrl = 'https://api.telegram.org/bot7099494198:AAENkHpK0OKo436__qqgVYsg4WC14_heTd8';
  window;
  tg;
  constructor(@Inject(DOCUMENT) private _document: Document) {
    this.window = this._document.defaultView;
    this.tg = this.window!.Telegram.WebApp;

    console.log(this.tg.MainButton);

    this.tg.MainButton.setText('Main button text');
    // this.tg.MainButton.textColor = "#ffffff";
    // this.tg.MainButton.color = "#31b445";
    this.tg.MainButton.show();

    // По умолчанию во весь экран
    this.tg.expand();
    this.tg.isClosingConfirmationEnabled = true;

  }


}
