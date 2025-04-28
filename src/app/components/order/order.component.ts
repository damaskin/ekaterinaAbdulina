import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IMaskModule } from 'angular-imask';
import { IMaskPipe } from 'angular-imask';
import { MASKS } from '../../masks/mask-config';
import { ICategory } from "../../interface/category.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {PaymentService} from "../../services/payment.service";
import {TelegramService} from "../../services/telegram.service";
import {PriceFormatterService} from "../../services/price-formatter.service";
import { CategoriesService } from '../../services/categories.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IMaskModule,
    IMaskPipe,
    MatProgressSpinnerModule
  ]
})
export class OrderComponent implements OnInit, OnDestroy {
  category: ICategory | null = null;
  isLoading = false;
  error: string | null = null;

  // Здесь для упрощения используется локальный массив категорий.
  // В реальном приложении стоит получать данные через специализированный сервис.
  categories: ICategory[] = [];

  // Store reference to the main button click handler
  private mainButtonClickHandler: () => void = () => {};

  // Store reference to the back button click handler
  private backButtonClickHandler: () => void = () => {};

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private router: Router,
    private telegramService: TelegramService,
    private categoriesService: CategoriesService,
    public priceFormatter: PriceFormatterService
  ) {}

  ngOnInit(): void {
    const categoryId = this.route.snapshot.paramMap.get('id');
    if (categoryId) {
      this.loadCategory(categoryId);
    }
  }

  loadCategory(categoryId: string): void {
    this.isLoading = true;
    this.categoriesService.getCategory(categoryId).subscribe({
      next: (category) => {
        this.category = category;
        this.setupTelegramButtons();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading category:', error);
        this.error = 'Ошибка загрузки категории';
        this.isLoading = false;
      }
    });
  }

  setupTelegramButtons(): void {
    if (this.telegramService.webApp && this.category) {
      // Setup Main Button
      this.telegramService.webApp.MainButton.setText(`Оплатить ${this.priceFormatter.formatPrice(this.category.price || 0)}`);
      this.telegramService.webApp.MainButton.show();
      this.mainButtonClickHandler = () => this.pay();
      this.telegramService.webApp.onEvent('mainButtonClicked', this.mainButtonClickHandler);

      // Setup Back Button
      this.telegramService.webApp.BackButton.show();
      this.backButtonClickHandler = () => this.navigateBack();
      this.telegramService.webApp.onEvent('backButtonClicked', this.backButtonClickHandler);
    }
  }

  ngOnDestroy(): void {
    this.telegramService.cleanup();
    this.telegramService.hideAllButtons();
  }

  navigateBack(): void {
    this.router.navigate(['/main']);
  }

  pay() {
    if (this.category) {
      // Показываем индикатор загрузки и блокируем кнопку
      if (this.telegramService.webApp) {
        this.telegramService.webApp.MainButton.showProgress(true);
        this.telegramService.webApp.MainButton.disable();
      }

      this.paymentService.createCheckoutSession(this.category).subscribe({
        next: (session: any) => {
          console.log('session, ', session);
          const stripe = (window as any).Stripe('pk_test_51Qx6v0QtKeJeSzyDCPmVC8Qy69HrXVU5eZvehaDu8oSQiTA1f3zkmhY8HMX73pnj3YDvhi7Wx9LQn50yPpNXhrkG003QjkJ3PW');

          this.telegramService.hideAllButtons();

          // Теперь переходим на страницу оплаты Stripe
          stripe.redirectToCheckout({
            sessionId: session.id
          }).then((result: any) => {
            if (result.error) {
              console.error('Ошибка редиректа на Stripe:', result.error.message);

              // В случае ошибки восстанавливаем кнопку
              if (this.telegramService.webApp) {
                this.telegramService.webApp.MainButton.hideProgress();
                this.telegramService.webApp.MainButton.enable();
                this.telegramService.webApp.onEvent('mainButtonClicked', this.mainButtonClickHandler);
              }
            }
          });
        },
        error: (error: any) => {
          console.error('Ошибка при создании сессии оплаты:', error);

          // В случае ошибки восстанавливаем кнопку
          if (this.telegramService.webApp) {
            this.telegramService.webApp.MainButton.hideProgress();
            this.telegramService.webApp.MainButton.enable();
          }

          // Показываем ошибку пользователю
          if (this.telegramService.webApp) {
            this.telegramService.webApp.showPopup({
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
