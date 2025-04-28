import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IUser } from '../../interfaces/user.interface';
import { TelegramService } from '../../services/telegram.service';
import { OrdersService } from '../../services/orders.service';

@Component({
  standalone: true,
  selector: 'app-user-details-sheet',
  templateUrl: './user-details-sheet.component.html',
  styleUrls: ['./user-details-sheet.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ]
})
export class UserDetailsSheetComponent implements OnInit, OnDestroy {
  userOrders: any[] = [];
  loadingOrders = true;
  ordersError = false;
  errorMessage = '';

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: IUser,
    private bottomSheetRef: MatBottomSheetRef<UserDetailsSheetComponent>,
    private telegramService: TelegramService,
    private ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    this.setupMainButton();
    this.loadUserOrders();
  }

  ngOnDestroy(): void {
    this.telegramService.cleanup();
    this.telegramService.hideAllButtons();
  }

  setupMainButton(): void {
    if (this.telegramService.webApp) {
      // Настройка MainButton
      this.telegramService.webApp.MainButton.setText('ОК');
      this.telegramService.webApp.MainButton.show();

      // Обработчик нажатия
      this.telegramService.webApp.MainButton.onClick(() => {
        this.close();
      });
    }
  }

  loadUserOrders(): void {
    this.loadingOrders = true;
    this.ordersError = false;

    this.ordersService.getUserOrdersByTelegramId(this.data.id).subscribe({
      next: (orders) => {
        this.userOrders = orders.filter(order => order.status === 'paid' || order.status === 'completed');
        this.loadingOrders = false;
      },
      error: (error) => {
        console.error('Ошибка при загрузке заказов пользователя:', error);
        this.loadingOrders = false;
        this.ordersError = true;
        this.errorMessage = 'Не удалось загрузить заказы пользователя';
      }
    });
  }

  close(): void {
    this.telegramService.cleanup();
    this.bottomSheetRef.dismiss();
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return `${price} ₽`;
  }

  getStatusText(status: string): string {
    return this.ordersService.getStatusText(status);
  }

  getStatusClass(status: string): string {
    return this.ordersService.getStatusClass(status);
  }
}
