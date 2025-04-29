import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { ICategory } from '../interface/category.interface';
import { switchMap, tap } from 'rxjs/operators';
import { Firestore, doc, setDoc, updateDoc, collection, addDoc, getDoc, getDocs } from '@angular/fire/firestore';
import { TelegramService } from './telegram.service';

interface IPaymentData {
  id: string;
  status: string;
  paid: boolean;
  amount: {
    value: string;
    currency: string;
  };
  captured_at: string;
  created_at: string;
  description: string;
  payment_method: {
    type: string;
    id: string;
    saved: boolean;
    card?: {
      first6: string;
      last4: string;
      expiry_month: string;
      expiry_year: string;
      card_type: string;
      card_product: {
        code: string;
        name: string;
      };
      issuer_country: string;
      issuer_name: string;
    };
    title: string;
  };
  recipient: {
    account_id: string;
    gateway_id: string;
  };
  refundable: boolean;
  refunded_amount: {
    value: string;
    currency: string;
  };
  test: boolean;
}

export interface IOrderResponse {
  order: {
    id: string;
    status: string;
    paymentData: IPaymentData;
    [key: string]: any;
  };
  payment: IPaymentData;
}

@Injectable({
  providedIn: 'root'
})
export class YookassaService {
  private apiUrl = 'https://million-sales.ru/api-payment';

  constructor(
    private http: HttpClient,
    private firestore: Firestore,
    private telegramService: TelegramService
  ) {}

  createPayment(category: ICategory, userId: string): Observable<any> {
    console.log('1. Начало создания платежа');

    const user = this.telegramService.getUser();

    // Сначала создаем заказ
    return this.saveOrderToFirebase(category).pipe(
      tap(orderId => console.log('2. Заказ создан, ID:', orderId)),
      switchMap((orderId: string) => {
        console.log('3. Подготовка данных для платежа');

        // После создания заказа создаем платеж
        const paymentData = {
          amount: {
            value: (category.price || 0).toString(),
            currency: 'RUB'
          },
          description: category.title,
          categoryId: category.id,
          category: category,
          userId: user.id,
          user: user,
          orderId: orderId
        };

        console.log('4. Отправка данных платежа:', paymentData);
        return this.http.post(`${this.apiUrl}/create-payment`, paymentData).pipe(
          switchMap((payment: any) => {
            console.log('5. Платеж создан:', payment);
            // Обновляем заказ с данными платежа
            return this.updateOrderWithPayment(orderId, payment.id).pipe(
              switchMap(() => of(payment))
            );
          })
        );
      })
    );
  }

  private saveOrderToFirebase(category: ICategory): Observable<string> {
    console.log('1.1. Начало сохранения заказа в Firebase');
    try {
      const ordersCollection = collection(this.firestore, 'orders');
      console.log('1.1.1. Создана коллекция orders');

      const user = this.telegramService.getUser();
      console.log('1.2. Данные пользователя:', user);
      console.log('1.3. Данные категории:', category);

      if (!user || !user.id) {
        console.error('1.4. Ошибка: данные пользователя не найдены');
        return from(Promise.reject('Данные пользователя не найдены'));
      }

      if (!category || !category.id) {
        console.error('1.5. Ошибка: данные категории не найдены');
        return from(Promise.reject('Данные категории не найдены'));
      }

      // Генерируем уникальный ID для заказа
      const orderId = crypto.randomUUID();
      const orderRef = doc(ordersCollection, orderId);

      const orderData = {
        status: 'pending',
        createdAt: new Date().toISOString(),
        categoryId: category.id,
        category: category,
        userId: user.id,
        user: user,
        paymentMethod: 'yookassa',
        orderId: orderId
      };

      console.log('1.6. Данные заказа:', orderData);

      return from(setDoc(orderRef, orderData).then(() => {
        console.log('1.7. Заказ успешно создан в Firebase:', orderId);
        return orderId;
      }).catch(error => {
        console.error('1.8. Ошибка при сохранении заказа:', error);
        console.error('1.8.1. Детали ошибки:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        throw error;
      }));
    } catch (error) {
      console.error('1.9. Критическая ошибка при создании заказа:', error);
      return from(Promise.reject(error));
    }
  }

  private updateOrderWithPayment(orderId: string, paymentId: string): Observable<void> {
    console.log('6.1. Обновление заказа с данными платежа:', { orderId, paymentId });
    const orderRef = doc(this.firestore, 'orders', orderId);
    return from(updateDoc(orderRef, {
      paymentId: paymentId,
      updatedAt: new Date().toISOString()
    }).then(() => {
      console.log('6.2. Заказ успешно обновлен с paymentId:', paymentId);
    }).catch(error => {
      console.error('6.3. Ошибка при обновлении заказа:', error);
      throw error;
    }));
  }

}
