
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepperComponent } from './components/stepper/stepper.component';
import { Step1Component } from './components/step-1/step-1.component';
import { Step2Component } from './components/step-2/step-2.component';
import { Step3Component } from './components/step-3/step-3.component';
import { Step4Component } from './components/step-4/step-4.component';
import { PropertyValuation } from './models/property-valuation.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    StepperComponent,
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component
  ]
})
export class AppComponent {
  currentStep = signal(1);
  valuationData = signal<Partial<PropertyValuation>>({});

  handleNextStep(data: Partial<PropertyValuation>): void {
    this.valuationData.update(currentData => ({ ...currentData, ...data }));
    if (this.currentStep() < 4) {
      this.currentStep.update(step => step + 1);
    }
  }

  handlePreviousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
    }
  }

  restart(): void {
    this.valuationData.set({});
    this.currentStep.set(1);
  }
}
