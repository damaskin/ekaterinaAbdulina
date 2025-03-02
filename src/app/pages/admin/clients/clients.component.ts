import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { TelegramService } from '../../../services/telegram.service';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { IUser } from '../../../interfaces/user.interface';
import { FirebaseService } from '../../../services/firebase.service';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { UserDetailsSheetComponent } from '../../../components/user-details-sheet/user-details-sheet.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  standalone: true,
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
  imports: [
    CommonModule, 
    FormsModule, 
    MatInputModule, 
    MatBottomSheetModule, 
    MatIconModule, 
    MatButtonModule, 
    MatProgressSpinnerModule,
    MatCardModule,
    MatFormFieldModule,
    MatDividerModule
  ]
})
export class ClientsComponent implements OnInit {
  private router = inject(Router);
  private firestore = inject(Firestore);
  private telegramService = inject(TelegramService);
  private firebaseService = inject(FirebaseService);
  private bottomSheet = inject(MatBottomSheet);

  admin: boolean = false;
  users: IUser[] = [];
  searchTerm: string = '';
  
  filteredUsers = signal<IUser[]>([]);
  isLoading = true;
  error = false;
  errorMessage = '';

  constructor() {
    // existing injections...
  }

  ngOnInit(): void {
    // Настраиваем заголовок в Telegram WebApp
    if (this.telegramService.tg) {
      this.telegramService.tg.BackButton.show();
      this.telegramService.tg.BackButton.onClick(() => {
        this.router.navigate(['/main']);
      });
    }

    const user = this.telegramService.telegramUser || {};
    this.admin = Boolean(user.isAdmin);
    if (!this.admin) {
      this.router.navigate(['/']);
      return;
    }

    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = false;

    this.firebaseService.getUsers().subscribe({
      next: (data) => {
        this.users = data.users as IUser[];
        this.filteredUsers.set(this.users);
        this.filterUsers();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Ошибка при загрузке пользователей:', err);
        this.isLoading = false;
        this.error = true;
        this.errorMessage = 'Не удалось загрузить список клиентов. Пожалуйста, попробуйте позже.';
      }
    });
  }

  filterUsers(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredUsers.set(this.users);
      return;
    }
    const filtered = this.users.filter((u) => {
      const firstName = (u.first_name || '').toLowerCase();
      const lastName = (u.last_name || '').toLowerCase();
      const id = String(u.id || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      return firstName.includes(term) || 
             lastName.includes(term) || 
             id.includes(term) || 
             username.includes(term);
    });
    this.filteredUsers.set(filtered);
  }

  async toggleActive(u: IUser): Promise<void> {
    // ... existing code ...
  }

  openUserDetails(user: IUser): void {
    this.bottomSheet.open(UserDetailsSheetComponent, {
      data: user,
      panelClass: 'bottom-sheet-container'
    });
  }

  goToHome(): void {
    this.router.navigate(['/main']);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  }
} 