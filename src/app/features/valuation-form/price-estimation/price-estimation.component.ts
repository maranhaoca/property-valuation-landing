import { ChangeDetectionStrategy, Component, output, signal, effect, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyValuation } from "../../../shared/models/property-valuation.model";
import { EstimationService } from "../../../core/services/estimation.service";

@Component({
  selector: 'app-price-estimation',
  templateUrl: './price-estimation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class PriceEstimationComponent {
  initialData = input<Partial<PropertyValuation>>();
  nextStep = output<{ wantsContact: boolean; estimativeId?: string }>();
  requestNewEstimation = output<void>();
  previousStep = output<void>();

  private valuationService = inject(EstimationService);

  isLoading = signal(true);
  error = signal('');
  minPrice = signal(0);
  maxPrice = signal(0);
  estimativeId = signal<string | undefined>(undefined); // Guardar ID da estimativa

  constructor() {
    effect(() => {
      const data = this.initialData();
      if (data) {
        this.fetchEstimation(data);
      }
    });
  }

  async fetchEstimation(data: Partial<PropertyValuation>): Promise<void> {
    this.isLoading.set(true);
    this.error.set('');

    const startLoadTime = Date.now(); // Marca início para calcular tempo mínimo

    try {
      const response = await this.valuationService.getEstimation({
        propertyType: data.propertyType || '',
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        area: data.area || 0,
        zipCode: data.zipCode || '',
        propertyState: data.propertyState || 'USED',
        purpose: data.purpose || 'SELL'
      });

      await this.minimalTimeLoading(startLoadTime);

      this.minPrice.set(response.min);
      this.maxPrice.set(response.max);

      // Guardar estimativeId para usar no fluxo from-estimate
      if (response.estimativeId) {
        this.estimativeId.set(response.estimativeId);
      }

    } catch (err: any) {
      console.error('Error fetching estimation:', err);
      this.error.set('Não foi possível obter a estimativa. Por favor, tente novamente.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async minimalTimeLoading(startTime: number) {
    const elapsed = Date.now() - startTime;
    const minLoadingTime = 1500;
    const remainingTime = Math.max(0, minLoadingTime - elapsed);

    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
  }

  onAcceptContact(): void {
    this.nextStep.emit({
      wantsContact: true,
      estimativeId: this.estimativeId()
    });
  }

  onRequestNewEstimation(): void {
    this.requestNewEstimation.emit();
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
