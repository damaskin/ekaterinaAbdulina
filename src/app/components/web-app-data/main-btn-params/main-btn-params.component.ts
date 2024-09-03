import { Component } from '@angular/core';
import {ITelegramWebAppData} from "../../../interface/telegram-web-app-data";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-main-btn-params',
  standalone: true,
  imports: [
    TranslateModule
  ],
  templateUrl: './main-btn-params.component.html',
  styleUrl: './main-btn-params.component.scss'
})
export class MainBtnParamsComponent {
  webAppData!: ITelegramWebAppData;

  ngOnInit(): void {
    this.webAppData = window!.Telegram.WebApp;
  }
}
