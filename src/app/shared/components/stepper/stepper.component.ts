
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

  readonly steps: Step[] = [
    { id: 1, label: 'Informações' },
    { id: 2, label: 'Detalhes' },
    { id: 3, label: 'Estimativa' }
  ];
}

