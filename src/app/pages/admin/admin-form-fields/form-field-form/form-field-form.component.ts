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
          <mat-option value="number">Число</mat-option>
          <mat-option value="select">Выбор</mat-option>
          <mat-option value="checkbox">Чекбокс</mat-option>
          <mat-option value="file">Файл</mat-option>
          <mat-option value="date">Дата</mat-option>
          <mat-option value="phone">Телефон</mat-option>
          <mat-option value="email">Email</mat-option>
          <mat-option value="separator">Разделитель</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Позиция</mat-label>
        <input matInput type="number" formControlName="position" placeholder="Введите позицию">
      </mat-form-field>

      <mat-slide-toggle formControlName="isActive">
        Активное поле
      </mat-slide-toggle>

      <div *ngIf="form.get('type')?.value === 'select'">
        <h3>Опции выбора</h3>
        <div formArrayName="options">
          <div *ngFor="let option of options.controls; let i = index" [formGroupName]="i">
            <mat-form-field>
              <mat-label>Значение</mat-label>
              <input matInput formControlName="value" placeholder="Введите значение">
            </mat-form-field>
            <mat-form-field>
              <mat-label>Отображаемое значение</mat-label>
              <input matInput formControlName="label" placeholder="Введите отображаемое значение">
            </mat-form-field>
            <button mat-icon-button (click)="removeOption(i)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
          <button mat-button (click)="addOption()">Добавить опцию</button>
        </div>
      </div>

      <div class="validation-section">
        <div class="title">Валидация</div>
        <mat-slide-toggle formControlName="required">Обязательное поле</mat-slide-toggle>

        <mat-form-field *ngIf="form.get('type')?.value === 'number'">
          <mat-label>Минимальное значение</mat-label>
          <input matInput type="number" formControlName="min">
        </mat-form-field>

        <mat-form-field *ngIf="form.get('type')?.value === 'number'">
          <mat-label>Максимальное значение</mat-label>
          <input matInput type="number" formControlName="max">
        </mat-form-field>

        <mat-form-field *ngIf="form.get('type')?.value === 'text'">
          <mat-label>Минимальная длина</mat-label>
          <input matInput type="number" formControlName="minLength">
        </mat-form-field>

        <mat-form-field *ngIf="form.get('type')?.value === 'text'">
          <mat-label>Максимальная длина</mat-label>
          <input matInput type="number" formControlName="maxLength">
        </mat-form-field>
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
        background: var(--tg-theme-secondary-bg-color);
        border-radius: 4px;
      }

      .actions {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
    }
  `]
})
export class FormFieldFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  fieldId: string | null = null;
  isLoading = false;

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
      options: this.fb.array([])
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
  }

  setupTelegramButtons(): void {
    // Настраиваем основную кнопку для сохранения
    this.telegramService.showSecondaryButton('Отмена', () => this.onCancel());
    this.telegramService.showMainButton('Сохранить', () => this.onSubmit());

    // Настраиваем кнопку "Назад" для отмены
    this.telegramService.showBackButton(() => {
      this.telegramService.cleanup();
      this.router.navigate(['/admin/form-fields']);
    });
  }

  get options(): FormArray {
    return this.form.get('options') as FormArray;
  }

  addOption(): void {
    this.options.push(this.fb.group({
      value: ['', Validators.required],
      label: ['', Validators.required]
    }));
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
              this.options.push(this.fb.group(option));
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
        position: formData.position || 0
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
}
