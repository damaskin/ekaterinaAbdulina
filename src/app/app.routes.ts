import { Routes } from '@angular/router';
import {MainPageComponent} from "./pages/main-page/main-page.component";
import {WebAppDataPageComponent} from "./pages/web-app-data-page/web-app-data-page.component";
import {AuthComponent} from "./pages/auth-page/auth.component";
import {StyleFormComponent} from "./components/style-form/style-form.component";
import { ClientsPageComponent } from './components/clients-page/clients-page.component';

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
  { path: 'clients', component: ClientsPageComponent },
];
