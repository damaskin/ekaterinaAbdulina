import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Firestore, collection, collectionData, query } from '@angular/fire/firestore';
import { TelegramService } from '../../services/telegram.service';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { IUser } from '../../interfaces/user.interface';
import { FirebaseService } from '../../services/firebase.service';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { UserDetailsSheetComponent } from '../user-details-sheet/user-details-sheet.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  selector: 'app-clients-page',
  template: `
        <div class="clients-page">
      <div class="title">Мои клиенты</div>

      <div class="search-box">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Поиск ID, или username...</mat-label>
          <input
            matInput
            [(ngModel)]="searchTerm"
            (input)="filterUsers()"
          />
        </mat-form-field>
      </div>

      <div *ngIf="isLoading" class="loader-container">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
    </div>

      @if (!isLoading) {
      <div class="user-cards">
        <div class="user-card" *ngFor="let u of filteredUsers()" (click)="openBottomSheet(u)">
            <img
                class="avatar"
                [src]="u.photo_url"
                alt="Avatar"
                *ngIf="u.photo_url"
            />
            <div class="user-info">
                <div class="username">{{ u.username }}</div>
                <div>{{ u.first_name }} {{ u.last_name }}</div>
            </div>
            <button mat-mini-fab aria-label="Example icon button with a menu icon">
                <mat-icon>settings</mat-icon>
            </button>
        </div>
      </div>
    }
    </div>
  
    <!-- <pre>{{ users | json }}</pre> -->
  `,
  styleUrls: [
    './clients-page.component.scss'
  ],
  imports: [CommonModule, FormsModule, MatTableModule, MatInputModule, MatBottomSheetModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule]
})
export class ClientsPageComponent implements OnInit {
  private router = inject(Router);
  private firestore = inject(Firestore);
  private telegramService = inject(TelegramService);
  private firebaseService = inject(FirebaseService);
  private bottomSheet = inject(MatBottomSheet);

  admin: boolean = false;
  users: IUser[] = [];
  searchTerm: string = '';

  filteredUsers = signal<IUser[]>([]);
  displayedColumns: string[] = ['id', 'username', 'fullName', 'isActive', 'actions'];
  isLoading = true;

  constructor() {
    // existing injections...
  }

  ngOnInit(): void {
    const user = this.telegramService.telegramUser || {};
    this.admin = Boolean(user.isAdmin);
    if (!this.admin) {
      this.router.navigate(['/']);
      return;
    }

    // Correctly create a query for the users collection
    this.firebaseService.getUsers().subscribe((data) => {
        this.users = data.users as IUser[];
        this.filteredUsers.set(this.users);
        this.filterUsers();
        this.isLoading = false;
    });
  }

  filterUsers(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredUsers.set(this.users);
      return;
    }
    const filtered = this.users.filter((u) => {
      const name = (u.fullName || '').toLowerCase();
      const id = String(u.id || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      return name.includes(term) || id.includes(term) || username.includes(term);
    });
    this.filteredUsers.set(filtered);
  }

  async toggleActive(u: IUser): Promise<void> {
    // ... existing code ...
  }

  openBottomSheet(u: IUser): void {
    this.bottomSheet.open(UserDetailsSheetComponent, {
      data: u
    });
  }
}