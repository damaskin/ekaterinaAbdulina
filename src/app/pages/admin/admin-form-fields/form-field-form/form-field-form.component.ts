import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormFieldsService } from '../../../../services/form-fields.service';
import { IFormField } from '../../../../models/form-field.model';
import { TelegramService } from '../../../../services/telegram.service';

@Component({
  selector: 'app-form-field-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
    RouterModule
  ],
  template: `
    <div class="title theme-text-color">Добавление поля</div>
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-field-form">
      <mat-form-field>
        <mat-label>Название поля</mat-label>
        <input matInput formControlName="label" placeholder="Введите название">
      </mat-form-field>

      <mat-form-field>
        <mat-label>Тип поля</mat-label>
        <mat-select formControlName="type">
          <mat-option value="text">Текст</mat-option>
          <mat-option value="textarea">Текстовое поле</mat-option>
          <mat-option value="number">Число</mat-option>
          <mat-option value="select">Выбор</mat-option>
          <mat-option value="checkbox">Чекбокс</mat-option>
          <mat-option value="file">Файл</mat-option>
          <mat-option value="date">Дата</mat-option>
          <mat-option value="phone">Телефон</mat-option>
          <mat-option value="email">Email</mat-option>
          <mat-option value="separator">Разделитель</mat-option>
          <mat-option value="message">Информационное сообщение</mat-option>
          <mat-option value="slider">Слайдер</mat-option>
          <mat-option value="social">Социальные сети</mat-option>
          <mat-option value="color">Цвет</mat-option>
          <mat-option value="toggle">Кнопки выбора (toggle)</mat-option>
          <mat-option value="diagram">Диаграмма</mat-option>
        </mat-select>
      </mat-form-field>

      @if (form.get('type')?.value === 'color') {
        <div class="color-picker-block">
          <div class="title">Выберите цвета для выбора пользователем</div>
          <div class="color-grid">
            @for (color of popularColors; track color) {
              <button type="button" class="color-btn" [ngStyle]="{'background': color}" [class.selected]="form.get('color')?.value === color" (click)="onColorClick(color)">
                @if (form.get('color')?.value === color) {
                  <mat-icon>check</mat-icon>
                }
              </button>
            }
          </div>
          <mat-slide-toggle formControlName="allowMultiple" style="margin-top: 12px;">Можно выбрать несколько цветов</mat-slide-toggle>
        </div>
      }

      <mat-form-field>
        <mat-label>Позиция</mat-label>
        <input matInput type="number" formControlName="position" placeholder="Введите позицию">
      </mat-form-field>

      <mat-slide-toggle formControlName="isActive">
        Активное поле
      </mat-slide-toggle>

      @if (form.get('type')?.value === 'select') {
        <h3>Опции выбора</h3>
        <div formArrayName="options">
          @for (option of options.controls; track $index) {
            <div [formGroupName]="$index">
              <mat-form-field>
                <mat-label>Значение</mat-label>
                <input matInput formControlName="value" placeholder="Введите значение">
              </mat-form-field>
              <mat-form-field>
                <mat-label>Отображаемое значение</mat-label>
                <input matInput formControlName="label" placeholder="Введите отображаемое значение">
              </mat-form-field>
              <button mat-icon-button type="button" (click)="removeOption($index)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          }
          <button mat-button type="button" (click)="addOption()">Добавить опцию</button>
        </div>
      }

      @if (form.get('type')?.value === 'social') {
        <div class="social-settings">
          <div class="title">Настройки социальных сетей</div>
          <mat-slide-toggle formControlName="instagramRequired">Instagram обязателен</mat-slide-toggle>
          <mat-slide-toggle formControlName="otherSocialRequired">Другая соцсеть обязательна</mat-slide-toggle>
        </div>
      }

      @if (form.get('type')?.value === 'toggle') {
        <h3>Варианты для выбора</h3>
        <div formArrayName="options">
          @for (option of options.controls; track $index) {
            <div [formGroupName]="$index">
              <mat-form-field>
                <mat-label>Значение</mat-label>
                <input matInput formControlName="value" placeholder="Введите значение">
              </mat-form-field>
              <mat-form-field>
                <mat-label>Отображаемое значение</mat-label>
                <input matInput formControlName="label" placeholder="Введите отображаемое значение">
              </mat-form-field>
              <button mat-icon-button type="button" (click)="removeOption($index)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          }
          <button mat-button type="button" (click)="addOption()">Добавить вариант</button>
        </div>
        <mat-slide-toggle formControlName="allowMultiple" style="margin-top: 12px;">Можно выбрать несколько значений</mat-slide-toggle>
      }

      @if (form.get('type')?.value === 'diagram') {
        <h3>Слайдеры диаграммы</h3>
        <div formArrayName="options">
          @for (slider of options.controls; track $index) {
            <div [formGroupName]="$index" class="diagram-slider-row">
              <mat-form-field>
                <mat-label>Название</mat-label>
                <input matInput formControlName="label" placeholder="Например: Работа">
              </mat-form-field>
              <mat-form-field>
                <mat-label>Цвет</mat-label>
                <input matInput formControlName="color" type="color">
              </mat-form-field>
              <mat-form-field>
                <mat-label>Мин.</mat-label>
                <input matInput formControlName="min" type="number" placeholder="0">
              </mat-form-field>
              <mat-form-field>
                <mat-label>Макс.</mat-label>
                <input matInput formControlName="max" type="number" placeholder="100">
              </mat-form-field>
              <button mat-icon-button type="button" (click)="removeOption($index)"><mat-icon>delete</mat-icon></button>
            </div>
          }
          <button mat-button type="button" (click)="addOption()">Добавить слайдер</button>
        </div>
      }

      <div class="validation-section" [ngClass]="{'disabled': isValidationDisabled()}">
        <div class="title">Валидация</div>
        <mat-slide-toggle formControlName="required" [disabled]="isValidationDisabled()">Обязательное поле</mat-slide-toggle>

        @if (form.get('type')?.value === 'number') {
          <mat-form-field>
            <mat-label>Минимальное значение</mat-label>
            <input matInput type="number" formControlName="min" [disabled]="isValidationDisabled()">
          </mat-form-field>
          <mat-form-field>
            <mat-label>Максимальное значение</mat-label>
            <input matInput type="number" formControlName="max" [disabled]="isValidationDisabled()">
          </mat-form-field>
        }

        @if (form.get('type')?.value === 'text' || form.get('type')?.value === 'textarea') {
          <mat-form-field>
            <mat-label>Минимальная длина</mat-label>
            <input matInput type="number" formControlName="minLength" [disabled]="isValidationDisabled()">
          </mat-form-field>
          <mat-form-field>
            <mat-label>Максимальная длина</mat-label>
            <input matInput type="number" formControlName="maxLength" [disabled]="isValidationDisabled()">
          </mat-form-field>
        }

        @if (form.get('type')?.value === 'slider') {
          <mat-form-field>
            <mat-label>Минимальное значение</mat-label>
            <input matInput type="number" formControlName="min" [disabled]="isValidationDisabled()">
          </mat-form-field>
          <mat-form-field>
            <mat-label>Максимальное значение</mat-label>
            <input matInput type="number" formControlName="max" [disabled]="isValidationDisabled()">
          </mat-form-field>
          <mat-form-field>
            <mat-label>Шаг</mat-label>
            <input matInput type="number" formControlName="step">
          </mat-form-field>
          <mat-form-field>
            <mat-label>Единица измерения</mat-label>
            <input matInput formControlName="unit" placeholder="Например: кг, см, % и т.д.">
          </mat-form-field>
          <mat-slide-toggle formControlName="showMinMax">Показывать в форме минимальное и максимальное значения</mat-slide-toggle>
        }

        @if (form.get('type')?.value === 'textarea') {
          <mat-form-field>
            <mat-label>Подсказка (hint)</mat-label>
            <input matInput formControlName="hint" placeholder="Текст подсказки для пользователя">
          </mat-form-field>
        }

        @if (['text','number','textarea'].includes(form.get('type')?.value)) {
          <mat-form-field>
            <mat-label>Placeholder</mat-label>
            <input matInput formControlName="placeholder" placeholder="Текст плейсхолдера для пользователя">
          </mat-form-field>
        }
      </div>

    </form>
  `,
  styles: [`
    .form-field-form {
      max-width: 600px;
      margin: 0 auto;

      .validation-section {
        margin-top: 20px;
        padding: 20px;
        border: 1px solid var(--tg-theme-secondary-bg-color);
        border-radius: 4px;
      }

      .actions {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      .social-settings {
        margin-top: 20px;
        margin-bottom: 20px;
        padding: 16px 0;
      }
      .social-settings .title {
        margin-bottom: 12px;
      }
      .social-settings mat-slide-toggle {
        display: block;
        margin-bottom: 10px;
      }

      .validation-section.disabled {
        opacity: 0.5;
        pointer-events: none;
        filter: grayscale(0.5);
      }

      .validation-section mat-slide-toggle[formControlName="required"] {
        margin-bottom: 16px;
      }

      .color-picker-block {
        margin: 16px 0;
      }
      .color-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 8px;
      }
      .color-btn {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: 2px solid #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: border 0.2s;
        position: relative;
        outline: none;
        padding: 0;
      }
      .color-btn.selected {
        border: 2px solid #2196f3;
      }
      .color-btn mat-icon {
        color: #fff;
        font-size: 20px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
      }
      .color-btn[ngStyle*='#fff'] mat-icon {
        color: #000;
      }
    }
  `]
})
export class FormFieldFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  fieldId: string | null = null;
  isLoading = false;
  popularColors = [
    '#ffffff', // белый
    '#000000', // чёрный
    '#ff0000', // красный
    '#2196f3', // синий
    '#4caf50', // зелёный
    '#ffeb3b', // жёлтый
    '#ff9800', // оранжевый
    '#9c27b0', // фиолетовый
    '#e91e63', // розовый
    '#00bcd4', // бирюзовый
    '#9e9e9e', // серый
    '#795548', // коричневый
  ];

  constructor(
    private fb: FormBuilder,
    private formFieldsService: FormFieldsService,
    private route: ActivatedRoute,
    private router: Router,
    private telegramService: TelegramService
  ) {
    this.form = this.fb.group({
      label: ['', Validators.required],
      type: ['text', Validators.required],
      position: [0, Validators.required],
      isActive: [true],
      required: [false],
      min: [null],
      max: [null],
      minLength: [null],
      maxLength: [null],
      step: [1],
      showMinMax: [true],
      options: this.fb.array([]),
      instagramRequired: [false],
      otherSocialRequired: [false],
      color: [null],
      allowMultiple: [false],
      unit: [''],
      hint: [''],
      placeholder: ['']
    });
  }

  ngOnInit(): void {
    this.telegramService.init();
    this.setupTelegramButtons();
    this.loadField();
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

      this.telegramService.showSecondaryButton('Отмена', () => this.onCancel());
    }
  }

  get options(): FormArray {
    return this.form.get('options') as FormArray;
  }

  addOption(): void {
    const type = this.form.get('type')?.value;
    if (type === 'diagram') {
      this.options.push(this.fb.group({
        label: ['', Validators.required],
        color: ['#2196f3', Validators.required],
        min: [0, Validators.required],
        max: [100, Validators.required]
      }));
    } else if (type === 'select' || type === 'toggle') {
      this.options.push(this.fb.group({
        value: ['', Validators.required],
        label: ['', Validators.required]
      }));
    }
  }

  removeOption(index: number): void {
    this.options.removeAt(index);
  }

  loadField(): void {
    this.fieldId = this.route.snapshot.paramMap.get('id');
    if (this.fieldId) {
      this.formFieldsService.getFormFields().subscribe(fields => {
        const field = fields.find(f => f.id === this.fieldId);
        if (field) {
          this.form.patchValue(field);
          if (field.options) {
            field.options.forEach(option => {
              if (field.type === 'diagram' && 'color' in option && 'min' in option && 'max' in option && 'label' in option) {
                this.options.push(this.fb.group({
                  label: [option.label, Validators.required],
                  color: [option.color, Validators.required],
                  min: [option.min, Validators.required],
                  max: [option.max, Validators.required]
                }));
              } else if ((field.type === 'select' || field.type === 'toggle') && 'value' in option && 'label' in option) {
                this.options.push(this.fb.group({
                  value: [option.value, Validators.required],
                  label: [option.label, Validators.required]
                }));
              }
            });
          }
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading = true;
      this.telegramService.hideMainButton();

      const formData = this.form.value;
      const formField: IFormField = {
        ...formData,
        isActive: true,
        position: formData.position || 0,
        allowMultiple: formData.allowMultiple,
        unit: formData.unit,
        hint: formData.hint,
        placeholder: formData.placeholder
      };

      const savePromise = this.fieldId
        ? this.formFieldsService.updateFormField({ ...formField, id: this.fieldId })
        : this.formFieldsService.addFormField(formField);

      savePromise
        .then(() => {
          this.telegramService.cleanup();
          this.router.navigate(['/admin/form-fields']);
        })
        .catch(error => {
          console.error('Error saving form field:', error);
          this.telegramService.showMainButton('Сохранить', () => this.onSubmit());
        });
    }
  }

  onCancel(): void {
    this.telegramService.cleanup();
    this.router.navigate(['/admin/form-fields']);
  }

  isValidationDisabled(): boolean {
    const type = this.form.get('type')?.value;
    return type === 'social' || type === 'separator' || type === 'message';
  }

  onColorClick(color: string): void {
    this.form.get('color')?.setValue(color);
  }
}
