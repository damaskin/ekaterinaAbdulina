import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from "@ngx-translate/core";
import { TelegramService } from "../../services/telegram.service";
import { ServiceCategoriesComponent } from '../../components/service-categories/service-categories.component';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    TranslateModule,
    ServiceCategoriesComponent
],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent implements OnInit, OnDestroy {
  private readonly telegramService = inject(TelegramService);
  user: any;

  ngOnInit(): void {
    // this.telegramService.showMainBtn();
    // this.user = this.telegramService.initUser(); // Получение данных пользователя
  }

  ngOnDestroy(): void {
    this.telegramService.cleanup();
    this.telegramService.hideAllButtons();
  }
}
