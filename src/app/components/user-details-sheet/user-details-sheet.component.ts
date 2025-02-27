import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { IUser } from '../../interfaces/user.interface';

@Component({
  standalone: true,
  selector: 'app-user-details-sheet',
  imports: [CommonModule],
  template: `
    <div class="user-details-sheet">
      <h2>{{ data.username }}</h2>
      <p>Full name: {{ data.fullName }}</p>
      <p>Premium: {{ data.isPremium ? 'YES' : 'NO' }}</p>
      <p>Active: {{ data.isActive ? 'YES' : 'NO' }}</p>
      <!-- Add any other user fields you want -->
    </div>
  `,
  styleUrls: ['./user-details-sheet.component.scss']
})
export class UserDetailsSheetComponent implements OnInit, OnDestroy {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: IUser,
    private bottomSheetRef: MatBottomSheetRef<UserDetailsSheetComponent>
  ) {}

  ngOnInit(): void {
    if (window.Telegram && window.Telegram.WebApp) {
      // Main Button for "Сохранить"
      window.Telegram.WebApp.MainButton.setText('Сохранить');
      window.Telegram.WebApp.MainButton.show();
      window.Telegram.WebApp.MainButton.onClick(() => this.onSave());
      window.Telegram.WebApp.SecondaryButton.setText('Отмена');
      window.Telegram.WebApp.SecondaryButton.show();
      window.Telegram.WebApp.SecondaryButton.onClick(() => this.onCancel());

      // Back Button for "Отмена"
      window.Telegram.WebApp.BackButton.show();
      window.Telegram.WebApp.BackButton.offClick();
      window.Telegram.WebApp.BackButton.onClick(() => this.onCancel());
    }
  }

  ngOnDestroy(): void {
    // Hide both buttons when leaving this sheet
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.MainButton.hide();
      window.Telegram.WebApp.MainButton.offClick();
      window.Telegram.WebApp.SecondaryButton.hide();
      window.Telegram.WebApp.SecondaryButton.offClick();
      window.Telegram.WebApp.BackButton.hide();
      window.Telegram.WebApp.BackButton.offClick();
    }
  }

  onSave(): void {
    // Implementation of saving
    console.log('SAVE user:', this.data);
    // For instance: Call API, then close bottom sheet
    this.bottomSheetRef.dismiss();
  }

  onCancel(): void {
    // Implementation of cancel
    console.log('CANCEL editing user');
    this.bottomSheetRef.dismiss();
  }
} 