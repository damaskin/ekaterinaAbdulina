import {Component, EventEmitter, inject, Output} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [MatListModule, RouterLink, RouterLinkActive, MatButtonModule, MatIcon],
  template: `
    <div class="menu-container">
      <mat-nav-list>
        @for (route of routes; track route.route) {
          <a
            routerLinkActive
            #rla="routerLinkActive"
            mat-list-item
            routerLink="/{{ route.route }}"
            (click)="closeMenu.emit()"
            [activated]="rla.isActive"
          ><mat-icon>{{ route.icon }}</mat-icon> {{ route.label }}</a
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

    mat-icon {
      margin-right: 8px;
      vertical-align: sub;
    }

  `,
})
export class MainMenuComponent {
  @Output() closeMenu = new EventEmitter<void>();
  private router = inject(Router);
  routes: { label: string; route: string, icon: string }[] = [
    {
      label: 'Main',
      route: 'main',
      icon: 'home',
    },
    {
      label: 'WebApp Data',
      route: 'web-app-data',
      icon: 'web_asset',
    }
  ];
}
