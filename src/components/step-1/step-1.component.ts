
import { ChangeDetectionStrategy, Component, output, signal, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyValuation } from '../../models/property-valuation.model';

@Component({
  selector: 'app-step-1',
  templateUrl: './step-1.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class Step1Component {
  initialData = input<Partial<PropertyValuation>>();
  nextStep = output<Partial<PropertyValuation>>();

  purpose = signal<'Vender' | 'Arrendar'>('Vender');
  propertyType = signal('Apartamento');
  location = signal('');
  submitted = signal(false);
  errors = signal<{ [key: string]: string }>({});

  constructor() {
    effect(() => {
      const data = this.initialData();
      if (data) {
        if (data.purpose) this.purpose.set(data.purpose);
        if (data.propertyType) this.propertyType.set(data.propertyType);
        if (data.zipCode) this.location.set(data.zipCode);
      }
    }, { allowSignalWrites: true });
  }

  validate(): boolean {
    const newErrors: { [key: string]: string } = {};
    if (!this.propertyType()) {
      newErrors['propertyType'] = 'Tipo de imóvel é obrigatório';
    }
    if (!this.location()) {
      newErrors['location'] = 'Localização é obrigatório';
    }
    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  onNext(): void {
    this.submitted.set(true);
    if (this.validate()) {
      this.nextStep.emit({
        purpose: this.purpose(),
        propertyType: this.propertyType(),
        zipCode: this.location(),
      });
    }
  }

  getFormattedZip(value: string): string {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    return digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4, 7)}` : digits;
  }

  formatZipCode(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 7) value = value.substring(0, 7);

    this.location.set(value);
    input.value = this.getFormattedZip(value);
  }
}
