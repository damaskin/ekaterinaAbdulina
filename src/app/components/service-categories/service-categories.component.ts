import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface ICategory {
  id: number;
  title: string;
}

@Component({
  selector: 'app-service-categories',
  templateUrl: './service-categories.component.html',
  styleUrls: ['./service-categories.component.scss'],
  standalone: true
})
export class ServiceCategoriesComponent {
  categories: ICategory[] = [
    { id: 1, title: 'Онлайн/офлайн консультации' },
    { id: 2, title: 'Консультации + разбор гардероба' },
    { id: 3, title: 'Консультация + шоппинг' },
    { id: 4, title: 'Комплексная работа по стилю' },
    { id: 5, title: 'Подбор образа под мероприятие' },
    { id: 6, title: 'Подготовка к съемке' },
    { id: 7, title: 'Ознакомительный шоппинг' }
  ];

  constructor(private router: Router) {}

  selectCategory(category: ICategory): void {
    this.router.navigate(['/form', category.id]);
  }
} 