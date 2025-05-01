import { Component, OnInit, OnDestroy } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { YookassaService } from '../../services/yookassa.service';
import { TelegramService } from '../../services/telegram.service';
import { FirebaseService } from '../../services/firebase.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface PaymentDetails {
  id: string;
  description: string;
  orderId: string;
  userId: string;
  categoryId: string;
  createdAt: string;
  amount: {
    value: string;
    currency: string;
  };
  paymentId: string;
  status: string;
  updatedAt: string;
  paymentData: {
    refunded_amount: {
      value: string;
      currency: string;
    };
    id: string;
    amount: {
      value: string;
      currency: string;
    };
    captured_at: string;
    description: string;
    test: boolean;
    status: string;
    payment_method: {
      saved: boolean;
      account_number: string;
      title: string;
      type: string;
      id: string;
      status: string;
    };
    refundable: boolean;
    income_amount: {
      value: string;
      currency: string;
    };
    recipient: {
      account_id: string;
      gateway_id: string;
    };
    paid: boolean;
    metadata: {
      userId: string;
      categoryId: string;
      orderId: string;
    };
    created_at: string;
  };
}

@Component({
  selector: 'app-success-payment',
  templateUrl: './success-payment.component.html',
  styleUrls: ['./success-payment.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    DatePipe
  ]
})
export class SuccessPaymentComponent implements OnInit, OnDestroy {
  paymentId: string = '';
  paymentDetails: PaymentDetails | null = null;
  loading: boolean = true;
  error: string = '';

  // Store reference to the main button click handler
  private mainButtonClickHandler: () => void = () => {};

  // Store reference to the back button click handler
  private backButtonClickHandler: () => void = () => {};
  private orderData: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private telegramService: TelegramService,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit(): void {
    this.paymentId = this.route.snapshot.queryParams['payment_id'];
    if (this.paymentId) {
      this.getPaymentDetails();
    } else {
      this.error = 'ID платежа не найден';
      this.loading = false;
    }

    // Показываем главную кнопку Telegram
    this.telegramService.showMainButton('Заполнить анкету', () => {
      this.router.navigate([`/order/${this.orderData.categoryId}/form`], { queryParams: { orderId: this.orderData.orderId } });
    });
  }

  ngOnDestroy(): void {
    this.telegramService.cleanup();
    this.telegramService.hideAllButtons();
this.telegramService.clearTelegramHandlers();
  }

  async getPaymentDetails(): Promise<void> {
    try {
      const orderData = await this.firebaseService.getOrder(this.paymentId);
      console.log('Данные заказа:', orderData);
      this.orderData = orderData

      if (orderData) {
        this.paymentDetails = orderData;

        if (orderData.categoryId) {
          // Отправляем уведомление в Telegram
          this.telegramService.sendOrderPaidNotificationsToAdmins({
            id: this.paymentId,
            paymentData: this.paymentDetails,
            user: this.telegramService.getUser()
          }).subscribe();

          // Если оплата успешна, показываем кнопку "Заполнить анкету"
          this.setupTelegramButtons(this.paymentId);
        }
      } else {
        this.error = 'Данные заказа не найдены';
      }
    } catch (error) {
      console.error('Ошибка при получении данных заказа:', error);
      this.error = 'Ошибка при получении данных заказа';
    } finally {
      this.loading = false;
    }
  }

  setupTelegramButtons(orderId: string): void {
    if (this.telegramService.webApp && orderId) {
      // Setup Main Button
      this.telegramService.webApp.MainButton.setText(`Заполнить анкету`);
      this.telegramService.webApp.MainButton.show();
      this.mainButtonClickHandler = () => this.navigateToForm(orderId);
      this.telegramService.webApp.onEvent('mainButtonClicked', this.mainButtonClickHandler);

      // Setup Back Button
      this.telegramService.webApp.BackButton.show();
      this.backButtonClickHandler = () => this.navigateBack();
      this.telegramService.webApp.onEvent('backButtonClicked', this.backButtonClickHandler);
    }
  }

  // Переход к форме анкеты с передачей ID заказа
  navigateToForm(orderId: string): void {
    console.log('Переход к форме анкеты с передачей ID заказа:', orderId);
    console.log('Переход к форме анкеты с передачей ID заказа:', this.paymentId);
    // this.router.navigate([`/order/${this.paymentId}/form`], { queryParams: { orderId: orderId } });
  }

  navigateBack(): void {
    this.router.navigate(['/main']);
  }
}
