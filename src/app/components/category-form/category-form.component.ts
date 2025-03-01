import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICategory } from '../../interfaces/icategory';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
})
export class CategoryFormComponent implements OnInit {
  category: ICategory | undefined;

  // Аналогично можем получить данные из сервиса, здесь для примера используется локальный массив
  categories: ICategory[] = [
      { id: 1, title: 'Онлайн/офлайн консультации', price: 1000 },
      { id: 2, title: 'Консультации + разбор гардероба', price: 1500 },
      { id: 3, title: 'Консультация + шоппинг', price: 2000 },
      { id: 4, title: 'Комплексная работа по стилю', price: 3000 },
      { id: 5, title: 'Подбор образа под мероприятие', price: 1800 },
      { id: 6, title: 'Подготовка к съемке', price: 2200 },
      { id: 7, title: 'Ознакомительный шоппинг', price: 1200 }
  ];

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const categoryId = Number(this.route.snapshot.paramMap.get('id'));
    this.category = this.categories.find(cat => cat.id === categoryId);
  }

  submitForm() {
    // Обработайте отправку формы в соответствии со спецификой услуги
    alert('Форма для ' + this.category?.title + ' отправлена!');
  }
}