import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {WebAppDataComponent} from "../../components/web-app-data/web-app-data.component";
import {TranslateModule} from "@ngx-translate/core";
import {WidgetsComponent} from "../../components/widgets/widgets.component";
import {TelegramService} from "../../services/telegram.service";

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    WebAppDataComponent,
    TranslateModule,
    WidgetsComponent
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent implements OnInit, OnDestroy {
  private readonly telegramService = inject(TelegramService);

  ngOnInit(): void {
    this.telegramService.showMainBtn();
  }

  ngOnDestroy(): void {
    this.telegramService.hideMainBtn();
  }
}
