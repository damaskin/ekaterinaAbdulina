import {Component, inject} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {
  DialogElementsExampleDialogComponent
} from "./dialog-elements-example-dialog/dialog-elements-example-dialog.component";
import {MatButton} from "@angular/material/button";

export interface DialogData {
  animal: 'panda' | 'unicorn' | 'lion';
}

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [
    MatButton
  ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  readonly dialog = inject(MatDialog);

  openDialog() {
    this.dialog.open(DialogElementsExampleDialogComponent);
  }
}
