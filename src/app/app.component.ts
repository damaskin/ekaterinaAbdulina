import {Component, computed, effect, inject, Input, OnInit, signal} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {MatToolbar} from "@angular/material/toolbar";
import {ToolbarComponent} from "./components/toolbar/toolbar.component";
import {MatSidenav, MatSidenavContainer} from "@angular/material/sidenav";
import {MainMenuComponent} from "./components/main-menu/main-menu.component";
import {ThemingService} from "./services/theming.service";
import {ResponsiveService} from "./services/responsive.service";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {TelegramService} from "./services/telegram.service";
import {UserGreetingComponent} from "./components/user-greeting/user-greeting.component";
import {FirebaseService} from "./services/firebase.service";
import { JsonPipe } from '@angular/common';
@Component({
  selector: 'app-root',
  standalone: true,
    imports: [RouterOutlet, MatToolbar, ToolbarComponent, MatSidenavContainer, MainMenuComponent, MatSidenav, TranslateModule, UserGreetingComponent, JsonPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  user: any;
  telegramService = inject(TelegramService);
  translate = inject(TranslateService);
  router = inject(Router);
  themeSelectorOpen = signal(false);
  componentSelectorOpen = signal(false);
  themingService = inject(ThemingService);
  responsiveService = inject(ResponsiveService);
  firebaseService = inject(FirebaseService);

  componentSelectorMode = computed(() => {
    if (this.responsiveService.smallWidth()) {
      return 'over';
    }

    return 'side';
  });

  setTheme = effect(() => {
    document.body.style.setProperty(
      `--primary`,
      this.themingService.primary() || '#3390ec');
    document.body.style.setProperty(
      `--primary-light`,
      this.themingService.primaryLight() || '#f4f4f5'
    );
    document.body.style.setProperty(
      `--ripple`,
      this.themingService.ripple() || '#3390ec1e');
    document.body.style.setProperty(
      `--primary-dark`,
      this.themingService.primaryDark() || '#707579'
    );
    document.body.style.setProperty(
      `--background`,
      this.themingService.background() || '#ffffff'
    );
    document.body.style.setProperty(
      `--error`,
      this.themingService.error() || '#ba1a1a');
  });

  closeMenu() {
    this.componentSelectorOpen.set(!this.componentSelectorOpen())
  }

  ngOnInit(): void {
    this.translate.setDefaultLang('en');
    this.initUser();
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }

  private initUser(): void {
    let user = this.telegramService.initUser();
    
    // Если данных нет в Telegram WebApp, загружаем из sessionStorage
    if (!user || !user.id) {
      const storedUser = sessionStorage.getItem('telegramUser');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
        console.log('Loaded user from sessionStorage:', this.user);
        return;
      } else {
        this.router.navigate(['/auth']).then();
        return;
      }
    }
  
    // Сохраняем пользователя в sessionStorage
    this.user = user;
    sessionStorage.setItem('telegramUser', JSON.stringify(user));
  
    this.firebaseService.getUserData(user.id)
      .then((firebaseUserData) => {
        this.user = { ...user, ...firebaseUserData };
        console.log('User data from Firebase:', this.user);
        
        this.telegramService.telegramUser = this.user;
        sessionStorage.setItem('telegramUser', JSON.stringify(this.user));
      })
      .catch((error) => {
        console.error('Error fetching user data from Firebase:', error);
        this.router.navigate(['/auth']).then();
      });
  }

}
