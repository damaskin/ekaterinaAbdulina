import { Component } from '@angular/core';
import {Observable, Observer} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {MatTab, MatTabGroup, MatTabLabel} from "@angular/material/tabs";

export interface ExampleTab {
  label: string;
  content: string;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [
    AsyncPipe,
    MatTabGroup,
    MatTab,
    MatTabLabel
  ],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss'
})
export class TabsComponent {
  asyncTabs: Observable<ExampleTab[]>;

  constructor() {
    this.asyncTabs = new Observable((observer: Observer<ExampleTab[]>) => {
      setTimeout(() => {
        observer.next([
          {label: 'First', content: 'Content 1'},
          {label: 'Second', content: 'Content 2'},
          {label: 'Third', content: 'Content 3'},
        ]);
      }, 1000);
    });
  }
}
