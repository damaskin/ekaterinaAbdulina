import {Component, computed, effect, inject, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatToolbar} from "@angular/material/toolbar";
import {ToolbarComponent} from "./components/toolbar/toolbar.component";
import {MatSidenav, MatSidenavContainer} from "@angular/material/sidenav";
import {MainMenuComponent} from "./components/main-menu/main-menu.component";
import {ThemingService} from "./services/theming.service";
import {ResponsiveService} from "./services/responsive.service";
import {ThemeSelectorComponent} from "./components/theme-selector/theme-selector.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbar, ToolbarComponent, MatSidenavContainer, MainMenuComponent, MatSidenav, ThemeSelectorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
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
      this.themingService.primary() || '#073763');
    document.body.style.setProperty(
      `--primary-light`,
      this.themingService.primaryLight() || '#E6EBEF'
    );
    document.body.style.setProperty(
      `--ripple`,
      this.themingService.ripple() || '#81B6C71e');
    document.body.style.setProperty(
      `--primary-dark`,
      this.themingService.primaryDark() || 'black'
    );
    document.body.style.setProperty(
      `--background`,
      this.themingService.background() || '#fbfcfe'
    );
    document.body.style.setProperty(
      `--error`,
      this.themingService.error() || '#ba1a1a');
  });
}
