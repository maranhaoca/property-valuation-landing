import { Component, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValuationContainerComponent } from '../valuation-form/valuation-container.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, ValuationContainerComponent],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent {
  @ViewChild('formContainer') formContainer!: ElementRef<HTMLElement>;

  readonly mode = signal<'simulation' | 'contact'>('simulation');
  readonly isContactMode = computed(() => this.mode() === 'contact');

  toggleMode(): void {
    this.mode.update(m => m === 'simulation' ? 'contact' : 'simulation');
    setTimeout(() => {
      this.formContainer?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }
}
