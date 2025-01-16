import {Component, inject} from '@angular/core';
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    TranslateModule,
    MatCardModule, MatButtonModule
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  translate = inject(TranslateService);
}
