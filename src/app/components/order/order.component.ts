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
import { YookassaService } from '../../services/yookassa.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IMaskModule,
    IMaskPipe,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule
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
    private yookassaService: YookassaService,
    private router: Router,
    public telegramService: TelegramService,
    private categoriesService: CategoriesService,
    public priceFormatter: PriceFormatterService
  ) {}

  ngOnInit(): void {
    const categoryId = this.route.snapshot.paramMap.get('id');
    if (categoryId) {
      this.loadCategory(categoryId);
    }
  }

  ngOnDestroy(): void {
    // this.telegramService.cleanup();
    this.telegramService.cleanup();
    this.telegramService.hideAllButtons();
    this.telegramService.hideBackButton();
    this.telegramService.clearTelegramHandlers();
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
      // Настройка кнопки "Назад"
      this.telegramService.backButtonClickHandler = this.navigateBack.bind(this);
      this.telegramService.showBackButton(this.telegramService.backButtonClickHandler);

      // Обработчик нажатия на "Анкета"
      this.telegramService.mainButtonClickHandler = this.pay.bind(this);
      this.telegramService.showMainButton(`Оплатить ${this.priceFormatter.formatPrice(this.category.price || 0)}`, this.telegramService.mainButtonClickHandler);
    }
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

      this.yookassaService.createPayment(this.category, this.telegramService.getUserId()).subscribe({
        next: (payment: any) => {
          console.log('payment, ', payment);
          this.telegramService.hideAllButtons();
          this.telegramService.clearTelegramHandlers();

          // Редирект на страницу оплаты ЮKassa
          if (payment.confirmation && payment.confirmation.confirmation_url) {
            window.location.href = payment.confirmation.confirmation_url;
          }
        },
        error: (error: any) => {
          console.error('Ошибка при создании платежа:', error);

          // В случае ошибки восстанавливаем кнопку
          if (this.telegramService.webApp) {
            this.telegramService.webApp.MainButton.hideProgress();
            this.telegramService.webApp.MainButton.enable();
          }

          // Показываем ошибку пользователю
          if (this.telegramService.webApp) {
            this.telegramService.webApp.showPopup({
              title: 'Ошибка',
              message: 'Произошла ошибка при создании платежа. Пожалуйста, попробуйте позже.',
              buttons: [{ type: 'ok' }]
            });
          }
        }
      });
    }
  }
}
