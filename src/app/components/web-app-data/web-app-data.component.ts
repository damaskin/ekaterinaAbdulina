import {Component, inject, OnInit} from '@angular/core';
import {TelegramService} from "../../services/telegram.service";
import {JsonPipe, NgOptimizedImage} from "@angular/common";
import {ITelegramWebAppData} from "../../interface/telegram-web-app-data";
import {UserDataComponent} from "./user-data/user-data.component";
import {ThemeParamsComponent} from "./theme-params/theme-params.component";
import {TranslateModule} from "@ngx-translate/core";
import {MainBtnParamsComponent} from "./main-btn-params/main-btn-params.component";

@Component({
  selector: 'app-web-app-data',
  standalone: true,
  imports: [
    JsonPipe,
    NgOptimizedImage,
    UserDataComponent,
    ThemeParamsComponent,
    TranslateModule,
    MainBtnParamsComponent,
  ],
  templateUrl: './web-app-data.component.html',
  styleUrl: './web-app-data.component.scss'
})
export class WebAppDataComponent implements OnInit {
  webAppData!: ITelegramWebAppData;

  ngOnInit(): void {
    this.webAppData = window!.Telegram.WebApp;
  }

}
