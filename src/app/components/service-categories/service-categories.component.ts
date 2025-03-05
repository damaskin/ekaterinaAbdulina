import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ICategory } from '../../interface/category.interface';
import { MatIconModule } from '@angular/material/icon';
import { CategoriesService } from '../../services/categories.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PriceFormatterService } from '../../services/price-formatter.service';

@Component({
  selector: 'app-service-categories',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './service-categories.component.html',
  styleUrls: ['./service-categories.component.scss']
})
export class ServiceCategoriesComponent implements OnInit {
  categories: ICategory[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private categoriesService: CategoriesService,
    public priceFormatterService: PriceFormatterService,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.error = null;
    
    this.categoriesService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.filter(category => category.isActive);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error = 'Ошибка загрузки категорий';
        this.isLoading = false;
      }
    });
  }

  selectCategory(category: ICategory) {
    this.router.navigate(['/order', category.id]);
  }

  navigateToMyOrders() {
    this.router.navigate(['/my-orders']);
  }
} 