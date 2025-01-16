import { Component, Input } from '@angular/core';
import { ITelegramUser } from '../../interface/telegram-user';

@Component({
  selector: 'app-user-greeting',
  templateUrl: './user-greeting.component.html',
  styleUrls: ['./user-greeting.component.scss'],
  standalone: true
})
export class UserGreetingComponent {
  @Input() user?: ITelegramUser;
} 