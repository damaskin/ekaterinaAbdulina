import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class ResponsiveService {
  private readonly small = '(max-width: 600px)';
  private readonly medium = '(min-width: 600.01px) and (max-width: 1000px)';
  private readonly large = '(min-width: 1000.01px)';

  private readonly screenWidth = toSignal(
    inject(BreakpointObserver).observe([this.small, this.medium, this.large])
  );

  smallWidth = computed(() => this.screenWidth()?.breakpoints[this.small]);
  mediumWidth = computed(() => this.screenWidth()?.breakpoints[this.medium]);
  largeWidth = computed(() => this.screenWidth()?.breakpoints[this.large]);
}
