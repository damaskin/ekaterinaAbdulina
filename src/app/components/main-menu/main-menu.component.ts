import {Component, EventEmitter, inject, Output} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatIcon} from "@angular/material/icon";
import {MenuService} from "../../services/menu.service";

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [MatListModule, RouterLink, RouterLinkActive, MatButtonModule, MatIcon],
  template: `
    <div class="menu-container">
      <mat-nav-list>
        @for (route of menuService.routes; track route.route) {
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
      <div class="menu-footer">
        v.1.0.0
      </div>
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

    .menu-footer {
      padding: 16px;
      font-size: 12px;
      position: absolute;
      bottom: 1px;
    }
  `,
})
export class MainMenuComponent {
  @Output() closeMenu = new EventEmitter<void>();
  menuService = inject(MenuService);
}
