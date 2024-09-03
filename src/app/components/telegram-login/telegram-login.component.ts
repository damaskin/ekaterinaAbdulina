import {Component, inject, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {TelegramService} from "../../services/telegram.service";
import {ITelegramUser} from "../../interface/telegram-user";

@Component({
  selector: 'app-telegram-login',
  templateUrl: './telegram-login.component.html',
  standalone: true,
  styleUrls: ['./telegram-login.component.scss']
})
export class TelegramLoginComponent implements OnInit {

  router = inject(Router);
  telegramService = inject(TelegramService);

  ngOnInit(): void {
    this.telegramService.telegramUser = {} as ITelegramUser;
    this.loadTelegramWidget();
  }

  loadTelegramWidget(): void {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    // Конфигурация для прода
    // script.setAttribute('data-telegram-login', 'TopCryptoTracker_Bot'); // Замените на имя вашего бота
    // Конфигурация для теста
    script.setAttribute('data-telegram-login', 'WebAppDevelopBot'); // Замените на имя вашего бота
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '10');
    // script.setAttribute('data-auth-url', 'https://express.a.pinggy.link/api/auth/telegram'); // Замените на URL вашего сервера для обработки авторизации
    script.setAttribute('data-request-access', 'write');

    // Используем стрелочную функцию для установки обработчика onauth
    script.setAttribute('data-onauth', `window.onTelegramAuth(user)`);
    //
    document.getElementById('telegram-login-button')?.appendChild(script);

    // Определяем обработчик onTelegramAuth в глобальной области видимости
    (window as any).onTelegramAuth = (user: any) => {
      this.handleTelegramAuth(user);
    };
  }

  handleTelegramAuth(user: ITelegramUser): void {
    if (user && user.id) {
      this.telegramService.telegramUser = user;
      localStorage.setItem('userData', JSON.stringify(user));
      this.router.navigate(['/main'], {queryParamsHandling: 'merge'}).then(r => console.log(r));
    }
  }
}
