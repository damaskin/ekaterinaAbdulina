import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { OrdersService } from '../../services/orders.service';
import { TelegramService } from '../../services/telegram.service';
import { OrderDetailsBottomSheetComponent } from './order-details-bottom-sheet/order-details-bottom-sheet.component';

@Component({
  selector: 'app-user-orders',
  templateUrl: './user-orders.component.html',
  styleUrls: ['./user-orders.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatListModule,
    MatExpansionModule,
    MatChipsModule,
    MatBottomSheetModule
  ]
})
export class UserOrdersComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  error = false;
  errorMessage = '';

  constructor(
    private ordersService: OrdersService,
    private telegramService: TelegramService,
    private router: Router,
    private bottomSheet: MatBottomSheet
  ) { }

  ngOnInit(): void {
    // Настраиваем заголовок в Telegram WebApp
    if (this.telegramService.webApp) {
      this.telegramService.webApp.BackButton.show();
      this.telegramService.webApp.BackButton.onClick(() => {
        this.router.navigate(['/main']);
      });
    }

    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = false;

    this.ordersService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (error) => {
        console.error('Ошибка при загрузке заказов:', error);
        this.loading = false;
        this.error = true;
        this.errorMessage = 'Не удалось загрузить заказы. Пожалуйста, попробуйте позже.';
      }
    });
  }

  openOrderDetails(order: any): void {
    this.bottomSheet.open(OrderDetailsBottomSheetComponent, {
      data: { orderId: order.id },
      panelClass: 'bottom-sheet-container'
    });
  }

  getStatusText(status: string): string {
    return this.ordersService.getStatusText(status);
  }

  getStatusClass(status: string): string {
    return this.ordersService.getStatusClass(status);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
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

  goToHome(): void {
    this.router.navigate(['/main']);
  }
}
