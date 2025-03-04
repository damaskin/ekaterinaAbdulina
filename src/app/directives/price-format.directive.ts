import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import IMask from 'imask';
import { MASKS } from '../masks/mask-config';

@Directive({
  selector: '[appPriceFormat]',
  standalone: true
})
export class PriceFormatDirective implements OnInit {
  @Input() price: number | string = 0;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    const formattedPrice = this.formatPrice(this.price);
    this.renderer.setProperty(this.el.nativeElement, 'textContent', formattedPrice + ' руб');
  }

  private formatPrice(price: number | string): void {
    // Используем IMask для форматирования цены
    const masked = IMask.createMask({
      mask: Number,
      thousandsSeparator: ' ',
      radix: ',',
      mapToRadix: ['.'],
      scale: 0,
      signed: false,
      normalizeZeros: true,
      padFractionalZeros: false,
    });

    return masked.resolve(price.toString());
  }
}
