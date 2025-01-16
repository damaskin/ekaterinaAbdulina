import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {WebAppDataComponent} from "../../components/web-app-data/web-app-data.component";
import {TelegramService} from "../../services/telegram.service";

@Component({
  selector: 'app-web-app-data-page',
  standalone: true,
  imports: [
    WebAppDataComponent
  ],
  templateUrl: './web-app-data-page.component.html',
  styleUrl: './web-app-data-page.component.scss'
})
export class WebAppDataPageComponent implements OnInit, OnDestroy {
  private readonly telegramService = inject(TelegramService);

  ngOnInit(): void {
    // this.telegramService.showMainBtn();
  }

  ngOnDestroy(): void {
    this.telegramService.hideMainBtn();
  }

}
