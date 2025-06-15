import {Component, inject, OnInit} from '@angular/core';
import {DatePipe} from "@angular/common";
import {ITelegramWebAppData} from "../../../interface/telegram-web-app-data";
import {TranslateModule} from "@ngx-translate/core";
import {TelegramService} from "../../../services/telegram.service";

@Component({
  selector: 'app-user-data',
  standalone: true,
  imports: [
    TranslateModule,
    DatePipe
  ],
  templateUrl: './user-data.component.html',
  styleUrl: './user-data.component.scss'
})
export class UserDataComponent implements OnInit {
  public telegramService = inject(TelegramService);
  webAppData!: ITelegramWebAppData;

  ngOnInit(): void {
    this.webAppData = window!.Telegram.WebApp;
  }
}
