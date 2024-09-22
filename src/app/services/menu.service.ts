import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  routes: { label: string; route: string; icon: string }[] = [
    {
      label: 'Main',
      route: 'main',
      icon: 'home',
    },
    {
      label: 'WebApp Data',
      route: 'web-app-data',
      icon: 'web_asset',
    },
  ];

  addRoute(route: { label: string; route: string; icon: string }) {
    this.routes.push(route);
  }
}
