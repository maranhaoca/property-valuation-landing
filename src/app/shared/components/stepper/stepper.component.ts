
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  id: number;
  label: string;
}

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class StepperComponent {
  currentStep = input.required<number>();

  steps: Step[] = [
    { id: 1, label: 'Informações Gerais' },
    { id: 2, label: 'Detalhes do Imóvel' },
    { id: 3, label: 'Dados de Contato' },
    { id: 4, label: 'Confirmação' }
  ];
}
