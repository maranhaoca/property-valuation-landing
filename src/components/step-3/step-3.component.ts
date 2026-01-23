
import { ChangeDetectionStrategy, Component, output, signal, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyValuation } from '../../models/property-valuation.model';

@Component({
  selector: 'app-step-3',
  templateUrl: './step-3.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class Step3Component {
  initialData = input<Partial<PropertyValuation>>();
  nextStep = output<Partial<PropertyValuation>>();
  previousStep = output<void>();

  name = signal('');
  email = signal('');
  phone = signal('');
  privacyPolicy = signal(false);

  submitted = signal(false);
  errors = signal<{ [key: string]: string }>({});

  constructor() {
    effect(() => {
      const data = this.initialData();
      if (data) {
        if (data.name) this.name.set(data.name);
        if (data.email) this.email.set(data.email);
        if (data.phone) this.phone.set(data.phone);
        if (data.privacyPolicy) this.privacyPolicy.set(data.privacyPolicy);
      }
    }, { allowSignalWrites: true });
  }

  isEmailValid(email: string): boolean {
    // A simple email validation regex
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  validate(): boolean {
    const newErrors: { [key: string]: string } = {};
    if (!this.name()) newErrors['name'] = 'O nome é obrigatório.';
    if (!this.email()) {
      newErrors['email'] = 'O e-mail é obrigatório.';
    } else if (!this.isEmailValid(this.email())) {
      newErrors['email'] = 'Por favor, insira um e-mail válido.';
    }
    if (!this.phone()) newErrors['phone'] = 'O telefone é obrigatório.';
    if (!this.privacyPolicy()) newErrors['privacyPolicy'] = 'É necessário aceitar a política de privacidade.';
    
    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  onNext(): void {
    this.submitted.set(true);
    if (this.validate()) {
      this.nextStep.emit({
        name: this.name(),
        email: this.email(),
        phone: this.phone(),
        privacyPolicy: this.privacyPolicy()
      });
    }
  }
}
