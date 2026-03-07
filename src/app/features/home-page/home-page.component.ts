import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValuationContainerComponent } from '../valuation-form/valuation-container.component';

/**
 * Landing page principal.
 * O painel esquerdo apresenta dois modos:
 *  - 'simulation': CTA para iniciar simulação (comportamento padrão do formulário)
 *  - 'contact':    CTA ativo — formulário salta direto para o passo de contacto
 */
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, ValuationContainerComponent],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent {
  /** Modo activo do painel direito. */
  readonly mode = signal<'simulation' | 'contact'>('simulation');

  /** Verdadeiro quando o utilizador quer avaliação profissional directa. */
  readonly isContactMode = computed(() => this.mode() === 'contact');

  /** Alterna entre os dois modos. */
  toggleMode(): void {
    this.mode.update(m => m === 'simulation' ? 'contact' : 'simulation');
  }
}
