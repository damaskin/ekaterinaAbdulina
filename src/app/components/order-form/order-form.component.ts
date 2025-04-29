import { Component, OnInit, OnDestroy } from '@angular/core';
import {CommonModule, JsonPipe} from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggle,
    JsonPipe,
    NgxDropzoneModule
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
          <mat-form-field *ngIf="field.type !== 'separator' && field.type !== 'checkbox' && field.type !== 'file'">
            <mat-label>{{ field.label }}</mat-label>

            <input *ngIf="field.type === 'text'" matInput formControlName="{{ field.id }}">
            <input *ngIf="field.type === 'number'" matInput type="number" formControlName="{{ field.id }}">
            <input *ngIf="field.type === 'email'" matInput type="email" formControlName="{{ field.id }}">
            <input *ngIf="field.type === 'phone'" matInput type="tel" formControlName="{{ field.id }}">
            <input *ngIf="field.type === 'date'" matInput type="date" formControlName="{{ field.id }}">

            <mat-select *ngIf="field.type === 'select'" formControlName="{{ field.id }}">
              <mat-option *ngFor="let option of field.options" [value]="option">
                {{ option }}
              </mat-option>
            </mat-select>

            <!-- <div *ngIf="field.type === 'file'" class="file-upload">
              <input type="file" (change)="onFileSelected($event, field.id || '')" [accept]="field.accept">

              <div *ngFor="let upload of fileUploads[field.id || '']; let i = index" class="file-preview">
                <div class="file-info">
                  <span>{{ upload.file.name }}</span>
                  <mat-progress-spinner *ngIf="upload.uploading" mode="determinate" [value]="upload.progress" diameter="20"></mat-progress-spinner>
                  <button *ngIf="!upload.uploading" mat-icon-button (click)="removeFile(field.id || '', i)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>

                <div *ngIf="upload.url" class="preview">
                  <img *ngIf="isImage(upload.url)" [src]="upload.url" alt="Preview">
                  <a *ngIf="!isImage(upload.url)" [href]="upload.url" target="_blank">
                    Просмотреть файл
                  </a>
                </div>
              </div>
            </div> -->
          </mat-form-field>

          <mat-slide-toggle *ngIf="field.type === 'checkbox'" formControlName="{{ field.id }}" class="theme-accent-text-color mb-20"> {{ field.label }}</mat-slide-toggle>

          <div *ngIf="field.type === 'file'" class="mb-20">
            <div class="title theme-text-color">{{field.label}}</div>
            <div class="custom-dropzone" ngx-dropzone [accept]="'image/*'" (change)="onSelect($event, field.id || '')">
              <ngx-dropzone-label [ngClass]="{'hidden': fileUploads[field.id || ''].length > 0}">
                <div class="theme-hint-color">
                  Выберите пожалуйста, 10-15 фото для загрузки
                </div>
              </ngx-dropzone-label>
              <div class="custom-dropzone-images">
                @for (upload of fileUploads[field.id || '']; track upload) {
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
                          <button type="button" (click)="onRemove(upload, field.id || ''); $event.stopPropagation()">
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

          <div *ngIf="field.type === 'separator'" class="separator">
            <div class="title theme-text-color">{{ field.label }}</div>
          </div>
        </ng-container>

        <!-- <pre>{{form.value|json}}</pre>
        <pre>{{categoryFields|json}}</pre> -->
      </form>
    </div>
  `,
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent implements OnInit, OnDestroy {
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

  // Массивы для отслеживания загрузки файлов
  lifePhotoUploads: FileUpload[] = [];
  inspirationPhotoUploads: FileUpload[] = [];

  private allLifePhotosUploaded = false;
  private allInspirationPhotosUploaded = false;
  private styleForm: FormGroup;

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
    this.styleForm = this.fb.group({
      style: this.fb.group({
        lifePhotos: [[]],
        inspirationPhotos: [[]]
      })
    });
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
          setTimeout(() => {
            this.setupTelegramButtons();
          }, 100);
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
        this.categoryFields = fields.filter(field => fieldIds.includes(field.id!));
        this.createFormControls();

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

      formControls[field.id!] = [null, validators];
      this.fileUploads[field.id!] = [];
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
}
