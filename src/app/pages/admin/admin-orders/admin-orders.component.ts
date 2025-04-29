import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrderDetailsBottomSheetComponent } from '../../../pages/user-orders/order-details-bottom-sheet/order-details-bottom-sheet.component';
import { TelegramService } from '../../../services/telegram.service';
import { OrdersService } from '../../../services/orders.service';
import {PriceFormatterService} from "../../../services/price-formatter.service";

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss']
})
export class AdminOrdersComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private telegramService = inject(TelegramService);
  private bottomSheet = inject(MatBottomSheet);
  ordersService = inject(OrdersService);
  public priceFormatter = inject(PriceFormatterService);

  orders: any[] = [];
  filteredOrders: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;
  error: boolean = false;
  errorMessage: string = '';

  private ordersSubscription?: Subscription;

  ngOnInit(): void {
    const user = this.telegramService.telegramUser || {};

    if (!user.isAdmin) {
      this.navigateToBack();
      return;
    }

    this.setupTelegramButtons();

    // Загружаем все заказы
    this.loadOrders();
  }

  ngOnDestroy(): void {
    // Отписываемся от подписки на заказы при уничтожении компонента
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }

    // Скрываем кнопку "Назад" в Telegram WebApp
    if (this.telegramService.webApp) {
      this.telegramService.hideBackButton();
    }

    this.telegramService.cleanup();
    this.telegramService.hideAllButtons();
    this.telegramService.hideBackButton();
  }

  setupTelegramButtons(): void {
    if (this.telegramService.webApp) {
      // Настройка кнопки "Назад"
      this.telegramService.backButtonClickHandler = this.navigateToBack.bind(this);
      this.telegramService.showBackButton(this.telegramService.backButtonClickHandler);
    }
  }

  private navigateToBack(): void {
    this.router.navigate(['/main']).then(r => {});
  }

  loadOrders(): void {
    this.isLoading = true;
    this.error = false;

    this.ordersSubscription = this.ordersService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.filteredOrders = [...orders];
        this.isLoading = false;

        console.log('Заказы загружены:', orders);
      },
      error: (err) => {
        console.error('Ошибка при загрузке заказов:', err);
        this.isLoading = false;
        this.error = true;
        this.errorMessage = 'Не удалось загрузить заказы. Пожалуйста, попробуйте позже.';
      }
    });
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredOrders = [...this.orders];
      return;
    }

    const searchTerm = this.searchTerm.toLowerCase();

    this.filteredOrders = this.orders.filter(order => {
      // Поиск по ID заказа
      const orderId = order.id.toLowerCase();

      // Поиск по названию услуги
      const categoryTitle = order.category?.title?.toLowerCase() || '';

      // Поиск по имени пользователя
      const userName = this.getUserName(order.user).toLowerCase();

      // Поиск по статусу заказа
      const status = this.ordersService.getStatusText(order.status).toLowerCase();

      return orderId.includes(searchTerm) ||
             categoryTitle.includes(searchTerm) ||
             userName.includes(searchTerm) ||
             status.includes(searchTerm);
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredOrders = [...this.orders];
  }

  getUserName(user: any): string {
    if (!user) return 'Неизвестный пользователь';

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.username) {
      return '@' + user.username;
    } else if (user.id) {
      return `ID: ${user.id}`;
    }

    return 'Неизвестный пользователь';
  }

  openOrderDetails(order: any): void {
    this.telegramService.cleanup();
    // Открываем bottom sheet с деталями заказа
    const bottomSheetRef = this.bottomSheet.open(OrderDetailsBottomSheetComponent, {
      data: { orderId: order.id, isAdmin: true },
      panelClass: 'bottom-sheet-container'
    });


    // Обрабатываем событие закрытия панели
    bottomSheetRef.afterDismissed().subscribe(() => {
      // Скрываем главную кнопку Telegram после закрытия панели
      // this.telegramService.hideMainBtn();
    });
  }
}
