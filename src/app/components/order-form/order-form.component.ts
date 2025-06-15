import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import {CommonModule} from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriesService } from '../../services/categories.service';
import { ICategory } from '../../interface/category.interface';
import { FormFieldsService } from '../../services/form-fields.service';
import { IFormField } from '../../interface/form-field.interface';
import { TelegramService } from '../../services/telegram.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { FormsService } from '../../services/forms.service';
import { collection, query, where, getDocs, doc, setDoc } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import {MatSlideToggle} from "@angular/material/slide-toggle";
import { NgxDropzoneChangeEvent } from 'ngx-dropzone';
import { MatSliderModule } from '@angular/material/slider';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRadioModule } from '@angular/material/radio';
import Chart from 'chart.js/auto';
import { FormsModule } from '@angular/forms';

interface IFormData {
  categoryId: string;
  userId: string;
  userName: string;
  userPhone: string;
  formData: any;
  files?: { [key: string]: any[] };
  orderId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  timeDistribution?: string;
}

interface FileUpload {
  file: File;
  progress: number;
  uploading: boolean;
  error: boolean;
  url?: {
    name: string;
    thumbnailUrl: string;
    path: string;
    originalUrl: string;
    thumbnailPath: string;
  };
  path?: {
    name: string;
    thumbnailUrl: string;
    path: string;
    originalUrl: string;
    thumbnailPath: string;
  };
}

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggle,
    NgxDropzoneModule,
    MatSliderModule,
    CdkTextareaAutosize,
    MatButtonToggleModule,
    MatRadioModule
  ],
  providers: [FormsService],
  template: `
    <div class="order-form">
      <div class="info-block full-width">
        <svg class="info-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="currentColor"/>
        </svg>
        <span class="theme-hint-color">Для наиболее эффективной работы прошу отвечать на вопросы анкеты развернуто и честно</span>
      </div>

      <!-- Индикатор загрузки -->
      @if (isLoading) {
        <div class="loading-container">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <ng-container *ngFor="let field of categoryFields">
          <mat-form-field *ngIf="field.type !== 'separator' && field.type !== 'checkbox' && field.type !== 'file' && field.type !== 'message' && field.type !== 'slider' && field.type !== 'social' && field.type !== 'color' && field.type !== 'toggle' && field.type !== 'diagram'">
            <mat-label>{{ field.label }}</mat-label>

            <input *ngIf="field.type === 'text'" matInput formControlName="{{ field.id }}" [placeholder]="field.placeholder || ''">
            <input *ngIf="field.type === 'number'" matInput type="number" formControlName="{{ field.id }}" [placeholder]="field.placeholder || ''">
            <input *ngIf="field.type === 'email'" matInput type="email" formControlName="{{ field.id }}">
            <input *ngIf="field.type === 'phone'" matInput type="tel" formControlName="{{ field.id }}">
            <input *ngIf="field.type === 'date'" matInput type="date" formControlName="{{ field.id }}">
            <textarea *ngIf="field.type === 'textarea'" matInput formControlName="{{ field.id }}" [placeholder]="field.placeholder || ''" rows="4" cdkTextareaAutosize cdkAutosizeMinRows="4" cdkAutosizeMaxRows="12" style="resize: none; width: 100%;"></textarea>
            <mat-hint *ngIf="field.type === 'textarea' && field.hint">{{ field.hint }}</mat-hint>

            <mat-select *ngIf="field.type === 'select'" formControlName="{{ field.id }}">
              <mat-option *ngFor="let option of getSelectOptions(field)" [value]="option.value">
                {{ option.label }}
              </mat-option>
            </mat-select>

          </mat-form-field>

          <mat-slide-toggle *ngIf="field.type === 'checkbox'" formControlName="{{ field.id }}" class="theme-accent-text-color mb-20"> {{ field.label }}</mat-slide-toggle>

          <div *ngIf="field.type === 'file'" class="mb-20">
            <div class="title theme-text-color">{{field.label}}</div>
            <div class="custom-dropzone" ngx-dropzone [accept]="'image/*'" (change)="onSelect($event, field.id! || '')">
              <ngx-dropzone-label [ngClass]="{'hidden': fileUploads[field.id! || ''].length > 0}">
                <div class="theme-hint-color">
                  Выберите пожалуйста, 10-15 фото для загрузки
                </div>
              </ngx-dropzone-label>
              <div class="custom-dropzone-images">
                @for (upload of fileUploads[field.id! || '']; track upload) {
                  <div class="image-upload-container">
                    <!-- Индикатор загрузки -->
                    @if (upload.uploading) {
                      <div class="upload-progress">
                        <mat-progress-spinner
                          [value]="upload.progress"
                          diameter="40"
                          mode="determinate">
                        </mat-progress-spinner>
                        <span class="progress-text">{{upload.progress}}%</span>
                      </div>
                    }

                    <!-- Ошибка загрузки -->
                    @if (upload.error) {
                      <div class="upload-error">
                        <mat-icon color="warn">error</mat-icon>
                        <span>Ошибка</span>
                      </div>
                    }

                    <!-- Превью изображения -->
                    @if (!upload.uploading && !upload.error) {
                      <div class="image-preview" (click)="openOriginalImage(upload)">
                        <img [src]="upload.url?.thumbnailUrl || upload.url?.originalUrl" alt="Превью" />
                        <div class="image-actions">
                          <button type="button" (click)="onRemove(upload, field.id! || ''); $event.stopPropagation()">
                            <mat-icon>close</mat-icon>
                          </button>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- <pre>{{upload|json}}</pre> -->
                }
              </div>
            </div>
          </div>

          @if (field.type === 'slider') {
            <div class="slider-block mb-20">
              <div class="title theme-text-color">{{ field.label }} - {{ form.get(field.id!)?.value }}<ng-container *ngIf="field.unit && field.unit.trim()"> {{ field.unit }}</ng-container></div>
          
              <div *ngIf="field.showMinMax !== false" class="slider-value-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span>{{ field.min ?? 0 }}</span>
                <span></span>
                <span>{{ field.max ?? 100 }}</span>
              </div>
              <mat-slider
                [min]="field.min ?? 0"
                [max]="field.max ?? 100"
                [step]="field.step ?? 1">
                <input matSliderThumb [formControlName]="field.id!">
              </mat-slider>
            </div>
          }

          <div *ngIf="field.type === 'separator'" class="separator">
            <div class="title theme-text-color">{{ field.label }}</div>
          </div>

          <div *ngIf="field.type === 'message'" class="info-block full-width">
            <svg class="info-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="currentColor"/>
            </svg>
            <span class="theme-hint-color">{{ field.label }}</span>
          </div>

          <div *ngIf="field.type === 'social'" class="social-block mb-20">
            <div class="title theme-text-color">{{ field.label }}</div>
            <div class="social-row">
              <span class="social-icon">
                <!-- Новая SVG иконка Instagram -->
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 42 42">
              <path d="M 16.5 5 C 10.16639 5 5 10.16639 5 16.5 L 5 31.5 C 5 37.832757 10.166209 43 16.5 43 L 31.5 43 C 37.832938 43 43 37.832938 43 31.5 L 43 16.5 C 43 10.166209 37.832757 5 31.5 5 L 16.5 5 z M 16.5 8 L 31.5 8 C 36.211243 8 40 11.787791 40 16.5 L 40 31.5 C 40 36.211062 36.211062 40 31.5 40 L 16.5 40 C 11.787791 40 8 36.211243 8 31.5 L 8 16.5 C 8 11.78761 11.78761 8 16.5 8 z M 34 12 C 32.895 12 32 12.895 32 14 C 32 15.105 32.895 16 34 16 C 35.105 16 36 15.105 36 14 C 36 12.895 35.105 12 34 12 z M 24 14 C 18.495178 14 14 18.495178 14 24 C 14 29.504822 18.495178 34 24 34 C 29.504822 34 34 29.504822 34 24 C 34 18.495178 29.504822 14 24 14 z M 24 17 C 27.883178 17 31 20.116822 31 24 C 31 27.883178 27.883178 31 24 31 C 20.116822 31 17 27.883178 17 24 C 17 20.116822 20.116822 17 24 17 z"></path>
              </svg>
              </span>
              <mat-form-field class="social-field">
                <mat-label>Instagram</mat-label>
                <input matInput [formControlName]="field.id + '_instagram'" [required]="!!field.instagramRequired">
                <mat-hint>Введите username из — Instagram</mat-hint>
              </mat-form-field>
            </div>
            <div class="social-row">
              <span class="social-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
                  <circle cx="16" cy="16" r="14" stroke="var(--tg-theme-hint-color)" stroke-width="2" fill="none"/>
                  <ellipse cx="16" cy="16" rx="7" ry="14" stroke="var(--tg-theme-hint-color)" stroke-width="1" fill="none"/>
                  <ellipse cx="16" cy="16" rx="14" ry="7" stroke="var(--tg-theme-hint-color)" stroke-width="1" fill="none"/>
                </svg>
              </span>
              <mat-form-field class="social-field">
                <mat-label>Ссылки на другие социальные сети (через запятую, или с новой строки)</mat-label>
                <textarea matInput [formControlName]="field.id + '_other'" rows="2" [required]="!!field.otherSocialRequired"></textarea>
              </mat-form-field>
            </div>
          </div>

          <div *ngIf="field.type === 'color'" class="color-picker-block mb-20">
            <div class="title theme-text-color">{{ field.label }}</div>
            <div class="color-grid">
              <button *ngFor="let color of popularColors"
                      type="button"
                      class="color-btn"
                      [ngStyle]="{'background': color}"
                      [class.selected]="isColorSelected(field, color)"
                      (click)="onColorClick(field, color)">
                <mat-icon *ngIf="isColorSelected(field, color)">check</mat-icon>
              </button>
            </div>
          </div>

          <div *ngIf="field.type === 'toggle'" class="toggle-block mb-20">
            <div class="title theme-text-color">{{ field.label }}</div>
            <ng-container *ngIf="field.allowMultiple; else singleToggle">
              <div class="toggle-checkbox-list">
                <mat-checkbox *ngFor="let option of getSelectOptions(field)"
                              [checked]="isToggleSelected(field, option.value)"
                              (change)="onToggleCheckboxChange(field, option.value, $event.checked)">
                  {{ option.label }}
                </mat-checkbox>
              </div>
            </ng-container>
            <ng-template #singleToggle>
              <mat-radio-group [formControlName]="field.id!">
                <mat-radio-button *ngFor="let option of getSelectOptions(field)" [value]="option.value">
                  {{ option.label }}
                </mat-radio-button>
              </mat-radio-group>
            </ng-template>
          </div>

          <div *ngIf="field.type === 'diagram'" class="diagram-block mb-20">
          <div class="title theme-text-color">{{ field.label }}</div>
            <div class="diagram-slider-container" formArrayName="{{field.id!}}">
              <div *ngFor="let slider of getDiagramOptions(field); let i = index" class="diagram-slider-row">
                <div class="diagram-slider-label" [style.color]="slider.color">{{ slider.label }} - <span class="diagram-slider-value">{{ form.get(field.id!)?.value[i] }}%</span></div>
                <mat-slider [min]="slider.min ?? 0" [max]="slider.max ?? 100" [step]="1" [color]="'primary'" [ngStyle]="{'--slider-color': slider.color}" (change)="onDiagramSliderChangeDebounced(field)">
                  <input matSliderThumb [formControlName]="i" />
                </mat-slider>
                
              </div>
            </div>
            <div class="diagram-donut-chart">
              <canvas #diagramCanvas width="220" height="220"></canvas>
            </div>
          </div>
        </ng-container>

        <!-- <pre>{{form.value|json}}</pre>
        <pre>{{categoryFields|json}}</pre> -->
      </form>
    </div>
  `,
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent implements OnInit, OnDestroy, AfterViewInit {
  form: FormGroup;
  category: ICategory | null = null;
  categoryFields: IFormField[] = [];
  isLoading = false;
  isSubmitting = false;
  error: string | null = null;
  fileUploads: { [key: string]: FileUpload[] } = {};
  orderId: string | null = null;
  existingFormId: string | null = null;
  existingFormData: any;
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

  @ViewChild('diagramCanvas') diagramCanvas?: ElementRef<HTMLCanvasElement>;
  diagramChart: Chart | null = null;
  diagramValues: { [key: string]: number[] } = {};
  private diagramDebounceTimers: { [key: string]: any } = {};

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private categoriesService: CategoriesService,
    private formFieldsService: FormFieldsService,
    private telegramService: TelegramService,
    private storage: Storage,
    private formsService: FormsService,
    private firestore: Firestore
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadCategory();

    // Получаем ID заказа из query параметров
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'] || null;
      console.log('Order ID from query params:', this.orderId);

      // Если есть ID заказа, проверяем наличие существующей анкеты
      if (this.orderId) {
        this.checkExistingForm();
      }
    });

    // Инициализируем Telegram и настраиваем кнопки после загрузки данных
    // this.telegramService.cleanup();
    // this.telegramService.hideAllButtons();
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
      this.telegramService.showMainButton('Отправить', this.telegramService.mainButtonClickHandler);
    }
  }

  loadCategory(): void {
    const categoryId = this.route.snapshot.paramMap.get('id');
    if (categoryId) {
      this.isLoading = true;
      this.categoriesService.getCategory(categoryId).subscribe({
        next: (category) => {
          this.category = category;
          this.loadFormFields(category.formFields);

          // Инициализируем кнопки после загрузки данных
          this.setupTelegramButtons();
        },
        error: (error) => {
          console.error('Error loading category:', error);
          this.error = 'Ошибка загрузки категории';
          this.isLoading = false;
        }
      });
    }
  }

  loadFormFields(fieldIds: string[]): void {
    this.formFieldsService.getFormFields()
      .subscribe(fields => {
        this.categoryFields = fields
          .filter(field => fieldIds.includes(field.id!) && field.isActive !== false);
        this.createFormControls();

        // После создания формы — сразу обновляем диаграмму
        setTimeout(() => this.updateDiagramChart(), 0);

        // После создания контролов загружаем данные, если они есть
        if (this.existingFormId) {
          this.loadFormData(this.existingFormData);
        }

        this.isLoading = false;
      });
  }

  createFormControls(): void {
    const formControls: { [key: string]: any } = {};

    this.categoryFields.forEach(field => {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }
      if (field.type === 'social') {
        formControls[field.id + '_instagram'] = [null, !!field.instagramRequired ? [Validators.required] : []];
        formControls[field.id + '_other'] = [null, !!field.otherSocialRequired ? [Validators.required] : []];
      } else if (field.type === 'slider') {
        const minValue = field.min ?? 0;
        formControls[field.id!] = [minValue, validators];
        this.fileUploads[field.id!] = [];
      } else if (field.type === 'diagram') {
        const options = this.getDiagramOptions(field);
        formControls[field.id!] = this.fb.array(options.map(opt => {
          const min = typeof opt.min === 'number' ? opt.min : 0;
          const max = typeof opt.max === 'number' ? opt.max : 100;
          return Math.round((min + max) / 2);
        }));
      } else {
        formControls[field.id!] = [null, validators];
        this.fileUploads[field.id!] = [];
      }
    });

    this.form = this.fb.group(formControls);
  }

  isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }

  async onFileSelected(event: Event, fieldId: string): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const path = `forms/${this.category?.id}/${fieldId}/${Date.now()}_${file.name}`;

      const fileUpload: FileUpload = {
        file,
        progress: 0,
        uploading: true,
        error: false
      };

      this.fileUploads[fieldId].push(fileUpload);

      try {
        const storageRef = ref(this.storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        fileUpload.url = {
          name: file.name,
          thumbnailUrl: url,
          path: path,
          originalUrl: url,
          thumbnailPath: path
        };
        fileUpload.path = fileUpload.url;
        fileUpload.uploading = false;
        fileUpload.progress = 100;

        this.form.get(fieldId)?.setValue(url);
      } catch (error) {
        console.error('Error uploading file:', error);
        fileUpload.error = true;
        fileUpload.uploading = false;
        this.error = 'Ошибка загрузки файла';
      }
    }
  }

  async removeFile(fieldId: string, index: number): Promise<void> {
    const fileUpload = this.fileUploads[fieldId][index];

    if (fileUpload.path) {
      try {
        await deleteObject(ref(this.storage, fileUpload.path.path));
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    this.fileUploads[fieldId].splice(index, 1);
    this.form.get(fieldId)?.setValue(null);
  }

  checkExistingForm(): void {
    if (!this.orderId) return;

    this.isLoading = true;

    // Проверяем по orderId в коллекции forms
    const formsRef = collection(this.firestore, 'forms');
    const q = query(formsRef, where('orderId', '==', this.orderId));

    getDocs(q).then(querySnapshot => {
      this.isLoading = false;

      if (!querySnapshot.empty) {
        // Если нашли анкету, сохраняем её ID и данные
        const formDoc = querySnapshot.docs[0];
        this.existingFormId = formDoc.id;
        this.existingFormData = formDoc.data();
        console.log('Найдена существующая анкета с ID:', this.existingFormId);

        // Если форма уже создана, загружаем данные
        if (this.form) {
          this.loadFormData(this.existingFormData);
        }
      } else {
        console.log('Анкета для этого заказа не найдена');
      }
    }).catch(error => {
      console.error('Ошибка при проверке существующей анкеты:', error);
      this.isLoading = false;
    });
  }

  loadFormData(formData: any): void {
    if (!formData || !this.form) return;

    try {
      // Заполняем форму данными из базы
      this.form.patchValue(formData.formData || {});

      // Загружаем файлы, если они есть
      if (formData.formData) {
        Object.entries(formData.formData).forEach(([fieldId, value]: [string, any]) => {
          if (Array.isArray(value) && value.length > 0 && value[0].originalUrl) {
            this.fileUploads[fieldId] = this.fileUploads[fieldId] || [];
            value.forEach((fileData: any) => {
              this.fileUploads[fieldId].push({
                file: new File([], fileData.name),
                progress: 100,
                uploading: false,
                error: false,
                url: fileData,
                path: fileData
              });
            });
          }
          // --- ДОБАВЛЕНО: инициализация diagramValues из данных формы ---
          const field = this.categoryFields.find(f => f.id === fieldId && f.type === 'diagram');
          if (field && Array.isArray(value)) {
            const arr = this.form.get(field.id!) as FormArray;
            arr.clear();
            value.forEach(v => arr.push(this.fb.control(v)));
          }
        });
      }

      console.log('Данные формы загружены успешно');
    } catch (error) {
      console.error('Ошибка при загрузке данных формы:', error);
    }
  }

  async onSubmit(): Promise<void> {
    console.log('onSubmit');
    console.log(this.form);
    if (this.category) {
      this.isSubmitting = true;
      this.telegramService.hideMainButton();

      try {
        const formData: IFormData = {
          categoryId: this.category.id || '',
          userId: this.telegramService.getUserId(),
          userName: this.telegramService.getUserName(),
          userPhone: this.telegramService.getUserPhone(),
          formData: this.form.value,
          orderId: this.orderId,
          createdAt: new Date(),
          timeDistribution: this.form.get('timeDistribution')?.value || '',
          ...(this.existingFormId ? { updatedAt: new Date() } : {})
        };

        let formId: string;
        if (this.orderId) {
          const formDoc = doc(this.firestore, `forms/${this.orderId}`);
          await setDoc(formDoc, formData);
          formId = this.orderId;
        } else {
          const result = await this.formsService.saveForm(formData);
          formId = result.id || '';
        }

        console.log(this.categoryFields);


        // Отправляем уведомление в Telegram через сервис
        this.telegramService.sendFormNotificationToAdmins(formData.formData, formId, this.orderId, this.categoryFields)
          .subscribe({
            next: (response) => {
              console.log('Telegram notification sent:', response);

              // Скрываем индикатор загрузки
              if (this.telegramService.webApp) {
                this.telegramService.webApp.MainButton.hideProgress();
              }

              // Показываем сообщение об успешной отправке
              if (this.telegramService.webApp) {
                this.telegramService.webApp.showPopup({
                  title: this.existingFormId ? 'Анкета обновлена' : 'Анкета отправлена',
                  message: this.existingFormId
                    ? 'Ваша анкета успешно обновлена. Спасибо!'
                    : 'Ваша анкета успешно отправлена. Спасибо!',
                  buttons: [{
                    id: 'ok',
                    type: 'ok'
                  }]
                }, () => {
                  // После закрытия попапа, возвращаемся на главную
                  this.router.navigate(['/main']);
                });
              } else {
                this.router.navigate(['/main']);
              }
            },
            error: (error) => {
              console.error('Error sending Telegram notification:', error);

              // Скрываем индикатор загрузки и разблокируем кнопку в случае ошибки
              if (this.telegramService.webApp) {
                this.telegramService.webApp.MainButton.hideProgress();
                this.telegramService.webApp.MainButton.enable();
              }

              // Показываем сообщение об ошибке
              if (this.telegramService.webApp) {
                this.telegramService.webApp.showPopup({
                  title: 'Ошибка',
                  message: 'Произошла ошибка при отправке уведомления. Данные сохранены, но уведомление не отправлено.',
                  buttons: [{
                    id: 'ok',
                    type: 'ok'
                  }]
                });
              }
            }
          });

      } catch (error) {
        console.error('Error saving form:', error);
        this.error = 'Ошибка сохранения формы';
        this.telegramService.showMainButton('Отправить', () => this.onSubmit());
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  // Создание миниатюры изображения
  createThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          // Создаем миниатюру размером 200x200 пикселей
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 200;
          const MAX_HEIGHT = 200;

          let width = img.width;
          let height = img.height;

          // Вычисляем размеры миниатюры с сохранением пропорций
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = height * (MAX_WIDTH / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = width * (MAX_HEIGHT / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Конвертируем canvas в Data URL формата JPG с качеством 0.7
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(thumbnailDataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // Конвертация Data URL в File объект
  dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  onSelect(event: NgxDropzoneChangeEvent, fieldId: string): void {
    const addedFiles: File[] = event.addedFiles;
    if (!addedFiles?.length) return;

    this.fileUploads[fieldId] = this.fileUploads[fieldId] || [];

    addedFiles.forEach(async (file) => {
      if (!this.orderId) {
        console.error('Order ID is not available');
        return;
      }

      const fileUpload: FileUpload = {
        file,
        progress: 0,
        uploading: true,
        error: false
      };

      this.fileUploads[fieldId].push(fileUpload);

      try {
        const thumbnailDataUrl = await this.createThumbnail(file);
        const thumbnailFilename = `thumb_${file.name}`;
        const thumbnailFile = this.dataURLtoFile(thumbnailDataUrl, thumbnailFilename);

        const originalPath = `forms/${this.orderId}/original_${Date.now()}_${file.name}`;
        const thumbnailPath = `forms/${this.orderId}/thumb_${Date.now()}_${file.name}`;

        const originalRef = ref(this.storage, originalPath);
        const thumbnailRef = ref(this.storage, thumbnailPath);

        await uploadBytes(originalRef, file);
        fileUpload.progress = 50;

        await uploadBytes(thumbnailRef, thumbnailFile);
        fileUpload.progress = 80;

        const originalUrl = await getDownloadURL(originalRef);
        const thumbnailUrl = await getDownloadURL(thumbnailRef);

        fileUpload.url = {
          name: file.name,
          thumbnailUrl,
          path: originalPath,
          originalUrl,
          thumbnailPath
        };
        fileUpload.path = fileUpload.url;
        fileUpload.progress = 100;
        fileUpload.uploading = false;

        const control = this.form.get(fieldId);
        if (control) {
          const currentValue = control.value || [];
          currentValue.push(fileUpload.url);
          control.setValue(currentValue);
        }

      } catch (error) {
        console.error('Error uploading file:', error);
        fileUpload.error = true;
        fileUpload.uploading = false;
      }
    });
  }

  onRemove(fileUpload: FileUpload, fieldId: string): void {
    const index = this.fileUploads[fieldId].indexOf(fileUpload);
    if (index === -1) return;

    this.fileUploads[fieldId].splice(index, 1);

    const control = this.form.get(fieldId);
    if (control?.value) {
      const currentValue = control.value;
      const newValue = currentValue.filter((item: any, i: number) => {
        if (!fileUpload.path) return i !== index;
        return item.path !== fileUpload.path?.path;
      });
      control.setValue(newValue);
    }

    if (fileUpload.path?.path) {
      const originalRef = ref(this.storage, fileUpload.path.path);
      deleteObject(originalRef)
        .then(() => console.log('Original file deleted:', fileUpload.path?.path))
        .catch(err => console.error('Error deleting original file:', err));
    }

    if (fileUpload.path?.thumbnailPath) {
      const thumbnailRef = ref(this.storage, fileUpload.path.thumbnailPath);
      deleteObject(thumbnailRef)
        .then(() => console.log('Thumbnail file deleted:', fileUpload.path?.thumbnailPath))
        .catch(err => console.error('Error deleting thumbnail file:', err));
    }
  }

  // Открытие оригинального изображения в новой вкладке
  openOriginalImage(fileUpload: FileUpload): void {
    if (fileUpload.url?.originalUrl) {
      window.open(fileUpload.url.originalUrl, '_blank');
    }
  }

  onCancel(): void {
    this.router.navigate(['/my-orders']);
  }

  isColorSelected(field: IFormField, color: string): boolean {
    if (field.allowMultiple) {
      return Array.isArray(this.form.get(field.id!)?.value) && this.form.get(field.id!)?.value.includes(color);
    } else {
      return this.form.get(field.id!)?.value === color;
    }
  }

  onColorClick(field: IFormField, color: string): void {
    const control = this.form.get(field.id!);
    if (!control) return;
    if (field.allowMultiple) {
      let current: string[] = control.value || [];
      if (!Array.isArray(current)) current = [];
      if (current.includes(color)) {
        control.setValue(current.filter(c => c !== color));
      } else {
        control.setValue([...current, color]);
      }
    } else {
      control.setValue(color);
    }
  }

  isToggleSelected(field: IFormField, value: string): boolean {
    const control = this.form.get(field.id!);
    if (!control) return false;
    if (field.allowMultiple) {
      return Array.isArray(control.value) && control.value.includes(value);
    } else {
      return control.value === value;
    }
  }

  onToggleCheckboxChange(field: IFormField, value: string, checked: boolean): void {
    const control = this.form.get(field.id!);
    if (!control) return;
    let current: string[] = control.value || [];
    if (!Array.isArray(current)) current = [];
    if (checked) {
      control.setValue([...current, value]);
    } else {
      control.setValue(current.filter(v => v !== value));
    }
  }

  ngAfterViewInit(): void {
    // Вызываем updateDiagramChart только если canvas и поле есть
    setTimeout(() => this.updateDiagramChart(), 0);
  }

  updateDiagramChart(): void {
    const field = this.categoryFields.find(f => f.type === 'diagram');
    if (!field) { console.log('Нет поля diagram'); return; }
    if (!this.diagramCanvas) { console.log('Нет canvas'); return; }
    const options = this.getDiagramOptions(field);
    const arr = (this.form.get(field.id!) as FormArray)?.value || options.map((s: any) => s.min ?? 0);
    const data = {
      labels: options.map((s: any) => s.label),
      datasets: [{
        data: arr,
        backgroundColor: options.map((s: any) => s.color),
        borderWidth: 2
      }]
    };
    console.log('chart data', data);
    if (this.diagramChart) {
      this.diagramChart.data = data;
      this.diagramChart.update();
    } else {
      this.diagramChart = new Chart(this.diagramCanvas.nativeElement, {
        type: 'doughnut',
        data,
        options: {
          cutout: '70%',
          plugins: {
            legend: { display: true, position: 'bottom' },
            tooltip: { enabled: true }
          }
        }
      });
    }
  }

  // --- ДОБАВЛЕНО: Методы для фильтрации опций ---
  getSelectOptions(field: IFormField): any[] {
    return (field.options || []).filter((o: any) => o && typeof o === 'object' && 'value' in o);
  }

  getDiagramOptions(field: IFormField): any[] {
    return (field.options || []).filter((o: any) => o && typeof o === 'object' && 'color' in o);
  }

  onDiagramSliderChangeDebounced(field: IFormField): void {
    const id = field.id!;
    if (this.diagramDebounceTimers[id]) {
      clearTimeout(this.diagramDebounceTimers[id]);
    }
    this.diagramDebounceTimers[id] = setTimeout(() => {
      this.updateDiagramChart();
    }, 250);
  }
}
