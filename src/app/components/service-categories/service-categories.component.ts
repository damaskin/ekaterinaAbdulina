import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ICategory } from '../../interfaces/icategory';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-service-categories',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './service-categories.component.html',
  styleUrls: ['./service-categories.component.scss']
})
export class ServiceCategoriesComponent {
  categories: ICategory[] = [
    { id: 1, title: 'Онлайн/офлайн консультации', price: 1000 },
    { id: 2, title: 'Консультации + разбор гардероба', price: 1500 },
    { id: 3, title: 'Консультация + шоппинг', price: 2000 },
    { id: 4, title: 'Комплексная работа по стилю', price: 3000 },
    { id: 5, title: 'Подбор образа под мероприятие', price: 1800 },
    { id: 6, title: 'Подготовка к съемке', price: 2200 },
    { id: 7, title: 'Ознакомительный шоппинг', price: 1200 }
  ];

  constructor(private router: Router) {}

  selectCategory(category: ICategory) {
    this.router.navigate(['/order', category.id]);
  }

  navigateToMyOrders() {
    this.router.navigate(['/my-orders']);
  }
} 