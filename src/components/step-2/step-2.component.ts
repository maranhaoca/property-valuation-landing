
import { ChangeDetectionStrategy, Component, output, signal, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyValuation } from '../../models/property-valuation.model';

@Component({
  selector: 'app-step-2',
  templateUrl: './step-2.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class Step2Component {
  initialData = input<Partial<PropertyValuation>>();
  nextStep = output<Partial<PropertyValuation>>();
  previousStep = output<void>();

  propertyState = signal<'Novo' | 'Usado' | 'Renovado' | 'Construção' | 'Planta'>('Usado');
  bedrooms = signal(0);
  bathrooms = signal(0);
  usefulArea = signal(0);
  grossArea = signal(0);
  landArea = signal<number | undefined>(undefined);
  energyCertificate = signal('');
  parking = signal('');

  constructor() {
    effect(() => {
      const data = this.initialData();
      if (data) {
        this.propertyState.set(data.propertyState || 'Usado');
        this.bedrooms.set(data.bedrooms || 0);
        this.bathrooms.set(data.bathrooms || 0);
        this.usefulArea.set(data.usefulArea || 0);
        this.grossArea.set(data.grossArea || 0);
        this.landArea.set(data.landArea);
        this.energyCertificate.set(data.energyCertificate || '');
        this.parking.set(data.parking || '');
      }
    });
  }
  
  onNext(): void {
    this.nextStep.emit({
      propertyState: this.propertyState(),
      bedrooms: this.bedrooms(),
      bathrooms: this.bathrooms(),
      usefulArea: this.usefulArea(),
      grossArea: this.grossArea(),
      landArea: this.landArea(),
      energyCertificate: this.energyCertificate(),
      parking: this.parking(),
      otherFeatures: [] // Placeholder for now
    });
  }
}
