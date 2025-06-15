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
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-admin-form-fields',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    RouterModule,
    MatCardModule,
    DragDropModule
  ],
  template: `
    <div class="admin-form-fields">
      <div class="header">
        <div class="title">Поля форм</div>
      </div>

      <div class="fields-grid" cdkDropList (cdkDropListDropped)="drop($event)">
        <div *ngFor="let field of formFields; let i = index; trackBy: trackByFieldId" class="field-card" cdkDrag>
          <div class="card-header">
            <span class="drag-handle" cdkDragHandle>
              <mat-icon>drag_indicator</mat-icon>
            </span>
            <span class="card-subtitle">{{ field.position }} - {{ field.label }}</span>
          </div>
          <div class="field-row-grid">
            <span class="field-type">{{ field.type }}</span>
            <mat-slide-toggle
              [checked]="field.isActive"
              (change)="toggleFieldActive(field, $event.checked)"
              class="field-status"
              color="primary"
            ></mat-slide-toggle>
            <button mat-icon-button class="field-edit-btn" (click)="onEditField(field)">
              <mat-icon>edit</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
.field-card {
  background-color: var(--tg-theme-secondary-bg-color);

  margin: 0 0 10px 0;
  min-height: 80px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  border-radius: 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
  transition: box-shadow 0.2s;

  .card-header {
    display: flex;
    align-items: center;
    padding: 10px 0 0 10px;
    .drag-handle {
      cursor: grab;
      color: var(--tg-theme-hint-color);
      display: flex;
      align-items: center;
      margin-right: 8px;
      font-size: 20px;
    }
    .card-subtitle {
      font-size: 15px;
      font-weight: 500;
      color: var(--tg-theme-hint-color);
      margin: 0;
      display: inline-block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 75vw;
    }
  }

  .field-row-grid {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 8px;
    padding: 10px 12px 8px 12px;
  }

  .field-type {
    font-size: 13px;
    color: var(--tg-theme-text-color);
    font-weight: 400;
    padding-left: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

  async drop(event: CdkDragDrop<IFormField[]>) {
    moveItemInArray(this.formFields, event.previousIndex, event.currentIndex);
    // Пересчитываем позиции и гарантируем наличие position у всех
    this.formFields.forEach((field, idx) => {
      // Если поле не имеет position или оно не число — присваиваем
      if (typeof field.position !== 'number' || isNaN(field.position)) {
        field.position = idx + 1;
      } else {
        field.position = idx + 1;
      }
    });
    // Сохраняем новые позиции
    for (const field of this.formFields) {
      await this.formFieldsService.updateFormField({ ...field, position: field.position });
    }
    // Обновляем список
    this.loadFormFields();
  }

  // TrackBy для сохранения состояния карточек при drag-and-drop
  trackByFieldId(index: number, field: IFormField) {
    return field.id;
  }

  onStatusChange(field: IFormField, event: Event) {
    const checked = (event.target as HTMLInputElement)?.checked;
    this.toggleFieldActive(field, checked);
  }
}
