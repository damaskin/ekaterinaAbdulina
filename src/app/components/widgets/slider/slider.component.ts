import { Component } from '@angular/core';
import {MatSlider, MatSliderThumb} from "@angular/material/slider";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [
    MatSlider,
    MatSliderThumb,
    FormsModule
  ],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss'
})
export class SliderComponent {
  value = 50;
}
