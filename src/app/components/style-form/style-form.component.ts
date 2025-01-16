import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserGreetingComponent } from '../user-greeting/user-greeting.component';
import { TelegramService } from '../../services/telegram.service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-style-form',
  templateUrl: './style-form.component.html',
  styleUrls: ['./style-form.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, UserGreetingComponent, JsonPipe]
})
export class StyleFormComponent implements OnInit {
  styleForm: FormGroup;
  categoryId: number = 0;
  user: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private telegramService: TelegramService
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
  }

  onSubmit() {
    if (this.styleForm.valid) {
      console.log(this.styleForm.value);
      // Здесь будет логика отправки формы
    }
  }
} 