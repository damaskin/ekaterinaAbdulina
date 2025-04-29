import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule, Router } from '@angular/router';
import { FormFieldsService } from '../../../services/form-fields.service';
import { IFormField } from '../../../models/form-field.model';
import { TelegramService } from '../../../services/telegram.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-admin-form-fields',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    RouterModule,
    MatCardModule
  ],
  template: `
    <div class="admin-form-fields">
      <div class="header">
        <div class="title">Поля форм</div>
      </div>

      <div class="fields-grid">
        <mat-card *ngFor="let field of formFields" class="field-card">
          <mat-card-header>
            <!-- <mat-card-title>{{ field.label }}</mat-card-title> -->
            <mat-card-subtitle>{{ field.label }}</mat-card-subtitle>
            <!-- <mat-card-subtitle *ngIf="field.type !== 'separator'">Тип: {{ field.type }}</mat-card-subtitle> -->
          </mat-card-header>

          <mat-card-content>
            <div class="field-info">
              <div class="field-property">
                <span class="label">Тип:</span>
                <span class="value">{{ field.type }}</span>
              </div>
              <div class="field-property">
                <span class="label">Позиция:</span>
                <span class="value">{{ field.position }}</span>
              </div>
              <div class="field-property">
                <span class="label">Статус:</span>
                <mat-slide-toggle
                  [checked]="field.isActive"
                  (change)="toggleFieldActive(field, $event.checked)"
                ></mat-slide-toggle>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions align="end">
            <button mat-icon-button (click)="onEditField(field)">
              <mat-icon>edit</mat-icon>
            </button>
            <!-- <button mat-icon-button color="warn" (click)="deleteField(field)">
              <mat-icon>delete</mat-icon>
            </button> -->
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .admin-form-fields {


        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .fields-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .field-card {
          background-color: var(--tg-theme-secondary-bg-color);
          .field-info {
            margin-top: 10px;
          }

          .field-property {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .label {
              color: var(--tg-theme-text-color);
            }
          }
        }
      }
  `]
})
export class AdminFormFieldsComponent implements OnInit, OnDestroy {
  formFields: IFormField[] = [];

  constructor(
    private formFieldsService: FormFieldsService,
    private router: Router,
    private telegramService: TelegramService
  ) {}

  ngOnInit(): void {
    this.telegramService.init();
    this.setupTelegramButtons();
    this.loadFormFields();
  }

  ngOnDestroy(): void {
    this.telegramService.cleanup();
    this.telegramService.hideAllButtons();
    this.telegramService.clearTelegramHandlers();
  }

  setupTelegramButtons(): void {
    if (this.telegramService.webApp) {
      // Настройка кнопки "Назад"
      this.telegramService.backButtonClickHandler = this.onCancel.bind(this);
      this.telegramService.showBackButton(this.telegramService.backButtonClickHandler);

      // Обработчик нажатия на "Анкета"
      this.telegramService.mainButtonClickHandler = this.onAddField.bind(this);
      this.telegramService.showMainButton('Добавить поле ввода', this.telegramService.mainButtonClickHandler);
    }
  }

  loadFormFields(): void {
    this.formFieldsService.getFormFields().subscribe(fields => {
      this.formFields = fields;
    });
  }

  onAddField(): void {
    this.telegramService.cleanup();
    this.router.navigate(['/admin/form-fields/new']);
  }

  onEditField(field: IFormField): void {
    this.router.navigate(['/admin/form-fields/edit', field.id]);
  }

  toggleFieldActive(field: IFormField, isActive: boolean): void {
    this.formFieldsService.updateFormField({ ...field, isActive })
      .then(() => this.loadFormFields());
  }

  deleteField(field: IFormField): void {
    if (confirm('Удалить поле?')) {
      this.formFieldsService.deleteFormField(field.id).then(() => {
        this.loadFormFields();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/main']);
  }
}
