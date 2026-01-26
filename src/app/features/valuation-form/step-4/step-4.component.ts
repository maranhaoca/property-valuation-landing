import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ZipCodeFormatPipe} from "../../../shared/pipes/zip-code-format.pipe";
import {PhonePipe} from "../../../shared/pipes/phone-format.pipe";
import {PropertyValuation} from "../../../shared/models/property-valuation.model";
import {ValuationService} from "../../../core/services/valuation.service";

@Component({
  selector: 'app-step-4',
  templateUrl: './step-4.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ZipCodeFormatPipe, PhonePipe],
})
export class Step4Component {
  valuationData = input.required<Partial<PropertyValuation>>();
  previousStep = output<void>();
  restart = output<void>();

  private valuationService = inject(ValuationService);
  
  isSubmitted = signal(false);
  isSubmitting = signal(false);
  error = signal('');
  successMessage = signal('');

  async submitRequest(): Promise<void> {
    this.isSubmitting.set(true);
    this.error.set('');
    this.successMessage.set('');

    try {
      const payload = this.valuationData() as PropertyValuation;

      await this.valuationService.submitValuation(payload);

      this.successMessage.set('Pedido enviado com sucesso. Obrigado!');
      this.isSubmitted.set(true);
    } catch (err) {
      console.error('Submission error:', err);
      this.error.set('Erro ao enviar pedido. Tente novamente mais tarde.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
