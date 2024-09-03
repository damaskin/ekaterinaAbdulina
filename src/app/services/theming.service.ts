import {Injectable, signal, inject} from '@angular/core';
import {TelegramService} from "./telegram.service";

type Theme = {
  name: string;
  background: string;
  primary: string;
  primaryLight: string;
  ripple: string;
  primaryDark: string;
  error: string;
};

@Injectable({
  providedIn: 'root',
})
export class ThemingService {

  telegramService = inject(TelegramService);
  primary = signal(this.telegramService.tg.themeParams?.button_color);
  primaryLight = signal(this.telegramService.tg.themeParams?.secondary_bg_color);
  primaryDark = signal(this.telegramService.tg.themeParams?.hint_color);
  background = signal(this.telegramService.tg.themeParams?.bg_color);
  ripple = signal(this.telegramService.tg.themeParams?.link_color + '1e');
  error = signal('#ba1a1a');

  constructor() {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.onEvent('themeChanged', () => {
        this.primary.set(this.telegramService.tg.themeParams?.button_color);
        this.primaryLight.set(this.telegramService.tg.themeParams?.secondary_bg_color);
        this.primaryDark.set(this.telegramService.tg.themeParams?.hint_color);
        this.background.set(this.telegramService.tg.themeParams?.bg_color);
        this.ripple.set(this.telegramService.tg.themeParams?.link_color + '1e');
        this.error.set('#ba1a1a');
      });

    }
  }

  definedThemes: Theme[] = [
    {
      name: 'Teal',
      background: '#fbfcfe',
      primary: '#046e8f',
      primaryLight: '#dce3e9',
      ripple: '#005cbb1e',
      primaryDark: 'black',
      error: '#ba1a1a',
    },
    {
      name: 'Blue',
      background: '#fbfcfe',
      primary: '#073763',
      primaryLight: '#E6EBEF',
      ripple: '#0737631e',
      primaryDark: 'black',
      error: '#ba1a1a',
    },
    {
      name: 'Rose',
      background: '#fbfcfe',
      primary: '#7d1135',
      primaryLight: '#f2e7ea',
      ripple: '#7d11351e',
      primaryDark: 'black',
      error: '#ba1a1a',
    },
    {
      name: 'Dark Teal',
      background: '#01212A',
      primary: '#06A7D9',
      primaryLight: '#023747',
      ripple: '#81B6C71e',
      primaryDark: '#a6cbd7',
      error: '#f09494',
    },
  ];

  setPrimary(color: string) {
    this.primary.set(color);
  }

  setPrimaryLight(color: string) {
    this.primaryLight.set(color);
  }

  setPrimaryDark(color: string) {
    this.primaryDark.set(color);
  }

  setRipple(color: string) {
    this.ripple.set(color);
  }

  setBackground(color: string) {
    this.background.set(color);
  }

  setError(color: string) {
    this.error.set(color);
  }

  applyTheme(theme: Theme) {
    const { primary, primaryLight, primaryDark, ripple, background, error } =
      theme;
    this.primary.set(primary);
    this.primaryLight.set(primaryLight);
    this.primaryDark.set(primaryDark);
    this.background.set(background);
    this.ripple.set(ripple);
    this.error.set(error);
  }
}
