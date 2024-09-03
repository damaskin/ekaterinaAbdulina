import { Component } from '@angular/core';
import {MatRadioModule} from "@angular/material/radio";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-radio-button',
  standalone: true,
  imports: [MatRadioModule, FormsModule],
  templateUrl: './radio-button.component.html',
  styleUrl: './radio-button.component.scss'
})
export class RadioButtonComponent {
  favoriteSeason: string = 'Winter';
  seasons: string[] = ['Winter', 'Spring', 'Summer', 'Autumn'];
}
