import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  routes: { label: string; route: string; icon: string, isAdmin: boolean }[] = [
    {
      label: 'Главная',
      route: 'main',
      icon: 'home',
      isAdmin: false,
    },
    {
      label: 'Клиенты',
      route: 'clients',
      icon: 'account_circle',
      isAdmin: true,
    },
    // {
    //   label: 'WebApp Data',
    //   route: 'web-app-data',
    //   icon: 'web_asset',
    //   isAdmin: false,
    // },
  ];

  addRoute(route: { label: string; route: string; icon: string, isAdmin: boolean }) {
    this.routes.push(route);
  }
}
