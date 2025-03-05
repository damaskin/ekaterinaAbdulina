import { Routes } from '@angular/router';
import {MainPageComponent} from "./pages/main-page/main-page.component";
import {WebAppDataPageComponent} from "./pages/web-app-data-page/web-app-data-page.component";
import {AuthComponent} from "./pages/auth-page/auth.component";
import {StyleFormComponent} from "./components/style-form/style-form.component";
import { OrderComponent } from './components/order/order.component';
import { SuccessPaymentComponent } from './pages/success-payment/success-payment.component';
import { UserOrdersComponent } from './pages/user-orders/user-orders.component';
import { AdminOrdersComponent } from './pages/admin/admin-orders/admin-orders.component';
import { ClientsComponent } from './pages/admin/clients/clients.component';
import { adminGuard } from './guards/admin.guard';
import { AdminCategoriesComponent } from './pages/admin/admin-categories/admin-categories.component';
import { CategoryFormComponent } from './pages/admin/admin-categories/category-form/category-form.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'main',
  },
  {
    path: 'auth',
    component: AuthComponent,
  },
  {
    path: 'main',
    component: MainPageComponent,
  },
  {
    path: 'web-app-data',
    component: WebAppDataPageComponent,
  },
  { path: 'form/:id', component: StyleFormComponent },
  { 
    path: 'clients', 
    component: ClientsComponent, 
    canActivate: [adminGuard]
  },
  { path: 'order/:id', component: OrderComponent },
  { path: 'payment-success', component: SuccessPaymentComponent },
  { path: 'my-orders', component: UserOrdersComponent },
  { 
    path: 'admin/orders', 
    component: AdminOrdersComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      { path: 'categories', component: AdminCategoriesComponent },
      { path: 'categories/new', component: CategoryFormComponent },
      { path: 'categories/edit/:id', component: CategoryFormComponent }
    ]
  },
];
