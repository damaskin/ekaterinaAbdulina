import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { TelegramService } from '../services/telegram.service';
import { Observable, of } from 'rxjs';

export function adminGuard(): Observable<boolean | UrlTree> {
  const telegramService = inject(TelegramService);
  const router = inject(Router);

  // Проверяем, является ли пользователь админом
  const user = telegramService.telegramUser;
  const isAdmin = user?.isAdmin === true;
  
  if (!isAdmin) {
    console.log('Доступ запрещен: пользователь не является администратором');
    // Перенаправляем на главную страницу, если пользователь не админ
    return of(router.createUrlTree(['/']));
  }
  
  console.log('Доступ разрешен: пользователь является администратором');
  return of(true);
} 