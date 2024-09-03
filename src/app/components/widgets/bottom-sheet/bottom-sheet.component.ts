import {Component, inject} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {
  BottomSheetOverviewExampleSheetComponent
} from "./bottom-sheet-overview-example-sheet/bottom-sheet-overview-example-sheet.component";

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [
    MatButton
  ],
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.scss'
})
export class BottomSheetComponent {
  private _bottomSheet = inject(MatBottomSheet);

  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetOverviewExampleSheetComponent);

  }
}
