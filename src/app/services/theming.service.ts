import {Injectable, signal, inject} from '@angular/core';
import {TelegramService} from "./telegram.service";

type ColorHex = `#${string}`;

type Theme = {
  name: string;
  background: ColorHex;
  primary: ColorHex;
  primaryLight: ColorHex;
  ripple: ColorHex;
  primaryDark: ColorHex;
  error: ColorHex;
};

@Injectable({
  providedIn: 'root',
})
export class ThemingService {

  telegramService = inject(TelegramService);
  primary = signal<ColorHex>(this.telegramService.webApp.themeParams?.button_color as ColorHex);
  primaryLight = signal<ColorHex>(this.telegramService.webApp.themeParams?.secondary_bg_color as ColorHex);
  primaryDark = signal<ColorHex>(this.telegramService.webApp.themeParams?.hint_color as ColorHex);
  background = signal<ColorHex>(this.telegramService.webApp.themeParams?.bg_color as ColorHex);
  ripple = signal<ColorHex>((this.telegramService.webApp.themeParams?.link_color + '1e') as ColorHex);
  error = signal<ColorHex>('#ba1a1a');

  constructor() {
    if (window.Telegram && window.Telegram.WebApp) {
      this.telegramService.webApp?.onEvent('themeChanged', () => {
        this.primary.set(this.telegramService.webApp.themeParams?.button_color as ColorHex);
        this.primaryLight.set(this.telegramService.webApp.themeParams?.secondary_bg_color as ColorHex);
        this.primaryDark.set(this.telegramService.webApp.themeParams?.hint_color as ColorHex);
        this.background.set(this.telegramService.webApp.themeParams?.bg_color as ColorHex);
        this.ripple.set((this.telegramService?.webApp?.themeParams?.link_color + '1e') as ColorHex);
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
      primaryDark: '#000000',
      error: '#ba1a1a',
    },
    {
      name: 'Blue',
      background: '#fbfcfe',
      primary: '#073763',
      primaryLight: '#E6EBEF',
      ripple: '#0737631e',
      primaryDark: '#000000',
      error: '#ba1a1a',
    },
    {
      name: 'Rose',
      background: '#fbfcfe',
      primary: '#7d1135',
      primaryLight: '#f2e7ea',
      ripple: '#7d11351e',
      primaryDark: '#000000',
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

  setPrimary(color: ColorHex) {
    this.primary.set(color);
  }

  setPrimaryLight(color: ColorHex) {
    this.primaryLight.set(color);
  }

  setPrimaryDark(color: ColorHex) {
    this.primaryDark.set(color);
  }

  setRipple(color: ColorHex) {
    this.ripple.set(color);
  }

  setBackground(color: ColorHex) {
    this.background.set(color);
  }

  setError(color: ColorHex) {
    this.error.set(color);
  }

  applyTheme(theme: Theme) {
    const { primary, primaryLight, primaryDark, ripple, background, error } = theme;
    this.primary.set(primary);
    this.primaryLight.set(primaryLight);
    this.primaryDark.set(primaryDark);
    this.background.set(background);
    this.ripple.set(ripple);
    this.error.set(error);
  }
}
