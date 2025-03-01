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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { OrdersService } from '../../services/orders.service';
import { TelegramService } from '../../services/telegram.service';
import { OrderDetailsComponent } from './order-details/order-details.component';

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
    MatDialogModule
  ]
})
export class UserOrdersComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  error = false;
  errorMessage = '';
  expandedOrder: string | null = null;

  constructor(
    private ordersService: OrdersService,
    private telegramService: TelegramService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Настраиваем заголовок в Telegram WebApp
    if (this.telegramService.tg) {
      this.telegramService.tg.BackButton.show();
      this.telegramService.tg.BackButton.onClick(() => {
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
    this.dialog.open(OrderDetailsComponent, {
      width: '90%',
      maxWidth: '500px',
      data: { orderId: order.id }
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

  toggleExpand(orderId: string): void {
    this.expandedOrder = this.expandedOrder === orderId ? null : orderId;
  }

  isExpanded(orderId: string): boolean {
    return this.expandedOrder === orderId;
  }

  goToHome(): void {
    this.router.navigate(['/main']);
  }
} 