import {Component, OnInit} from '@angular/core';
import {ITelegramWebAppData} from "../../../interface/telegram-web-app-data";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-theme-params',
  standalone: true,
  imports: [
    TranslateModule
  ],
  templateUrl: './theme-params.component.html',
  styleUrl: './theme-params.component.scss'
})
export class ThemeParamsComponent implements OnInit {
  webAppData!: ITelegramWebAppData;

  ngOnInit(): void {
    this.webAppData = window!.Telegram.WebApp;
  }
}
