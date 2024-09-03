import { Component } from '@angular/core';
import {MatFormField, MatHint, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";

@Component({
  selector: 'app-fields',
  standalone: true,
    imports: [
        MatFormField,
        MatHint,
        MatIcon,
        MatInput,
        MatLabel,
        MatSuffix
    ],
  templateUrl: './fields.component.html',
  styleUrl: './fields.component.scss'
})
export class FieldsComponent {

}
