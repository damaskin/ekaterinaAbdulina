import {Component, model} from '@angular/core';
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatDivider} from "@angular/material/divider";
import {
  MatAnchor,
  MatButton,
  MatFabAnchor,
  MatFabButton,
  MatIconButton,
  MatMiniFabButton
} from "@angular/material/button";
import {RouterLink} from "@angular/router";
import {MatCard} from "@angular/material/card";
import {MatCalendar} from "@angular/material/datepicker";
import {provideNativeDateAdapter} from "@angular/material/core";
import {ButtonsComponent} from "./buttons/buttons.component";
import {FieldsComponent} from "./fields/fields.component";
import {CalendarComponent} from "./calendar/calendar.component";
import {RadioButtonComponent} from "./radio-button/radio-button.component";
import {TabsComponent} from "./tabs/tabs.component";
import {SliderComponent} from "./slider/slider.component";
import {DialogComponent} from "./dialog/dialog.component";
import {SlideToggleComponent} from "./slide-toggle/slide-toggle.component";
import {SnackbarComponent} from "./snackbar/snackbar.component";
import {CheckboxComponent} from "./checkbox/checkbox.component";
import {BottomSheetComponent} from "./bottom-sheet/bottom-sheet.component";

@Component({
  selector: 'app-widgets',
  standalone: true,
  imports: [
    MatInput,
    MatLabel,
    MatFormField,
    MatIcon,
    MatSelect,
    MatOption,
    MatDivider,
    MatMiniFabButton,
    MatFabButton,
    MatFabAnchor,
    RouterLink,
    MatIconButton,
    MatAnchor,
    MatButton,
    MatCard,
    MatCalendar,
    ButtonsComponent,
    FieldsComponent,
    CalendarComponent,
    RadioButtonComponent,
    TabsComponent,
    SliderComponent,
    DialogComponent,
    SlideToggleComponent,
    SnackbarComponent,
    CheckboxComponent,
    BottomSheetComponent
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './widgets.component.html',
  styleUrl: './widgets.component.scss'
})
export class WidgetsComponent {

}
