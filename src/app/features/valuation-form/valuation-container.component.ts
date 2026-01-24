import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {StepperComponent} from "../../shared/components/stepper/stepper.component";
import {Step1Component} from "./step-1/step-1.component";
import {Step2Component} from "./step-2/step-2.component";
import {Step3Component} from "./step-3/step-3.component";
import {Step4Component} from "./step-4/step-4.component";
import {PropertyValuation} from "../../shared/models/property-valuation.model";

@Component({
    selector: 'app-valuation-container',
    imports: [
        CommonModule,
        StepperComponent,
        Step1Component,
        Step2Component,
        Step3Component,
        Step4Component
    ],
    templateUrl: './valuation-container.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValuationContainerComponent {
    currentStep = signal(1);
    valuationData = signal<Partial<PropertyValuation>>({});

    handleNextStep(data: Partial<PropertyValuation>): void {
        this.valuationData.update(currentData => ({ ...currentData, ...data }));

        if (this.currentStep() < 4) {
            this.currentStep.update(step => step + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // UX: Volta ao topo
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