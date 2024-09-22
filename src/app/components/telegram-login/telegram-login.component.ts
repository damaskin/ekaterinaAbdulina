import { Component, inject, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { TelegramService } from "../../services/telegram.service";
import { ITelegramUser } from "../../interface/telegram-user";
import { HttpClient } from '@angular/common/http';
import {AuthService} from "../../../../admin/app/services/auth.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-telegram-login',
  templateUrl: './telegram-login.component.html',
  standalone: true,
  styleUrls: ['./telegram-login.component.scss']
})
export class TelegramLoginComponent implements OnInit {

  router = inject(Router);
  telegramService = inject(TelegramService);
  authService = inject(AuthService);
  http = inject(HttpClient);

  ngOnInit(): void {
    this.telegramService.telegramUser = {} as ITelegramUser;
    this.loadTelegramWidget();
  }

  loadTelegramWidget(): void {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', environment.telegramBotName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-auth-url', 'https://express.a.pinggy.link/api/auth/telegram');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-onauth', `window.onTelegramAuth(user)`);
    document.getElementById('telegram-login-button')?.appendChild(script);

    (window as any).onTelegramAuth = (user: any) => {
      this.handleTelegramAuth(user);
    };
  }

  handleTelegramAuth(user: ITelegramUser): void {
    if (user && user.id) {
      this.authService.authenticateUser(user)
        .subscribe({
          next: (response) => {
            const token = response.token;

            this.authService.setToken(token);
            this.authService.setUser(user);

            this.telegramService.telegramUser = user;

            this.router.navigate(['/main'], { queryParamsHandling: 'merge' })
              .then(r => console.log('Navigation result:', r));
          },
          error: (err) => {
            console.error('Authorization error:', err);
          }
        });
    }
  }

}
