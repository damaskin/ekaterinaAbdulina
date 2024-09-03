import {Component, inject} from '@angular/core';
import {MatListItem, MatListItemTitle, MatNavList} from "@angular/material/list";
import {MatLine} from "@angular/material/core";
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";

@Component({
  selector: 'app-bottom-sheet-overview-example-sheet',
  standalone: true,
  imports: [
    MatNavList,
    MatListItemTitle,
    MatLine,
    MatListItem
  ],
  templateUrl: './bottom-sheet-overview-example-sheet.component.html',
  styleUrl: './bottom-sheet-overview-example-sheet.component.scss'
})
export class BottomSheetOverviewExampleSheetComponent {
  private _bottomSheetRef =
    inject<MatBottomSheetRef<BottomSheetOverviewExampleSheetComponent>>(MatBottomSheetRef);

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
