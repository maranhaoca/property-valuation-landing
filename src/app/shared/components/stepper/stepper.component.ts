
import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
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
  estimationFlowEnabled = input<boolean>(false);

  // Steps dinâmicos baseados na feature flag
  steps = computed<Step[]>(() => {
    const baseSteps: Step[] = [
      { id: 1, label: 'Informações' },
      { id: 2, label: 'Detalhes' }
    ];

    if (this.estimationFlowEnabled()) {
      // Fluxo com estimativa: 5 steps
      return [
        ...baseSteps,
        { id: 3, label: 'Estimativa' },
        { id: 4, label: 'Contacto' },
        { id: 5, label: 'Confirmação' }
      ];
    } else {
      // Fluxo direto: 4 steps
      return [
        ...baseSteps,
        { id: 3, label: 'Contacto' },
        { id: 4, label: 'Confirmação' }
      ];
    }
  });
}
