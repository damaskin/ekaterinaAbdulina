import { Component, inject } from '@angular/core';
import { ThemingService } from '../../services/theming.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInput, FormsModule],
  template: `
    <div class="container">
      <h3>Presets</h3>
      <div class="flex-row">
        @for (theme of theming.definedThemes; track theme.name) {
        <button mat-raised-button (click)="theming.applyTheme(theme)">
          {{ theme.name }}
        </button>
        }
      </div>

      <h3>Colors</h3>
      <mat-form-field appearance="outline">
        <mat-label>Primary</mat-label>
        <input
          matInput
          [ngModel]="theming.primary()"
          (ngModelChange)="theming.setPrimary($event)"
        />
        <div
          matSuffix
          class="indicator"
          [style.background]="theming.primary()"
        ></div>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Primary Light</mat-label>
        <input
          matInput
          [ngModel]="theming.primaryLight()"
          (ngModelChange)="theming.setPrimaryLight($event)"
        />
        <div
          matSuffix
          class="indicator"
          [style.background]="theming.primaryLight()"
        ></div>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Ripple</mat-label>
        <input
          matInput
          [ngModel]="theming.ripple()"
          (ngModelChange)="theming.setRipple($event)"
        />
        <div
          matSuffix
          class="indicator"
          [style.background]="theming.ripple()"
        ></div>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Primary Dark</mat-label>
        <input
          matInput
          [ngModel]="theming.primaryDark()"
          (ngModelChange)="theming.setPrimaryDark($event)"
        />
        <div
          matSuffix
          class="indicator"
          [style.background]="theming.primaryDark()"
        ></div>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Background</mat-label>
        <input
          matInput
          [ngModel]="theming.background()"
          (ngModelChange)="theming.setBackground($event)"
        />
        <div
          matSuffix
          class="indicator"
          [style.background]="theming.background()"
        ></div>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Error</mat-label>
        <input
          matInput
          [ngModel]="theming.error()"
          (ngModelChange)="theming.setError($event)"
        />
        <div
          matSuffix
          class="indicator"
          [style.background]="theming.error()"
        ></div>
      </mat-form-field>
    </div>
  `,
  styles: `
  
  .container {
    padding: 16px;
  }

  .indicator {
    width: 20px;
    height: 20px;
    border-radius: 100%;
    margin-right: 8px;
  }

  `,
})
export class ThemeSelectorComponent {
  theming = inject(ThemingService);
}
