import { Component, signal, computed, ViewChild, inject, afterNextRender, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValuationContainerComponent } from '../valuation-form/valuation-container.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, ValuationContainerComponent],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent {
  @ViewChild(ValuationContainerComponent, { read: ValuationContainerComponent })
  valuationContainer!: ValuationContainerComponent;

  private injector = inject(Injector);

  readonly mode = signal<'simulation' | 'contact'>('simulation');
  readonly isContactMode = computed(() => this.mode() === 'contact');

  toggleMode(): void {
    this.mode.update(m => m === 'simulation' ? 'contact' : 'simulation');
    afterNextRender(() => {
      this.valuationContainer?.scrollToTop();
    }, { injector: this.injector });
  }
}
