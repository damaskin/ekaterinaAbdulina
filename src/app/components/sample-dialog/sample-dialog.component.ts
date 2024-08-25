import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-sample-dialog',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatButtonModule, MatInput],
  template: `
    <h2 mat-dialog-title>Hi Zoaib</h2>
    <mat-dialog-content>
      <p>What's your favorite animal?</p>
      <mat-form-field>
        <mat-label>Favorite Animal</mat-label>
        <input matInput />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button>No Thanks</button>
      <button mat-button mat-dialog-close cdkFocusInitial>Ok</button>
    </mat-dialog-actions>
  `,
  styles: ``,
})
export class SampleDialogComponent {}
