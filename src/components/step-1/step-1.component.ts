
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

  purpose = signal<'Vender' | 'Arrendar' | 'Trespasse'>('Vender');
  propertyType = signal('');
  location = signal('');
  doorNumber = signal('');
  
  submitted = signal(false);
  errors = signal<{ [key: string]: string }>({});

  constructor() {
    effect(() => {
      const data = this.initialData();
      if (data) {
        this.purpose.set(data.purpose || 'Vender');
        this.propertyType.set(data.propertyType || '');
        this.location.set(data.location || '');
        this.doorNumber.set(data.doorNumber || '');
      }
    });
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
        location: this.location(),
        doorNumber: this.doorNumber()
      });
    }
  }
}
