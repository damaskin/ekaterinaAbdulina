import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  DocumentData, 
  Query, 
  orderBy,
  updateDoc
} from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { TelegramService } from './telegram.service';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(
    private firestore: Firestore,
    private telegramService: TelegramService
  ) { }

  // Получение всех заказов текущего пользователя
  getUserOrders(): Observable<any[]> {
    const userId = this.telegramService.telegramUser?.id;
    
    if (!userId) {
      console.error('Пользователь не авторизован');
      return of([]);
    }

    const ordersRef = collection(this.firestore, 'orders');
    const q = query(
      ordersRef,
      where('user.id', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return this.getOrdersFromQuery(q);
  }

  // Получение всех заказов (для админа)
  getAllOrders(): Observable<any[]> {
    const ordersRef = collection(this.firestore, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    
    return this.getOrdersFromQuery(q);
  }

  // Получение детальной информации о заказе
  getOrderDetails(orderId: string): Observable<any> {
    const orderRef = doc(this.firestore, `orders/${orderId}`);
    
    return from(getDoc(orderRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() };
        } else {
          throw new Error('Заказ не найден');
        }
      }),
      catchError(error => {
        console.error('Ошибка при получении деталей заказа:', error);
        throw error;
      })
    );
  }

  // Вспомогательный метод для получения заказов из запроса
  private getOrdersFromQuery(q: Query<DocumentData>): Observable<any[]> {
    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        console.log(querySnapshot);
        
        const orders: any[] = [];
        querySnapshot.forEach(doc => {
          orders.push({
            id: doc.id,
            ...doc.data()
          });
        });
        return orders;
      }),
      catchError(error => {
        console.error('Ошибка при получении заказов:', error);
        return of([]);
      })
    );
  }

  // Получить статус заказа в человекочитаемом формате
  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Ожидает оплату';
      case 'paid':
        return 'Оплачен';
      case 'processing':
        return 'В обработке';
      case 'completed':
        return 'Выполнен';
      case 'cancelled':
        return 'Отменен';
      default:
        return 'Неизвестный статус';
    }
  }

  // Получить класс для отображения статуса
  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'paid':
        return 'status-paid';
      case 'processing':
        return 'status-processing';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  }

  // Обновить статус заказа
  updateOrderStatus(orderId: string, newStatus: string): Observable<any> {
    const orderRef = doc(this.firestore, `orders/${orderId}`);
    
    // Сначала получаем текущий заказ, чтобы проверить его статус
    return from(getDoc(orderRef)).pipe(
      switchMap(docSnap => {
        if (!docSnap.exists()) {
          throw new Error('Заказ не найден');
        }
        
        const orderData = docSnap.data();
        const currentStatus = orderData['status'];
        
        // Если статус не меняется, просто возвращаем текущие данные заказа
        if (currentStatus === newStatus) {
          return of({ id: orderId, ...orderData });
        }
        
        // Обновляем статус заказа
        const updateData = {
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
        
        return from(updateDoc(orderRef, updateData)).pipe(
          switchMap(() => this.getOrderDetails(orderId)),
          tap(order => {
            // Отправляем уведомления только если статус изменился на "paid" с другого статуса
            if (newStatus === 'paid' && currentStatus !== 'paid') {
              this.telegramService.sendOrderPaidNotificationsToAdmins(order).subscribe({
                next: (responses) => {
                  console.log('Уведомления о статусе "оплачен" успешно отправлены', responses);
                },
                error: (err) => {
                  console.error('Ошибка при отправке уведомлений о статусе "оплачен":', err);
                }
              });
            }
          })
        );
      }),
      catchError(error => {
        console.error('Ошибка при обновлении статуса заказа:', error);
        throw error;
      })
    );
  }
} 