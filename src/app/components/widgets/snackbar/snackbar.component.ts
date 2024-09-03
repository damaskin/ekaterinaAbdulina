import {Component, inject} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatButton, MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatButton],
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.scss'
})
export class SnackbarComponent {
  private _snackBar = inject(MatSnackBar);

  openSnackBar() {
    this._snackBar.open('Disco party!', 'Dance');
  }
}
