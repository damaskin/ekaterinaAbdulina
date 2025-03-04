import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TelegramService } from '../../services/telegram.service';
import { JsonPipe } from '@angular/common';
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { MatLabel } from "@angular/material/form-field";
import { MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { IMaskModule } from 'angular-imask';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MASKS } from '../../masks/mask-config';
import { FormElementComponent } from '../../shared/components/form-element/form-element.component';
import { validationConfig } from '../../validation/validation-config';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { Firestore, collection, addDoc, deleteDoc, doc, getDoc, setDoc, query, where, getDocs } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { forkJoin, from, Observable, of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { ITelegramUser } from '../../interface/telegram-user';
import { Subscription, BehaviorSubject, firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

// Добавляем поле в environment
declare module '../../../environments/environment' {
  interface Environment {
    telegramNotificationUrl?: string;
  }
}

// Определяем интерфейс для отслеживания загрузки файлов
interface FileUpload {
  file: File;
  progress: number;
  uploading: boolean;
  error: boolean;
  thumbnail?: string;
  originalUrl?: string;
  thumbnailUrl?: string;
  path?: string;
  thumbnailPath?: string;
}

@Component({
  selector: 'app-style-form',
  templateUrl: './style-form.component.html',
  styleUrls: ['./style-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JsonPipe,
    MatSlideToggle,
    MatLabel,
    MatFormField,
    MatInput,
    MatProgressSpinnerModule,
    MatIconModule,
    IMaskModule,
    MatFormFieldModule,
    MatInputModule,
    FormElementComponent,
    NgxDropzoneModule
  ]
})
export class StyleFormComponent implements OnInit, AfterViewInit, OnDestroy {
  styleForm: FormGroup;
  categoryId: number = 0;
  orderId: string | null = null;
  existingFormId: string | null = null;
  formLoading: boolean = false;
  user: ITelegramUser | null = null;
  router = inject(Router);
  isLoading: boolean = true; // флаг загрузки
  MASKS = MASKS;
  
  // Массивы для отслеживания загрузки файлов
  lifePhotoUploads: FileUpload[] = [];
  inspirationPhotoUploads: FileUpload[] = [];
  
  // Флаги для проверки завершения загрузки всех файлов
  allLifePhotosUploaded: boolean = true;
  allInspirationPhotosUploaded: boolean = true;
  
  // Обработчики для кнопок Telegram
  private mainButtonClickHandler: () => void = () => {};
  private backButtonClickHandler: () => void = () => {};

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private telegramService: TelegramService,
    private firestore: Firestore,
    private storage: Storage,
    private http: HttpClient
  ) {
    console.log(validationConfig.personalInfo);
    this.styleForm = this.fb.group({
      personalInfo: this.fb.group({
        fullName: ['', validationConfig.personalInfo['fullName'].validators],
        age: ['', validationConfig.personalInfo['age'].validators],
        location: ['', validationConfig.personalInfo['location'].validators],
        occupation: ['', Validators.required],
        hobbies: ['', Validators.required],
        maritalStatus: ['', Validators.required],
      }),
      shoppingHabits: this.fb.group({
        shoppingFrequency: ['', Validators.required],
      }),
      appearance: this.fb.group({
        strongPoints: [''],
        weakPoints: [''],
        parameters: this.fb.group({
          height: [''],
          shoeSize: [''],
          bust: [''],
          waist: [''],
          hips: ['']
        })
      }),
      socialMedia: [''],
      timeDistribution: ['', Validators.required],
      style: this.fb.group({
        usualOutfit: ['', Validators.required],
        desiredStyle: ['', Validators.required],
        dominantColors: ['', Validators.required],
        preferredBrands: ['', Validators.required],
        lifePhotos: [''],
        inspirationPhotos: [''],
        desiredImpression: ['', Validators.required],
        stopList: ['', Validators.required],
      }),
      additional: this.fb.group({
        followsFashion: [''],
        fashionInfluencers: [''],
        importantOpinion: [''],
        previousStylist: [''],
        additionalInfo: ['']
      })
    });
  }

  ngOnInit() {
    this.categoryId = Number(this.route.snapshot.paramMap.get('id'));
    this.user = this.telegramService.telegramUser;
    
    // Получаем ID заказа из query параметров
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'] || null;
      console.log('Order ID from query params:', this.orderId);
      
      // Если есть ID заказа, проверяем наличие существующей анкеты
      if (this.orderId) {
        this.checkExistingForm();
      }
    });

    // Настройка кнопок Telegram WebApp
    this.setupTelegramButtons();

    // this.styleForm.setValue({
    //   personalInfo: {
    //     fullName: 'Иванов Иван Иванович',
    //     age: '25',
    //     location: 'Москва',
    //     occupation: 'Программист',
    //     hobbies: 'Музыка, походы, чтение',
    //     maritalStatus: true
    //   },
    //   shoppingHabits: {
    //     shoppingFrequency: 'Раз в месяц',
    //   },
    //   appearance: {
    //     strongPoints: 'Высокий рост, хорошие волосы',
    //     weakPoints: 'Мешки под глазами',
    //     parameters: {
    //       height: '185',
    //       shoeSize: '43',
    //       bust: '100',
    //       waist: '80',
    //       hips: '100'
    //     }
    //   },
    //   socialMedia: 'instagram.com/ivanov_ivan\nvk.com/ivan_ivanov',
    //   timeDistribution: 'Работа - 30%, Сон - 30%, Спорт - 10%, Отдых - 30%',
    //   style: {
    //     usualOutfit: 'Джинсы и футболка, повседневный кэжуал',
    //     desiredStyle: 'Более собранный и элегантный образ',
    //     dominantColors: 'Синие и серые оттенки преобладают',
    //     preferredBrands: 'Uniqlo, Zara, H&M',
    //     lifePhotos: [],
    //     inspirationPhotos: [],
    //     desiredImpression: 'Стильный, уверенный, approachable',
    //     stopList: 'Яркие неоновые вещи, оборки, строгие галстуки'
    //   },
    //   additional: {
    //     followsFashion: 'Читаю пару блогеров и моду в TikTok',
    //     fashionInfluencers: 'Анон, Streetwear аккаунты',
    //     importantOpinion: 'Мнение жены, сестры',
    //     previousStylist: 'Нет предыдущего опыта',
    //     additionalInfo: 'Хочу найти свой стиль'
    //   }
    // });
  }
  
  // Настройка кнопок Telegram WebApp
  setupTelegramButtons(): void {
    if (this.telegramService.tg) {
      const tg = this.telegramService.tg;
      
      // Настройка MainButton с текстом "Сохранить"
      tg.MainButton.setText("Сохранить");
      tg.MainButton.show();
      
      // Определяем обработчик для MainButton
      this.mainButtonClickHandler = () => this.onSubmit();
      tg.onEvent('mainButtonClicked', this.mainButtonClickHandler);
      
      // Настройка кнопки "Назад"
      tg.BackButton.show();
      
      // Определяем обработчик для BackButton
      this.backButtonClickHandler = () => this.navigateToMain();
      tg.onEvent('backButtonClicked', this.backButtonClickHandler);
    }
  }
  
  // Метод для навигации на главную
  navigateToMain(): void {
    this.router.navigate(['/main']);
  }
  
  // Проверяем, существует ли уже анкета для этого заказа
  checkExistingForm(): void {
    if (!this.orderId) return;
    
    this.formLoading = true;
    
    // Проверяем по orderId в коллекции forms
    const formsRef = collection(this.firestore, 'forms');
    const q = query(formsRef, where('orderId', '==', this.orderId));
    
    getDocs(q).then(querySnapshot => {
      this.formLoading = false;
      
      if (!querySnapshot.empty) {
        // Если нашли анкету, сохраняем её ID и загружаем данные
        const formDoc = querySnapshot.docs[0];
        this.existingFormId = formDoc.id;
        console.log('Найдена существующая анкета с ID:', this.existingFormId);
        
        // Загружаем данные анкеты в форму
        this.loadFormData(formDoc.data());
      } else {
        console.log('Анкета для этого заказа не найдена');
      }
    }).catch(error => {
      console.error('Ошибка при проверке существующей анкеты:', error);
      this.formLoading = false;
    });
  }
  
  // Загружаем данные анкеты в форму
  loadFormData(formData: any): void {
    if (!formData) return;
    
    try {
      // Заполняем форму данными из базы
      this.styleForm.patchValue({
        personalInfo: formData.personalInfo || {},
        shoppingHabits: formData.shoppingHabits || {},
        appearance: formData.appearance || {},
        socialMedia: formData.socialMedia || '',
        timeDistribution: formData.timeDistribution || '',
        style: {
          ...formData.style || {},
          // Очищаем массивы фото, так как они будут загружены отдельно
          lifePhotos: [],
          inspirationPhotos: []
        },
        additional: formData.additional || {}
      });
      
      // Загружаем изображения
      if (formData.style?.lifePhotos?.length) {
        this.loadSavedImages(formData.style.lifePhotos, 'lifePhotos');
      }
      
      if (formData.style?.inspirationPhotos?.length) {
        this.loadSavedImages(formData.style.inspirationPhotos, 'inspirationPhotos');
      }
      
      console.log('Данные формы загружены успешно');
    } catch (error) {
      console.error('Ошибка при загрузке данных формы:', error);
    }
  }
  
  // Загрузка сохраненных изображений для отображения
  loadSavedImages(images: any[], fieldName: 'lifePhotos' | 'inspirationPhotos'): void {
    const targetArray = fieldName === 'lifePhotos' ? this.lifePhotoUploads : this.inspirationPhotoUploads;
    const control = this.styleForm.get(['style', fieldName]);
    const currentValue = control?.value || [];
    
    // Добавляем сохраненные изображения в форму и в массив для отображения
    images.forEach(image => {
      // Добавляем в форму данные об изображении
      currentValue.push(image);
      
      // Создаем объект для отображения
      const fileUpload: FileUpload = {
        file: new File([], image.name || 'image.jpg'),
        progress: 100,
        uploading: false,
        error: false,
        originalUrl: image.originalUrl || image.url,
        thumbnailUrl: image.thumbnailUrl || image.url,
        path: image.path,
        thumbnailPath: image.thumbnailPath
      };
      
      targetArray.push(fileUpload);
    });
    
    control?.setValue(currentValue);
  }

  // После отображения всех дочерних компонентов ждем 1.5 секунды и убираем loader
  ngAfterViewInit() {
    this.isLoading = false;
  }

  ngOnDestroy() {
    // Убираем кнопки Telegram WebApp при уничтожении компонента
    if (this.telegramService.tg) {
      this.telegramService.tg.MainButton.hide();
      this.telegramService.tg.offEvent('mainButtonClicked', this.mainButtonClickHandler);
      
      this.telegramService.tg.BackButton.hide();
      this.telegramService.tg.offEvent('backButtonClicked', this.backButtonClickHandler);
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

  onSelect(event: any, fieldName: 'lifePhotos' | 'inspirationPhotos'): void {
    const addedFiles: File[] = event.addedFiles;
    if (!addedFiles?.length) return;
    
    // Обновляем флаг загрузки для всех изображений
    if (fieldName === 'lifePhotos') {
      this.allLifePhotosUploaded = false;
    } else {
      this.allInspirationPhotosUploaded = false;
    }
    
    // Определяем массивы для хранения данных
    const uploadArray = fieldName === 'lifePhotos' ? this.lifePhotoUploads : this.inspirationPhotoUploads;
    
    // Проходим по каждому файлу
    addedFiles.forEach(async (file) => {
      if (!this.orderId) {
        console.error('Order ID is not available');
        return;
      }
      
      // Создаем объект для отслеживания загрузки
      const fileUpload: FileUpload = {
        file,
        progress: 0,
        uploading: true,
        error: false
      };
      
      // Добавляем в массив загрузок
      uploadArray.push(fileUpload);
      
      try {
        // 1) Создаем миниатюру
        const thumbnailDataUrl = await this.createThumbnail(file);
        fileUpload.thumbnail = thumbnailDataUrl;
        
        // 2) Конвертируем миниатюру в File
        const thumbnailFilename = `thumb_${file.name}`;
        const thumbnailFile = this.dataURLtoFile(thumbnailDataUrl, thumbnailFilename);
        
        // 3) Определяем пути в Storage для оригинала и миниатюры
        const originalPath = `forms/${this.orderId}/original_${Date.now()}_${file.name}`;
        const thumbnailPath = `forms/${this.orderId}/thumb_${Date.now()}_${file.name}`;
        
        // 4) Загружаем оригинал и миниатюру в Storage
        const originalRef = ref(this.storage, originalPath);
        const thumbnailRef = ref(this.storage, thumbnailPath);
        
        // 5) Загружаем оригинал
        await uploadBytes(originalRef, file);
        fileUpload.progress = 50;
        
        // 6) Загружаем миниатюру
        await uploadBytes(thumbnailRef, thumbnailFile);
        fileUpload.progress = 80;
        
        // 7) Получаем URL для загруженных файлов
        const originalUrl = await getDownloadURL(originalRef);
        const thumbnailUrl = await getDownloadURL(thumbnailRef);
        
        // 8) Обновляем объект FileUpload
        fileUpload.originalUrl = originalUrl;
        fileUpload.thumbnailUrl = thumbnailUrl;
        fileUpload.path = originalPath;
        fileUpload.thumbnailPath = thumbnailPath;
        fileUpload.progress = 100;
        fileUpload.uploading = false;
        
        // 9) Обновляем значение в форме
        const control = this.styleForm.get(['style', fieldName]);
        if (control) {
          const currentValue = control.value || [];
          currentValue.push({
            name: file.name,
            originalUrl,
            thumbnailUrl,
            path: originalPath,
            thumbnailPath
          });
          control.setValue(currentValue);
        }
        
        // 10) Проверяем, все ли файлы загружены
        this.checkAllFilesUploaded(fieldName);
        
      } catch (error) {
        console.error('Error uploading file:', error);
        fileUpload.error = true;
        fileUpload.uploading = false;
        this.checkAllFilesUploaded(fieldName);
      }
    });
  }
  
  // Проверка, все ли файлы загружены
  checkAllFilesUploaded(fieldName: 'lifePhotos' | 'inspirationPhotos'): void {
    const uploadArray = fieldName === 'lifePhotos' ? this.lifePhotoUploads : this.inspirationPhotoUploads;
    const allUploaded = uploadArray.every(item => !item.uploading);
    
    if (fieldName === 'lifePhotos') {
      this.allLifePhotosUploaded = allUploaded;
    } else {
      this.allInspirationPhotosUploaded = allUploaded;
    }
  }

  onRemove(fileUpload: FileUpload, fieldName: 'lifePhotos' | 'inspirationPhotos'): void {
    // Определяем массив для удаления
    const uploadArray = fieldName === 'lifePhotos' ? this.lifePhotoUploads : this.inspirationPhotoUploads;
    
    // Находим индекс файла в массиве
    const index = uploadArray.indexOf(fileUpload);
    if (index === -1) return;
    
    // Удаляем из массива
    uploadArray.splice(index, 1);
    
    // Обновляем значение в форме, удаляя соответствующий элемент
    const control = this.styleForm.get(['style', fieldName]);
    if (control?.value) {
      const currentValue = control.value;
      const newValue = currentValue.filter((item: any, i: number) => {
        // Если файл еще загружается (нет path), удаляем по индексу
        if (!fileUpload.path) return i !== index;
        // Иначе сравниваем по пути к файлу
        return item.path !== fileUpload.path;
      });
      control.setValue(newValue);
    }
    
    // Если файл уже загружен в Storage, удаляем его оттуда
    if (fileUpload.path) {
      const originalRef = ref(this.storage, fileUpload.path);
      deleteObject(originalRef)
        .then(() => console.log('Original file deleted:', fileUpload.path))
        .catch(err => console.error('Error deleting original file:', err));
    }
    
    // Если есть миниатюра, удаляем её тоже
    if (fileUpload.thumbnailPath) {
      const thumbnailRef = ref(this.storage, fileUpload.thumbnailPath);
      deleteObject(thumbnailRef)
        .then(() => console.log('Thumbnail file deleted:', fileUpload.thumbnailPath))
        .catch(err => console.error('Error deleting thumbnail file:', err));
    }
    
    // Проверяем, все ли файлы загружены
    this.checkAllFilesUploaded(fieldName);
  }
  
  // Открытие оригинального изображения в новой вкладке
  openOriginalImage(fileUpload: FileUpload): void {
    if (fileUpload.originalUrl) {
      window.open(fileUpload.originalUrl, '_blank');
    }
  }

  onSubmit(): void {
    console.log('Form submitted:', this.styleForm);
    
    // Проверяем, все ли файлы загружены
    if (!this.allLifePhotosUploaded || !this.allInspirationPhotosUploaded) {
      if (this.telegramService.tg) {
        this.telegramService.tg.showPopup({
          title: 'Загрузка файлов',
          message: 'Пожалуйста, дождитесь окончания загрузки всех изображений.',
          buttons: [{ type: 'ok' }]
        });
      }
      return;
    }
    
    if (this.styleForm.valid) {
      console.log('Form is valid, values:', this.styleForm.value);
      
      // Показываем индикатор загрузки и блокируем кнопку
      if (this.telegramService.tg) {
        this.telegramService.tg.MainButton.showProgress(true);
        this.telegramService.tg.MainButton.disable();
      }
      
      const formData = {
        ...this.styleForm.value,
        category: this.categoryId,
        userId: this.user?.id,
        createdAt: new Date(),
        // Добавляем ID заказа, если он есть
        orderId: this.orderId,
        // Добавляем поле updatedAt при обновлении
        ...(this.existingFormId ? { updatedAt: new Date() } : {})
      };

      // Определяем, создаем новую анкету или обновляем существующую
      let savePromise;
      
      if (this.orderId && !this.existingFormId) {
        // Если есть ID заказа, но нет существующей анкеты - создаем документ с ID заказа
        const formDoc = doc(this.firestore, `forms/${this.orderId}`);
        savePromise = setDoc(formDoc, formData);
      } else if (this.existingFormId) {
        // Если есть существующая анкета - обновляем её
        const formDoc = doc(this.firestore, `forms/${this.existingFormId}`);
        savePromise = setDoc(formDoc, formData);
      } else {
        // Если нет ни ID заказа, ни существующей анкеты - создаем с автогенерируемым ID
        const formsRef = collection(this.firestore, 'forms');
        savePromise = addDoc(formsRef, formData);
      }

      // Выполняем сохранение
      savePromise.then(docRef => {
        // При создании с автогенерируемым ID у docRef будет id, при setDoc нет
        const formId = (docRef as any)?.id || this.existingFormId || this.orderId;
        console.log('Form data saved with ID:', formId);
        
        // Отправляем уведомление в Telegram через сервис
        this.telegramService.sendFormNotificationToAdmins(formData, formId, this.orderId)
          .subscribe({
            next: (response) => {
              console.log('Telegram notification sent:', response);
              
              // Скрываем индикатор загрузки
              if (this.telegramService.tg) {
                this.telegramService.tg.MainButton.hideProgress();
              }
              
              // Показываем сообщение об успешной отправке
              if (this.telegramService.tg) {
                this.telegramService.tg.showPopup({
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
              if (this.telegramService.tg) {
                this.telegramService.tg.MainButton.hideProgress();
                this.telegramService.tg.MainButton.enable();
              }
              
              // Показываем сообщение об ошибке
              if (this.telegramService.tg) {
                this.telegramService.tg.showPopup({
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
      })
      .catch(error => {
        console.error('Error saving form data:', error);
        
        // Скрываем индикатор загрузки и разблокируем кнопку в случае ошибки
        if (this.telegramService.tg) {
          this.telegramService.tg.MainButton.hideProgress();
          this.telegramService.tg.MainButton.enable();
        }
        
        // Показываем сообщение об ошибке
        if (this.telegramService.tg) {
          this.telegramService.tg.showPopup({
            title: 'Ошибка',
            message: 'Произошла ошибка при отправке анкеты. Пожалуйста, попробуйте еще раз.',
            buttons: [{
              id: 'ok',
              type: 'ok'
            }]
          });
        }
      });
    } else {
      console.error('Form is invalid');
      // Показываем сообщение о необходимости заполнить обязательные поля
      if (this.telegramService.tg) {
        this.telegramService.tg.showPopup({
          title: 'Форма не заполнена',
          message: 'Пожалуйста, заполните все обязательные поля анкеты.',
          buttons: [{
            id: 'ok',
            type: 'ok'
          }]
        });
      }
    }
  }
  
  async deleteForm(docId: string, formData: any): Promise<void> {
    // 1) Удаляем все файлы из Storage
    const lifePhotoRefs = formData?.style?.lifePhotos || [];
    const inspirationRefs = formData?.style?.inspirationPhotos || [];
    const allRefs = [...lifePhotoRefs, ...inspirationRefs];
    
    for (const refObj of allRefs) {
      // Удаляем оригинал
      if (refObj.path) {
        try {
          await deleteObject(ref(this.storage, refObj.path));
          console.log('Original file deleted:', refObj.path);
        } catch (err) {
          console.error('Error deleting original file:', err);
        }
      }
      
      // Удаляем миниатюру
      if (refObj.thumbnailPath) {
        try {
          await deleteObject(ref(this.storage, refObj.thumbnailPath));
          console.log('Thumbnail file deleted:', refObj.thumbnailPath);
        } catch (err) {
          console.error('Error deleting thumbnail file:', err);
        }
      }
    }
    
    // 2) Удаляем документ из Firestore
    await deleteDoc(doc(this.firestore, `forms/${docId}`));
    console.log('Form document deleted:', docId);
  }
}
