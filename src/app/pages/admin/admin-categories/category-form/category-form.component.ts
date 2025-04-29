import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoriesService } from '../../../../services/categories.service';
import { ICategory } from '../../../../interface/category.interface';
import { TelegramService } from '../../../../services/telegram.service';
import { FormFieldsService } from '../../../../services/form-fields.service';
import { IFormField } from '../../../../models/form-field.model';
import { FormElementComponent } from '../../../../shared/components/form-element/form-element.component';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
    MatSelectModule,
    RouterModule,
    FormElementComponent
  ],
  template: `
    <div class="title theme-text-color">{{ categoryId ? 'Редактирование' : 'Создание' }} категории</div>
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="category-form">
      <app-form-element
        label="Название"
        type="text"
        formControlName="title"
        placeholder="Введите название"
        [isLoading]="isLoading"
      ></app-form-element>

      <app-form-element
        label="Описание"
        type="textarea"
        formControlName="description"
        placeholder="Введите описание"
        [isLoading]="isLoading"
      ></app-form-element>

      <app-form-element
        label="Позиция"
        type="number"
        formControlName="position"
        placeholder="Введите позицию"
        [isLoading]="isLoading"
      ></app-form-element>

      <app-form-element
        label="Цена"
        type="number"
        formControlName="price"
        placeholder="Введите цену"
        [isLoading]="isLoading"
      ></app-form-element>

      <mat-form-field>
        <mat-label>Поля формы</mat-label>
        <mat-select formControlName="formFields" multiple>
          <mat-option *ngFor="let field of formFields" [value]="field.id">
            {{ field.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-slide-toggle formControlName="isActive">
        Активная категория
      </mat-slide-toggle>

      <div class="image-upload">
        <input type="file" (change)="onFileSelected($event)" accept="image/*" #fileInput style="display: none">
        <button mat-button (click)="fileInput.click()">
          <mat-icon>cloud_upload</mat-icon>
          Загрузить изображение
        </button>
        <img *ngIf="imagePreview" [src]="imagePreview" alt="Preview">
      </div>
    </form>
  `,
  styles: [`
    .category-form {
      max-width: 600px;
      margin: 0 auto;

      .image-upload {
        margin-top: 20px;
        text-align: center;

        img {
          max-width: 200px;
          margin-top: 10px;
        }
      }
    }
  `]
})
export class CategoryFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isLoading = false;
  isFormLoading = false;
  categoryId: string | null = null;
  imagePreview: string | null = null;
  formFields: IFormField[] = [];
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private categoriesService: CategoriesService,
    private formFieldsService: FormFieldsService,
    private route: ActivatedRoute,
    private router: Router,
    private telegramService: TelegramService
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      position: [0, Validators.required],
      price: [0],
      isActive: [true],
      formFields: [[]],
      imageUrl: [null],
      imagePath: [null]
    });
  }

  ngOnInit(): void {
    this.telegramService.init();
    this.setupTelegramButtons();
    this.loadFormFields();
    this.loadCategory();
  }

  ngOnDestroy(): void {
    this.telegramService.cleanup();
    this.telegramService.hideAllButtons();
    this.telegramService.hideBackButton();
    this.telegramService.clearTelegramHandlers();
  }

  setupTelegramButtons(): void {
    if (this.telegramService.webApp) {
      // Настройка кнопки "Назад"
      this.telegramService.backButtonClickHandler = this.onCancel.bind(this);
      this.telegramService.showBackButton(this.telegramService.backButtonClickHandler);

      // Обработчик нажатия на "Анкета"
      this.telegramService.mainButtonClickHandler = this.onSubmit.bind(this);
      this.telegramService.showMainButton('Сохранить', this.telegramService.mainButtonClickHandler);
    }
  }

  loadFormFields(): void {
    this.formFieldsService.getFormFields().subscribe(fields => {
      this.formFields = fields;
    });
  }

  loadCategory(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id');
    if (this.categoryId) {
      this.categoriesService.getCategory(this.categoryId).subscribe(category => {
        if (category) {
          this.form.patchValue(category);
          this.imagePreview = category.imageUrl || null;
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.form.patchValue({ imageUrl: this.imagePreview });
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
      this.telegramService.hideMainButton();

      const categoryData: ICategory = {
        ...this.form.value,
        imageUrl: this.imagePreview || null
      };

      if (this.categoryId) {
        categoryData.id = this.categoryId;
      }

      this.categoriesService.saveCategory(categoryData)
        .then(() => {
          this.telegramService.cleanup();
          this.router.navigate(['/admin/categories']);
        })
        .catch(error => {
          console.error('Error saving category:', error);
          this.telegramService.showMainButton('Сохранить', () => this.onSubmit());
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/categories']);
  }
}
