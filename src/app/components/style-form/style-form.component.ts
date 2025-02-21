import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { UserGreetingComponent } from '../user-greeting/user-greeting.component';
import { TelegramService } from '../../services/telegram.service';
import { JsonPipe } from '@angular/common';
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { MatLabel } from "@angular/material/form-field";
import { MatFormField } from "@angular/material/form-field";
import { MatButton } from "@angular/material/button";
import { MatInput } from "@angular/material/input";
import { MatCard } from "@angular/material/card";
import { MatCardContent } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-style-form',
  templateUrl: './style-form.component.html',
  styleUrls: ['./style-form.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    UserGreetingComponent,
    JsonPipe,
    MatSlideToggle,
    MatLabel,
    MatFormField,
    MatButton,
    MatInput,
    MatCard,
    MatCardContent,
    MatIcon,
    MatProgressSpinnerModule
  ]
})
export class StyleFormComponent implements OnInit, AfterViewInit, OnDestroy {
  styleForm: FormGroup;
  categoryId: number = 0;
  user: any;
  router = inject(Router);
  isLoading: boolean = true; // флаг загрузки

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private telegramService: TelegramService,
    private location: Location
  ) {
    this.styleForm = this.fb.group({
      personalInfo: this.fb.group({
        fullName: ['', Validators.required],
        age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
        location: ['', Validators.required],
        occupation: ['', Validators.required],
        hobbies: ['', Validators.required],
        maritalStatus: ['', Validators.required]
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
        lifePhotos: ['', Validators.required],
        inspirationPhotos: ['', Validators.required],
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
    this.user = this.telegramService.initUser();

    if (window.Telegram && window.Telegram.WebApp) {
      // Настройка Main Button с текстом "Отправить"
      window.Telegram.WebApp.MainButton.setText("Отправить");
      window.Telegram.WebApp.MainButton.show();

      // Настройка Back Button
      if (window.Telegram.WebApp.BackButton) {
        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(() => {
          this.router.navigate(['/main']);
        });
      }
    }
  }

  // После отображения всех дочерних компонентов ждем 1.5 секунды и убираем loader
  ngAfterViewInit() {
    this.isLoading = false;
  }

  ngOnDestroy() {
    // Убираем кнопки Telegram WebApp при уничтожении компонента
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.MainButton.hide();
      if (window.Telegram.WebApp.BackButton) {
        window.Telegram.WebApp.BackButton.hide();
      }
    }
  }

  onSubmit() {
    if (this.styleForm.valid) {
      console.log(this.styleForm.value);
      // Логика отправки формы
    }
  }
}
