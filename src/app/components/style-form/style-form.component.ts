import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TelegramService } from '../../services/telegram.service';
import { JsonPipe } from '@angular/common';
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { MatLabel } from "@angular/material/form-field";
import { MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IMaskModule } from 'angular-imask';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MASKS } from '../../masks/mask-config';
import { FormElementComponent } from '../../shared/components/form-element/form-element.component';
import { validationConfig } from '../../validation/validation-config';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { Firestore, collection, addDoc, deleteDoc, doc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';

@Component({
  selector: 'app-style-form',
  templateUrl: './style-form.component.html',
  styleUrls: ['./style-form.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    JsonPipe,
    MatSlideToggle,
    MatLabel,
    MatFormField,
    MatInput,
    MatProgressSpinnerModule,
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
  user: any;
  router = inject(Router);
  isLoading: boolean = true; // флаг загрузки
  MASKS = MASKS;
  lifePhotoFiles: File[] = [];
  inspirationPhotoFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private telegramService: TelegramService,
    private firestore: Firestore,
    private storage: Storage
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

    if (window.Telegram && window.Telegram.WebApp) {
      // Настройка Main Button с текстом "Отправить"
      window.Telegram.WebApp.MainButton.setText("Отправить");
      window.Telegram.WebApp.MainButton.show();
      window.Telegram.WebApp.MainButton.onClick(() => this.onSubmit());

      // Настройка Back Button
      if (window.Telegram.WebApp.BackButton) {
        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(() => {
          this.router.navigate(['/main']);
        });
      }
    }

    // this.styleForm.setValue({
    //   personalInfo: {
    //     fullName: 'Иванов Иван Иванович',
    //     age: 25,
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
    //       height: 185,
    //       shoeSize: 43,
    //       bust: 100,
    //       waist: 80,
    //       hips: 100
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

  // После отображения всех дочерних компонентов ждем 1.5 секунды и убираем loader
  ngAfterViewInit() {
    this.isLoading = false;
  }

  ngOnDestroy() {
    // Убираем кнопки Telegram WebApp при уничтожении компонента
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.MainButton.hide();
      window.Telegram.WebApp.MainButton.offClick();
      window.Telegram.WebApp.BackButton.hide();
      window.Telegram.WebApp.BackButton.offClick();
    }
  }

  onSelect(event: any, fieldName: 'lifePhotos' | 'inspirationPhotos') {
    const addedFiles: File[] = event.addedFiles;
    if (!addedFiles?.length) return;

    // For each file, upload to Storage, then store downloadURL + storage path in form
    addedFiles.forEach(async (file) => {
      const uniquePath = `forms/${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, uniquePath);

      try {
        // 1) Upload file
        await uploadBytes(storageRef, file);
        // 2) Get download URL
        const downloadURL = await getDownloadURL(storageRef);

        // 3) Store references in the form
        // We'll store an array of objects: { path, url }
        const control = this.styleForm.get(['style', fieldName]);
        if (control) {
          // Get current array or init
          const currentValue = control.value || [];
          currentValue.push({ path: uniquePath, url: downloadURL });
          control.setValue(currentValue);
        }

        // Also, for local preview, if you want:
        if (fieldName === 'lifePhotos') {
          this.lifePhotoFiles.push(file);
        } else {
          this.inspirationPhotoFiles.push(file);
        }

      } catch (error) {
        console.error('Error uploading file:', error);
      }
    });
  }

  onRemove(fileOrRef: File | { path: string, url: string }, fieldName: 'lifePhotos' | 'inspirationPhotos') {
    // If you still keep local File[] for preview, remove from there
    if (fileOrRef instanceof File) {
      const targetArray = (fieldName === 'lifePhotos')
        ? this.lifePhotoFiles
        : this.inspirationPhotoFiles;
      const index = targetArray.indexOf(fileOrRef);
      if (index > -1) targetArray.splice(index, 1);
    }

    // Now remove from form
    const control = this.styleForm.get(['style', fieldName]);
    if (!control?.value?.length) return;

    let fileRef: { path: string, url: string } | null = null;

    if (!(fileOrRef instanceof File)) {
      // If user triggered remove from the NgxDropzoneImagePreview (which might pass an object)
      fileRef = fileOrRef;
    } else {
      // Possibly match the local file's name with something we stored
      // This depends on how you're tying local File[] with the stored references.
      // If you stored them by name, you'd do something like:
      // fileRef = control.value.find((x: any) => x.path.includes(fileOrRef.name));
      // This is optional logic to map local file to stored reference.
    }

    // If we found the reference, remove from Storage + remove from array
    if (fileRef) {
      // 1) remove from form array
      const newArr = control.value.filter((item: any) => item.path !== fileRef!.path);
      control.setValue(newArr);

      // 2) remove actual file from Storage
      const storageRef = ref(this.storage, fileRef.path);
      deleteObject(storageRef)
        .then(() => console.log('Storage file deleted:', fileRef?.path))
        .catch(err => console.error('Storage delete error:', err));
    }
  }

  onSubmit(): void {
    console.log(this.styleForm);
    
    if (this.styleForm.valid) {
      console.log(this.styleForm.value);
      const formData = {
        ...this.styleForm.value,
        category: this.categoryId,
        userId: this.user?.id,
        createdAt: new Date()
      };

      const formsRef = collection(this.firestore, 'forms');
      addDoc(formsRef, formData)
        .then(docRef => {
          console.log('Form data saved with ID:', docRef.id);
        })
        .catch(error => {
          console.error('Error saving form data:', error);
        });
    } else {
      console.error('Form is invalid');
    }
  }

  async deleteForm(docId: string, formData: any): Promise<void> {
    // 1) Remove the Firestore document
    await deleteDoc(doc(this.firestore, `forms/${docId}`));

    // 2) Get all storage paths from the form
    //    Combine the arrays for lifePhotos + inspirationPhotos
    const lifePhotoRefs = formData?.style?.lifePhotos || [];
    const inspirationRefs = formData?.style?.inspirationPhotos || [];
    const allRefs = [...lifePhotoRefs, ...inspirationRefs]; // each is { path, url }

    // 3) Delete each file from Storage
    for (const refObj of allRefs) {
      if (!refObj.path) continue;
      try {
        await deleteObject(ref(this.storage, refObj.path));
        console.log('storage file deleted:', refObj.path);
      } catch (err) {
        console.error('Error deleting file from storage:', err);
      }
    }
  }
}
