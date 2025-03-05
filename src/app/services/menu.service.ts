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
      label: 'Мои заказы',
      route: 'my-orders',
      icon: 'shopping_cart',
      isAdmin: false,
    },
    {
      label: 'Клиенты',
      route: 'clients',
      icon: 'account_circle',
      isAdmin: true,
    },
    {
      label: 'Все заказы',
      route: 'admin/orders',
      icon: 'receipt_long',
      isAdmin: true,
    },
    // {
    //   label: 'WebApp Data',
    //   route: 'web-app-data',
    //   icon: 'web_asset',
    //   isAdmin: false,
    // },
    {
      label: 'Категории',
      route: 'admin/categories',
      icon: 'category',
      isAdmin: true,
    }
  ];

  addRoute(route: { label: string; route: string; icon: string, isAdmin: boolean }) {
    this.routes.push(route);
  }
}
