import {Component, OnInit, Inject, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrdersService } from '../../../services/orders.service';
import {TelegramService} from "../../../services/telegram.service";

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ]
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  order: any = null;
  loading = true;
  error = false;
  errorMessage = '';

  constructor(
    private orderService: OrdersService,
    private telegramService: TelegramService,
    public dialogRef: MatDialogRef<OrderDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { orderId: string }
  ) { }

  ngOnInit(): void {
    this.loadOrderDetails();
  }

  ngOnDestroy(): void {
    this.telegramService.cleanup();
    this.telegramService.hideAllButtons();
    this.telegramService.clearTelegramHandlers();
  }

  loadOrderDetails(): void {
    this.loading = true;
    this.error = false;

    this.orderService.getOrderDetails(this.data.orderId).subscribe({
      next: (orderData) => {
        this.order = orderData;
        this.loading = false;
      },
      error: (error) => {
        console.error('Ошибка при загрузке данных заказа:', error);
        this.loading = false;
        this.error = true;
        this.errorMessage = 'Не удалось загрузить детали заказа. Пожалуйста, попробуйте позже.';
      }
    });
  }

  close(): void {
    this.telegramService.cleanup();
    this.dialogRef.close();
  }

  getStatusText(status: string): string {
    return this.orderService.getStatusText(status);
  }

  getStatusClass(status: string): string {
    return this.orderService.getStatusClass(status);
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
}
