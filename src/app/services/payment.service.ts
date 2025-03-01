import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, from } from 'rxjs';
import { ICategory } from '../interfaces/icategory';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { TelegramService } from './telegram.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'https://million-sales.ru/api'; // Замените URL на ваш backend

  constructor(
    private http: HttpClient,
    private firestore: Firestore,
    private telegramService: TelegramService
  ) { }

  createCheckoutSession(category: ICategory): Observable<any> {
    // Формируем URL успешной оплаты с учетом нашего хоста
    const successUrl = `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    
    return this.http.post(`${this.apiUrl}/create-checkout-session`, {
      categoryId: category.id,
      price: category.price,
      description: category.title,
      locale: 'ru',
      theme: 'dark',
      success_url: successUrl
    }).pipe(
      switchMap((session: any) => {
        // Сохраняем заказ в Firebase
        return this.saveOrderToFirebase(session, category).then(() => session);
      })
    );
  }

  private saveOrderToFirebase(session: any, category: ICategory): Promise<void> {
    const orderRef = doc(this.firestore, `orders/${session.id}`);
    
    // Получаем информацию о пользователе из Telegram, если доступно
    const user = this.telegramService.tg?.initDataUnsafe?.user || {};
    
    const orderData = {
      orderId: session.id,
      status: 'pending', // Начальный статус заказа
      createdAt: new Date().toISOString(),
      category: {
        id: category.id,
        title: category.title,
        price: category.price
      },
      user: {
        id: user.id || null,
        username: user.username || null,
        firstName: user.first_name || null,
        lastName: user.last_name || null
      },
      paymentMethod: 'stripe'
    };
    
    return setDoc(orderRef, orderData);
  }
} 