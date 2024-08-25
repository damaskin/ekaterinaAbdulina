import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [MatListModule, RouterLink, RouterLinkActive, MatButtonModule],
  template: `
    <div class="menu-container">
      <mat-nav-list>
        @for (route of routes; track route.route) {
        <a
          routerLinkActive
          #rla="routerLinkActive"
          mat-list-item
          routerLink="/{{ route.route }}"
          [activated]="rla.isActive"
          >{{ route.label }}</a
        >
        }
      </mat-nav-list>
    </div>
  `,
  styles: `

  :host {
    display: block;
  }

  .menu-container {
    padding: 8px;
  }

  `,
})
export class MainMenuComponent {
  routes: { label: string; route: string }[] = [
    {
      label: 'Main',
      route: 'main',
    }
  ];
}
