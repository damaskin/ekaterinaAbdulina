import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CategoriesService } from '../../../services/categories.service';
import { ICategory } from '../../../interface/category.interface';
import { Router } from '@angular/router';
import { PriceFormatterService } from '../../../services/price-formatter.service';
import { TelegramService } from '../../../services/telegram.service';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ]
})
export class AdminCategoriesComponent implements OnInit, OnDestroy {
[x: string]: any;
  categories: ICategory[] = [];
  isLoading = false;
  error = false;
  errorMessage = '';
  searchTerm = '';
  private mainButtonClickHandler: () => void = () => {};
  private backButtonClickHandler: () => void = () => {};

  constructor(
    private categoriesService: CategoriesService,
    public priceFormatterService: PriceFormatterService,
    private telegramService: TelegramService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.setupTelegramButtons();
  }

  ngOnDestroy(): void {
    if (this.telegramService.tg) {
      this.telegramService.tg.MainButton.hide();
      this.telegramService.tg.offEvent('mainButtonClicked', this.mainButtonClickHandler);

      this.telegramService.tg.BackButton.hide();
      this.telegramService.tg.offEvent('backButtonClicked', this.onCancel);
    }
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoriesService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoading = false;
      }
    });
  }

  setupTelegramButtons(): void {
    if (this.telegramService.tg) {
      const tg = this.telegramService.tg;
      tg.MainButton.setText("Добавить категорию");
      tg.MainButton.show();

      tg.onEvent('mainButtonClicked', () => this.onAddCategory());  

      // Настройка кнопки "Назад"
      tg.BackButton.show();
            
      // Определяем обработчик для BackButton
      this.backButtonClickHandler = () => this.onCancel();
      tg.onEvent('backButtonClicked', this.backButtonClickHandler);
    }
  }

  onAddCategory(): void {
    this.router.navigate(['/admin/categories/new']);
  }

  onEditCategory(category: ICategory): void {
    this.router.navigate(['/admin/categories/edit', category.id]);
  }

  onDeleteCategory(category: ICategory): void {
    if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
      this.categoriesService.deleteCategory(category).then(() => {
        this.loadCategories();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/main']);
  }

  filterCategories(): void {
    if (!this.searchTerm) return;
    this.categories = this.categories.filter(category => 
      category.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
} 