import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ICategory } from '../../interfaces/icategory';
import { PaymentService } from '../../services/payment.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TelegramService } from '../../services/telegram.service';
@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterModule]
})
export class OrderComponent implements OnInit, OnDestroy {
  category: ICategory | undefined;

  // Здесь для упрощения используется локальный массив категорий.
  // В реальном приложении стоит получать данные через специализированный сервис.
  categories: ICategory[] = [
      { id: 1, title: 'Онлайн/офлайн консультации', price: 1000 },
      { id: 2, title: 'Консультации + разбор гардероба', price: 1500 },
      { id: 3, title: 'Консультация + шоппинг', price: 2000 },
      { id: 4, title: 'Комплексная работа по стилю', price: 3000 },
      { id: 5, title: 'Подбор образа под мероприятие', price: 1800 },
      { id: 6, title: 'Подготовка к съемке', price: 2200 },
      { id: 7, title: 'Ознакомительный шоппинг', price: 1200 }
  ];

  // Store reference to the main button click handler
  private mainButtonClickHandler: () => void = () => {};

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private router: Router,
    private telegramService: TelegramService
  ) {}

  ngOnInit(): void {
    const categoryId = Number(this.route.snapshot.paramMap.get('id'));
    this.category = this.categories.find(cat => cat.id === categoryId);

    // Setup Telegram main button if available
    const webApp = window.Telegram?.WebApp;
    if (webApp && this.category) {
      webApp.MainButton.setText(`Оплатить ${this.category.price} руб`);
      webApp.MainButton.show();
      this.mainButtonClickHandler = () => this.pay();
      webApp.onEvent('mainButtonClicked', this.mainButtonClickHandler);
    }
  }

  ngOnDestroy(): void {
    // Clean up Telegram main button
    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      webApp.offEvent('mainButtonClicked', this.mainButtonClickHandler);
      webApp.MainButton.hide();
    }
  }

  pay() {
    if (this.category) {
      this.paymentService.createCheckoutSession(this.category).subscribe({
        next: (session: any) => {
          const stripe = (window as any).Stripe('pk_test_51Qx6v0QtKeJeSzyDCPmVC8Qy69HrXVU5eZvehaDu8oSQiTA1f3zkmhY8HMX73pnj3YDvhi7Wx9LQn50yPpNXhrkG003QjkJ3PW');

          this.telegramService.tg?.offEvent('mainButtonClicked', this.mainButtonClickHandler);
          this.telegramService.tg?.MainButton.hide();

          // Теперь переходим на страницу оплаты Stripe
          stripe.redirectToCheckout({
            sessionId: session.id
          }).then((result: any) => {
            if (result.error) {
              console.error('Ошибка редиректа на Stripe:', result.error.message);
            }
          });
        },
        error: (error: any) => {
          console.error('Ошибка при создании сессии оплаты:', error);
          // Здесь можно добавить отображение ошибки пользователю
        }
      });
    }
  }

  sendMessage() {
    this.telegramService.sendMessage(210311255, this.categories[0])
    .subscribe((res) => {
        console.log(res);
    });
    this.telegramService.sendMessage2(210311255, this.categories[0])
    .subscribe((res) => {
        console.log(res);
    });
  }
} 