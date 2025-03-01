import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { Firestore, doc, getDoc, updateDoc, DocumentReference, DocumentData } from '@angular/fire/firestore';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { Observable, from, of } from 'rxjs';
import { TelegramService } from '../../services/telegram.service';

@Component({
  selector: 'app-success-payment',
  templateUrl: './success-payment.component.html',
  styleUrls: ['./success-payment.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ]
})
export class SuccessPaymentComponent implements OnInit {
  loading = true;
  error = false;
  success = false;
  paymentData: any = null;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private firestore: Firestore,
    private telegramService: TelegramService
  ) { }

  ngOnInit(): void {
    // Получаем session_id из URL
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      if (sessionId) {
        this.checkPaymentStatus(sessionId);
      } else {
        this.error = true;
        this.loading = false;
        this.errorMessage = 'Не найден идентификатор сессии оплаты';
      }
    });
  }

  checkPaymentStatus(sessionId: string): void {
    // 1. Сначала получаем заказ из Firebase
    const orderRef = doc(this.firestore, `orders/${sessionId}`) as DocumentReference<DocumentData>;
    
    // Используем from() для преобразования Promise в Observable
    from(getDoc(orderRef)).pipe(
      switchMap(orderSnapshot => {
        console.log('sessionId, ', sessionId);
        console.log('orderSnapshot, ', orderSnapshot);
        
        if (!orderSnapshot.exists()) {
          throw new Error('Заказ не найден');
        }
        
        const orderData = orderSnapshot.data();
        console.log('orderData, ', orderData);
        
        // Сохраняем предыдущий статус заказа
        const previousStatus = orderData['status'];
        
        // 2. Проверяем статус оплаты через API
        return this.http.get(`https://million-sales.ru/api/stripe-check-status/${sessionId}`).pipe(
          switchMap((checkResult: any) => {
            // 3. Обновляем статус в Firebase
            let newStatus = checkResult.status === 'complete' ? 'paid' : 'pending';
            
            // Если статус не изменился, не делаем обновление
            if (previousStatus === newStatus) {
              return of({
                order: {
                  id: sessionId,
                  ...orderData,
                  status: newStatus
                },
                paymentStatus: checkResult.status,
                isPaid: checkResult.status === 'complete',
                statusChanged: false
              });
            }
            
            return from(updateDoc(orderRef, { 
              status: newStatus,
              updatedAt: new Date().toISOString() 
            })).pipe(
              switchMap(() => {
                // Возвращаем объединенные данные
                return of({
                  order: {
                    id: sessionId,
                    ...orderData,
                    status: newStatus
                  },
                  paymentStatus: checkResult.status,
                  isPaid: checkResult.status === 'complete',
                  statusChanged: true,
                  previousStatus: previousStatus
                });
              })
            );
          })
        );
      }),
      catchError(error => {
        console.error('Ошибка при проверке статуса оплаты:', error);
        return of({ error: true, message: error.message });
      })
    ).subscribe((result: any) => {
      this.loading = false;
      
      if (result.error) {
        this.error = true;
        this.errorMessage = result.message || 'Произошла ошибка при проверке статуса оплаты';
      } else {
        this.paymentData = result;
        this.success = result.isPaid;
        
        // Если оплата успешна И статус изменился с не "paid" на "paid"
        if (result.isPaid && result.order && result.statusChanged && result.previousStatus !== 'paid') {
          console.log('Отправка уведомлений администраторам о успешной оплате', result.order);
          this.telegramService.sendOrderPaidNotificationsToAdmins(result.order)
            .subscribe({
              next: (responses) => {
                console.log('Уведомления успешно отправлены', responses);
              },
              error: (err) => {
                console.error('Ошибка при отправке уведомлений:', err);
              }
            });
        } else if (!result.isPaid) {
          this.errorMessage = 'Оплата не была завершена';
        }
      }
    });
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
} 