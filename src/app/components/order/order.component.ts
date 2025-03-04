import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IMaskModule } from 'angular-imask';
import { IMaskPipe } from 'angular-imask';
import { MASKS } from '../../masks/mask-config';
import {ICategory} from "../../interfaces/icategory";
import {ActivatedRoute, Router} from "@angular/router";
import {PaymentService} from "../../services/payment.service";
import {TelegramService} from "../../services/telegram.service";
import {PriceFormatterService} from "../../services/price-formatter.service";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  standalone: true,
  imports: [
    CommonModule,
    IMaskModule,
    IMaskPipe
  ]
})
export class OrderComponent implements OnInit, OnDestroy {
  category!: ICategory;

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

  // Store reference to the back button click handler
  private backButtonClickHandler: () => void = () => {};

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private router: Router,
    private telegramService: TelegramService,
    public priceFormatter: PriceFormatterService
  ) {}

  ngOnInit(): void {
    const categoryId = Number(this.route.snapshot.paramMap.get('id'));
    this.category = this.categories.find(cat => cat.id === categoryId)!;

    // Setup Telegram WebApp
    if (this.telegramService.tg) {
      // Setup Main Button
      if (this.category) {
        this.telegramService.tg.MainButton.setText(`Оплатить ${this.priceFormatter.formatPrice(this.category.price)}`);
        this.telegramService.tg.MainButton.show();
        this.mainButtonClickHandler = () => this.pay();
        this.telegramService.tg.onEvent('mainButtonClicked', this.mainButtonClickHandler);
      }

      // Setup Back Button
      this.telegramService.tg.BackButton.show();
      this.backButtonClickHandler = () => this.navigateBack();
      this.telegramService.tg.onEvent('backButtonClicked', this.backButtonClickHandler);
    }
  }

  ngOnDestroy(): void {
    // Clean up Telegram buttons
    if (this.telegramService.tg) {
      // Clean up Main Button
      this.telegramService.tg.offEvent('mainButtonClicked', this.mainButtonClickHandler);
      this.telegramService.tg.MainButton.hide();

      // Clean up Back Button
      this.telegramService.tg.offEvent('backButtonClicked', this.backButtonClickHandler);
      this.telegramService.tg.BackButton.hide();
    }
  }

  navigateBack(): void {
    this.router.navigate(['/main']);
  }

  pay() {
    if (this.category) {
      // Показываем индикатор загрузки и блокируем кнопку
      if (this.telegramService.tg) {
        this.telegramService.tg.MainButton.showProgress(true);
        this.telegramService.tg.MainButton.disable();
      }

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

              // В случае ошибки восстанавливаем кнопку
              if (this.telegramService.tg) {
                this.telegramService.tg.MainButton.hideProgress();
                this.telegramService.tg.MainButton.enable();
                this.telegramService.tg.onEvent('mainButtonClicked', this.mainButtonClickHandler);
              }
            }
          });
        },
        error: (error: any) => {
          console.error('Ошибка при создании сессии оплаты:', error);

          // В случае ошибки восстанавливаем кнопку
          if (this.telegramService.tg) {
            this.telegramService.tg.MainButton.hideProgress();
            this.telegramService.tg.MainButton.enable();
          }

          // Показываем ошибку пользователю
          if (this.telegramService.tg) {
            this.telegramService.tg.showPopup({
              title: 'Ошибка',
              message: 'Произошла ошибка при создании сессии оплаты. Пожалуйста, попробуйте позже.',
              buttons: [{ type: 'ok' }]
            });
          }
        }
      });
    }
  }

  sendMessage() {
    // this.telegramService.sendMessage(210311255, this.categories[0])
    // .subscribe((res) => {
    //     console.log(res);
    // });
    // this.telegramService.sendMessage2(210311255, this.categories[0])
    // .subscribe((res) => {
    //     console.log(res);
    // });
  }

  openSuccessPayment() {
    this.router.navigate(['/payment-success'], { queryParams: { session_id: 'cs_test_a1Hqxl19SFlruMCCD5nlpCIbwKHcsGnyFyG1xgaiqLyQCmkA7SAJp4XFSu' } });
  }

  protected readonly MASKS = MASKS;
}
