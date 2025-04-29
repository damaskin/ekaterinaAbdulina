import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../../services/orders.service';
import { TelegramService } from '../../../services/telegram.service';
import { Router } from '@angular/router';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { from } from 'rxjs';

@Component({
  selector: 'app-order-details-bottom-sheet',
  templateUrl: './order-details-bottom-sheet.component.html',
  styleUrls: ['./order-details-bottom-sheet.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    FormsModule
  ]
})
export class OrderDetailsBottomSheetComponent implements OnInit, OnDestroy {
  order: any = null;
  loading = true;
  error = false;
  errorMessage = '';
  isAdmin = false;
  updatingStatus = false;

  // Загрузка данных анкеты
  formLoading = false;
  existingFormId: string | null = null;

  // Доступные статусы заказа
  statuses = [
    { value: 'pending', text: 'Ожидает оплаты' },
    { value: 'succeeded', text: 'Оплачен' },
    { value: 'paid', text: 'Оплачен' },
    { value: 'processing', text: 'В обработке' },
    { value: 'completed', text: 'Выполнен' },
    { value: 'cancelled', text: 'Отменен' }
  ];

  constructor(
    private orderService: OrdersService,
    private telegramService: TelegramService,
    private router: Router,
    private firestore: Firestore,
    private bottomSheetRef: MatBottomSheetRef<OrderDetailsBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { orderId: string, isAdmin?: boolean }
  ) {
    this.isAdmin = data.isAdmin === true;
  }

  ngOnInit(): void {
    this.loadOrderDetails();
    this.checkExistingForm();
  }

  ngOnDestroy(): void {
    this.telegramService.cleanup();
    this.telegramService.hideAllButtons();

    this.telegramService.backButtonClickHandler = this.navigateToBack.bind(this);
    this.telegramService.showBackButton(this.telegramService.backButtonClickHandler);
  }

  private navigateToBack(): void {
    this.router.navigate(['/main']).then(r => {});
  }

  setupTelegramButtons(): void {
    if (this.telegramService.webApp) {
      // Настройка кнопки "Назад"
      this.telegramService.backButtonClickHandler = this.close.bind(this);
      this.telegramService.showBackButton(this.telegramService.backButtonClickHandler);

      // Обработчик нажатия на "Анкета"
      this.telegramService.mainButtonClickHandler = this.navigateToForm.bind(this);
      this.telegramService.showMainButton(this.isAdmin ? 'Закрыть' : 'Анкета', this.telegramService.mainButtonClickHandler);
    }
  }

  // Проверяем, существует ли уже анкета для этого заказа
  checkExistingForm(): void {
    if (!this.data.orderId) {
      return;
    }

    this.formLoading = true;

    // Создаем запрос к коллекции 'forms' для поиска анкеты по orderId
    const formsRef = collection(this.firestore, 'forms');
    const q = query(formsRef, where('orderId', '==', this.data.orderId));

    from(getDocs(q)).subscribe({
      next: (querySnapshot) => {
        this.formLoading = false;

        if (!querySnapshot.empty) {
          // Если нашли анкету, сохраняем ее ID
          this.existingFormId = querySnapshot.docs[0].id;
          console.log('Найдена существующая анкета с ID:', this.existingFormId);
        } else {
          console.log('Анкета для этого заказа не найдена');
        }

        // После проверки настраиваем кнопки Telegram
        this.setupTelegramButtons();
      },
      error: (error) => {
        console.error('Ошибка при проверке существующей анкеты:', error);
        this.formLoading = false;
        // Всё равно настраиваем кнопки Telegram
        this.setupTelegramButtons();
      }
    });
  }

  // Навигация к анкете (существующей или новой)
  navigateToForm(): void {
    this.telegramService.checkMainButtonEvents();
    this.close(); // Закрываем шторку

    if (this.isAdmin) {
      return;
    }

    // Запускаем навигацию напрямую, без подписки на событие
    if (this.existingFormId) {
      // Навигация к существующей или новой анкете (пока используем один и тот же путь)
      this.router.navigate([`/order/${this.order.category.id}/form`], { queryParams: { orderId: this.data.orderId } });
    } else {
      // Создаем новую анкету
      this.router.navigate([`/order/${this.order.category.id}/form`], { queryParams: { orderId: this.data.orderId } });
    }
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
    this.bottomSheetRef.dismiss();
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

  updateOrderStatus(newStatus: string): void {
    if (!this.isAdmin || !this.order || !newStatus || this.updatingStatus) {
      return;
    }

    this.updatingStatus = true;

    this.orderService.updateOrderStatus(this.order.id, newStatus).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
        this.updatingStatus = false;
        // Показываем уведомление об успешном обновлении
        if (this.telegramService.webApp) {
          this.telegramService.webApp.showPopup({
            title: 'Статус обновлен',
            message: `Статус заказа изменен на "${this.getStatusText(newStatus)}"`,
            buttons: [{ type: 'ok' }]
          });
        }
      },
      error: (error) => {
        console.error('Ошибка при обновлении статуса заказа:', error);
        this.updatingStatus = false;
        // Показываем уведомление об ошибке
        if (this.telegramService.webApp) {
          this.telegramService.webApp.showPopup({
            title: 'Ошибка',
            message: 'Не удалось обновить статус заказа',
            buttons: [{ type: 'ok' }]
          });
        }
      }
    });
  }
}
