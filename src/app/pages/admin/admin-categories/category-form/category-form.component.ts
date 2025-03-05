import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriesService } from '../../../../services/categories.service';
import { ICategory } from '../../../../interface/category.interface';
import { FormElementComponent } from '../../../../shared/components/form-element/form-element.component';
import { TelegramService } from '../../../../services/telegram.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSlideToggleModule,
    FormElementComponent
  ]
})
export class CategoryFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isLoading = false;
  isFormLoading = false;
  categoryId: string | null = null;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  router = inject(Router);
  
  // Обработчики для кнопок Telegram
  private mainButtonClickHandler: () => void = () => {};
  private backButtonClickHandler: () => void = () => {};
  private secondaryButtonClickHandler: () => void = () => {};

  constructor(
    private fb: FormBuilder,
    private categoriesService: CategoriesService,
    private route: ActivatedRoute,
    private telegramService: TelegramService
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      price: [0],
      isActive: [true],
      imageUrl: [null],
      imagePath: [null],
      position: [null]
    });
  }

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id');
    if (this.categoryId) {
      this.loadCategory();
    }
    this.setupTelegramButtons();
  }

  ngOnDestroy(): void {
    // Убираем кнопки Telegram WebApp при уничтожении компонента
    if (this.telegramService.tg) {
      this.telegramService.tg.MainButton.hide();
      this.telegramService.tg.offEvent('mainButtonClicked', this.mainButtonClickHandler);
      
      this.telegramService.tg.BackButton.hide();
      this.telegramService.tg.offEvent('backButtonClicked', this.backButtonClickHandler);

      this.telegramService.tg.SecondaryButton.hide();
      this.telegramService.tg.offEvent('secondaryButtonClicked', this.secondaryButtonClickHandler);
    }
  }

  // Настройка кнопок Telegram WebApp
  setupTelegramButtons(): void {
    if (this.telegramService.tg) {
      const tg = this.telegramService.tg;
      
      // Настройка MainButton с текстом "Сохранить"
      tg.MainButton.setText(this.categoryId ? "Сохранить" : "Создать");
      tg.MainButton.show();

      // Настройка SecondaryButton с текстом "Отмена"
      tg.SecondaryButton.setText("Отмена");
      tg.SecondaryButton.show();
      
      // Определяем обработчик для MainButton
      this.mainButtonClickHandler = () => this.onSubmit();
      tg.onEvent('mainButtonClicked', this.mainButtonClickHandler);

      // Определяем обработчик для SecondaryButton
      this.secondaryButtonClickHandler = () => this.onCancel();
      tg.onEvent('secondaryButtonClicked', this.secondaryButtonClickHandler);
      
      // Настройка кнопки "Назад"
      tg.BackButton.show();
      
      // Определяем обработчик для BackButton
      this.backButtonClickHandler = () => this.onCancel();
      tg.onEvent('backButtonClicked', this.backButtonClickHandler);
    }
  }

  loadCategory(): void {
    this.isFormLoading = true;
    this.categoriesService.getCategory(this.categoryId!).subscribe({
      next: (category) => {
        this.form.patchValue(category);
        this.imagePreview = category.imageUrl || null;
        this.isFormLoading = false;
      },
      error: (error) => {
        console.error('Error loading category:', error);
        this.isFormLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onRemoveFile(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.form.patchValue({
      imageUrl: null,
      imagePath: null
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading = true;
      
      // Показываем индикатор загрузки на главной кнопке
      if (this.telegramService.tg) {
        this.telegramService.tg.MainButton.showProgress(true);
        this.telegramService.tg.MainButton.disable();
      }

      // Создаем объект категории без id для новых категорий
      const category: ICategory = {
        ...this.form.value,
        // Добавляем id только если это редактирование существующей категории
        ...(this.categoryId ? { id: this.categoryId } : {})
      };

      this.categoriesService.saveCategory(category, this.selectedFile || undefined)
        .then(() => {
          // Скрываем индикатор загрузки
          if (this.telegramService.tg) {
            this.telegramService.tg.MainButton.hideProgress();
            this.telegramService.tg.MainButton.enable();
          }
          this.router.navigate(['/admin/categories']);
        })
        .catch(error => {
          console.error('Error saving category:', error);
          // В случае ошибки также скрываем индикатор и разблокируем кнопку
          if (this.telegramService.tg) {
            this.telegramService.tg.MainButton.hideProgress();
            this.telegramService.tg.MainButton.enable();
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/categories']);
  }
} 