import { Component } from '@angular/core';
import {MatSlideToggle} from "@angular/material/slide-toggle";

@Component({
  selector: 'app-slide-toggle',
  standalone: true,
  imports: [
    MatSlideToggle
  ],
  templateUrl: './slide-toggle.component.html',
  styleUrl: './slide-toggle.component.scss'
})
export class SlideToggleComponent {

}
