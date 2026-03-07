import { ChangeDetectionStrategy, Component, output, signal, effect, input, inject, DestroyRef } from '@angular/core';
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
  private destroyRef = inject(DestroyRef);

  /** AbortController para cancelar chamadas anteriores (evita race conditions). */
  private abortController: AbortController | null = null;
  private destroyed = false;

  isLoading = signal(true);
  error = signal('');
  minPrice = signal(0);
  maxPrice = signal(0);
  estimativeId = signal<string | undefined>(undefined); // Guardar ID da estimativa

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.abortController?.abort();
    });

    effect(() => {
      const data = this.initialData();
      if (data) {
        // Cancela chamada anterior antes de iniciar nova
        this.abortController?.abort();
        this.abortController = new AbortController();
        this.fetchEstimation(data, this.abortController.signal);
      }
    });
  }

  async fetchEstimation(data: Partial<PropertyValuation>, signal?: AbortSignal): Promise<void> {
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

      // Se foi abortado ou componente destruído, ignorar resposta
      if (signal?.aborted || this.destroyed) return;

      await this.minimalTimeLoading(startLoadTime, signal);

      if (signal?.aborted || this.destroyed) return;

      this.minPrice.set(response.min);
      this.maxPrice.set(response.max);

      // Guardar estimativeId para usar no fluxo from-estimate
      if (response.estimativeId) {
        this.estimativeId.set(response.estimativeId);
      }

    } catch (err: any) {
      if (signal?.aborted || this.destroyed) return;
      console.error('Error fetching estimation:', err);
      this.error.set('Não foi possível obter a estimativa. Por favor, tente novamente.');
    } finally {
      if (!signal?.aborted && !this.destroyed) {
        this.isLoading.set(false);
      }
    }
  }

  private async minimalTimeLoading(startTime: number, signal?: AbortSignal): Promise<void> {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 1500 - elapsed);
    if (remaining <= 0) return;

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, remaining);
      signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
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
