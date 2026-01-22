
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

  formatZipCode(event: Event) {
    const input = event.target as HTMLInputElement;
    // Remove tudo que não é número
    let value = input.value.replace(/\D/g, '');

    // Limita a 7 dígitos
    if (value.length > 7) {
      value = value.substring(0, 7);
    }

    // Atualiza o Signal apenas com os números (para salvar no banco)
    this.location.set(value);

    // Formata a exibição no input (ex: 1234-567)
    if (value.length > 4) {
      input.value = `${value.slice(0, 4)}-${value.slice(4)}`;
    } else {
      input.value = value;
    }
  }
}
