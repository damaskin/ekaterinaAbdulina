import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {MatToolbar} from "@angular/material/toolbar";
import {ToolbarComponent} from "./components/toolbar/toolbar.component";
import {MatSidenav, MatSidenavContainer} from "@angular/material/sidenav";
import {MainMenuComponent} from "./components/main-menu/main-menu.component";
import {ThemingService} from "./services/theming.service";
import {ResponsiveService} from "./services/responsive.service";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {TelegramService} from "./services/telegram.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbar, ToolbarComponent, MatSidenavContainer, MainMenuComponent, MatSidenav, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  telegramService = inject(TelegramService);
  translate = inject(TranslateService);
  router = inject(Router);
  themeSelectorOpen = signal(false);
  componentSelectorOpen = signal(false);
  themingService = inject(ThemingService);
  responsiveService = inject(ResponsiveService);

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
    const user = this.telegramService.initUser();
    if (user && user.id) {
      this.router.navigate(['/main']).then();
    } else {
      this.router.navigate(['/auth']).then();
    }
  }
}
