import {Component, computed, inject, model} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ResponsiveService} from '../../services/responsive.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatIcon, MatButtonModule],
  template: `
    <button
      mat-icon-button
      (click)="componentSelectorOpen.set(!componentSelectorOpen())"
    >
      <mat-icon>menu</mat-icon>
    </button>
    {{ title() }}
    <button
      mat-icon-button
      (click)="themeSelectorOpen.set(!themeSelectorOpen())"
    >
      <mat-icon>settings</mat-icon>
    </button>
  `,
  styles: `

    :host {
      display: flex;
      justify-content: space-between;
      align-items: center;
      --mdc-icon-button-icon-color: var(--primary-light);
      width: 100%;
    }

  `,
})
export class ToolbarComponent {
  componentSelectorOpen = model.required<boolean>();
  themeSelectorOpen = model.required<boolean>();

  responsiveService = inject(ResponsiveService);

  title = computed(
    () => `${
      this.responsiveService.largeWidth() ? 'Telegram Template ' : 'TgTemplate'
    }`
  );
}
