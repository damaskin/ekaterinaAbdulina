import { Directive, ElementRef, HostListener, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appSliderScrollBlock]',
  standalone: true
})
export class SliderScrollBlockDirective implements OnDestroy {
  private isDragging = false;

  constructor(private el: ElementRef) {}

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onDragStart(event: Event) {
    this.isDragging = true;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    window.addEventListener('mouseup', this.onDragEnd, true);
    window.addEventListener('touchend', this.onDragEnd, true);
  }

  onDragEnd = () => {
    this.isDragging = false;
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    window.removeEventListener('mouseup', this.onDragEnd, true);
    window.removeEventListener('touchend', this.onDragEnd, true);
  };

  ngOnDestroy(): void {
    if (this.isDragging) {
      this.onDragEnd();
    }
  }
} 