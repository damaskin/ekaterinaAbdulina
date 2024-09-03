import {Component, model} from '@angular/core';
import {MatCalendar} from "@angular/material/datepicker";
import {MatCard} from "@angular/material/card";

@Component({
  selector: 'app-calendar',
  standalone: true,
    imports: [
        MatCalendar,
        MatCard
    ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {
  selected = model<Date | null>(null);
}
