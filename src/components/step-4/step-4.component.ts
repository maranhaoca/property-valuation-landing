import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyValuation } from '../../models/property-valuation.model';
import { ValuationService } from '../../services/valuation.service';

@Component({
  selector: 'app-step-4',
  templateUrl: './step-4.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class Step4Component {
  valuationData = input.required<Partial<PropertyValuation>>();
  restart = output<void>();

  private geminiService = inject(ValuationService);
  
  isSubmitted = signal(false);
  isLoadingSummary = signal(false);
  isSubmitting = signal(false);
  aiSummary = signal('');
  error = signal('');
  successMessage = signal('');

  async generateSummary() {
    this.isLoadingSummary.set(true);
    this.error.set('');
    this.aiSummary.set('');
    try {
      const summary = await this.geminiService.generatePropertySummary(this.valuationData() as PropertyValuation);
      this.aiSummary.set(summary);
    } catch (err) {
      this.error.set('Não foi possível gerar o sumário. Tente novamente.');
      console.error(err);
    } finally {
      this.isLoadingSummary.set(false);
    }
  }
  
  async submitRequest(): Promise<void> {
    this.isSubmitting.set(true);
    this.error.set('');
    this.successMessage.set('');

    try {
      const tenant = (typeof window !== 'undefined' && (window as any).TENANT_SLUG) || 'test-agent';
      const payload = this.valuationData() as PropertyValuation;

      await this.geminiService.submitValuation(tenant, payload);

      this.successMessage.set('Pedido enviado com sucesso. Obrigado!');
      this.isSubmitted.set(true);
    } catch (err) {
      console.error('Submission error:', err);
      this.error.set('Erro ao enviar pedido. Tente novamente mais tarde.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  restartFlow(): void {
    this.restart.emit();
  }
}
