import {Component, computed, inject, Input, model, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ResponsiveService} from '../../services/responsive.service';
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {TelegramService} from "../../services/telegram.service";
import {ITelegramWebAppData} from "../../interface/telegram-web-app-data";
import { UserGreetingComponent } from "../user-greeting/user-greeting.component";


@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatIcon, MatButtonModule, MatMenu, MatMenuTrigger, MatMenuItem, UserGreetingComponent],
  template: `
    <button
      mat-icon-button
      (click)="componentSelectorOpen.set(!componentSelectorOpen())"
    >
      <mat-icon>menu</mat-icon>
    </button>
    <app-user-greeting [user]="user"></app-user-greeting>
    <!-- <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Example icon-button with a menu">
      <mat-icon>settings</mat-icon>
    </button> -->
    <!-- <mat-menu #menu="matMenu">
      <button mat-menu-item (click)="changeToolbarTheme('Default')">
        <mat-icon>format_paint</mat-icon>
        <span>Toolbar style 1</span>
      </button>
      <button mat-menu-item (click)="changeToolbarTheme('Reversed')">
        <mat-icon>format_paint</mat-icon>
        <span>Toolbar style 2</span>
      </button>
      <button mat-menu-item (click)="changeToolbarTheme('Secondary')">
        <mat-icon>format_paint</mat-icon>
        <span>Toolbar style 3</span>
      </button>
    </mat-menu> -->
  `,
  styles: `

    :host {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--mat-toolbar-container-text-color);
      --mdc-icon-button-icon-color: var(--mat-toolbar-container-text-color);
      width: 100%;
    }

  `,
})
export class ToolbarComponent implements OnInit {
  @Input() user: any;
  componentSelectorOpen = model.required<boolean>();
  themeSelectorOpen = model.required<boolean>();

  responsiveService = inject(ResponsiveService);
  telegramService = inject(TelegramService);
  webAppData: ITelegramWebAppData = window!.Telegram.WebApp;

  title = computed(
    () => `${
      this.responsiveService.largeWidth() ? 'Екатерина Абдулина' : 'Екатерина Абдулина'
    }`
  );

  ngOnInit(): void {
    this.changeToolbarTheme('Reversed');
  }

  changeToolbarTheme(theme: string) {
    switch (theme) {
      case 'Default':
        document.body.style.setProperty(
          `--mat-toolbar-container-background-color`,
          this.webAppData.platform === 'unknown' ? '#3390ec' : 'var(--tg-theme-button-color)'
        );
        document.body.style.setProperty(
          `--mat-toolbar-container-text-color`,
          this.webAppData.platform === 'unknown' ? '#ffffff' : 'var(--tg-theme-button-text-color)'
        );
        break;
      case 'Reversed':
        document.body.style.setProperty(
          `--mat-toolbar-container-background-color`,
          this.webAppData.platform === 'unknown' ? '#ffffff' : this.webAppData.themeParams.bg_color
        );
        document.body.style.setProperty(
          `--mat-toolbar-container-text-color`,
          this.webAppData.platform === 'unknown' ? '#3390ec' : this.webAppData.themeParams.button_color
        );
        break;
      case 'Secondary':
        document.body.style.setProperty(
          `--mat-toolbar-container-background-color`,
          this.webAppData.platform === 'unknown' ? '#f4f4f4' : this.webAppData.themeParams.secondary_bg_color
        );
        document.body.style.setProperty(
          `--mat-toolbar-container-text-color`,
          this.webAppData.platform === 'unknown' ? '#3390ec' : 'var(--tg-theme-button-color)'
        );
        break;
    }
  }


}
