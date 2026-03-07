import { ChangeDetectionStrategy, Component, signal, inject, input, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepperComponent } from '../../shared/components/stepper/stepper.component';
import { PropertyInfoComponent } from './property-info/property-info.component';
import { PropertyDetailsComponent } from './property-details/property-details.component';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { PriceEstimationComponent } from './price-estimation/price-estimation.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { PropertyValuation } from '../../shared/models/property-valuation.model';
import { ProfessionalValuationRequest } from '../../shared/models/professional-valuation-request.interface';
import { EstimationService } from '../../core/services/estimation.service';

@Component({
    selector: 'app-valuation-container',
    imports: [
        CommonModule,
        StepperComponent,
        PropertyInfoComponent,
        PropertyDetailsComponent,
        ContactFormComponent,
        PriceEstimationComponent,
        ConfirmationComponent
    ],
    templateUrl: './valuation-container.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValuationContainerComponent {
    private valuationService = inject(EstimationService);

    /** When true the form skips directly to the contact step (step 4). */
    startAtContactStep = input<boolean>(false);

    currentStep = signal(1);

    /** Hides the stepper when the user skips directly to the contact step. */
    showStepper = computed(() => !this.startAtContactStep() || this.currentStep() === 5);

    constructor() {
        effect(() => {
            if (this.startAtContactStep()) {
                this.valuationData.set({});
                this.wantsContact.set(true);
                this.estimativeId.set(undefined);
                this.submissionSuccess.set(false);
                this.submissionError.set(null);
                this.currentStep.set(4);
            } else {
                this.restart();
            }
        });
    }
    valuationData = signal<Partial<PropertyValuation>>({});
    wantsContact = signal(false);
    estimativeId = signal<string | undefined>(undefined);

    isSubmitting = signal(false);
    submissionSuccess = signal(false);
    submissionError = signal<string | null>(null);

    /** Signals for the professional valuation CTA on the confirmation screen. */
    isProfessionalSubmitting = signal(false);
    professionalSuccess = signal(false);
    professionalError = signal<string | null>(null);

    /**
     * Avança o fluxo com os dados do step actual.
     * Fluxo fixo: 1 (info) → 2 (detalhes) → 3 (estimativa) → 4 (contacto) → 5 (confirmação)
     */
    handleNextStep(data: Partial<PropertyValuation>): void {
        this.valuationData.update(current => ({ ...current, ...data }));

        const current = this.currentStep();

        if (current === 4) {
            this.submitToBackend();
        } else if (current < 5) {
            this.currentStep.update(s => s + 1);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Trata a resposta do step de estimativa.
     * Se aceita contacto → step 4; caso contrário → step 5 (confirmação sem submissão).
     */
    handleEstimationResponse(response: { wantsContact: boolean; estimativeId?: string }): void {
        this.wantsContact.set(response.wantsContact);

        if (response.estimativeId) {
            this.estimativeId.set(response.estimativeId);
        }

        if (response.wantsContact) {
            this.currentStep.set(4);
        } else {
            this.submissionSuccess.set(true);
            this.currentStep.set(5);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    handlePreviousStep(): void {
        if (this.currentStep() > 1) {
            this.currentStep.update(step => step - 1);
        }
    }

    async submitToBackend(): Promise<void> {
        this.isSubmitting.set(true);
        this.submissionError.set(null);
        this.submissionSuccess.set(false);

        try {
            const payload = this.valuationData() as PropertyValuation;
            const estimId = this.estimativeId();

            if (estimId) {
                await this.valuationService.submitValuationFromEstimate(estimId, {
                    name: payload.name,
                    email: payload.email,
                    phone: payload.phone,
                    allowContact: !!payload.privacyPolicy
                });
            } else {
                await this.valuationService.submitValuation(payload);
            }

            this.submissionSuccess.set(true);
            this.currentStep.set(5);
        } catch (err) {
            console.error('Submission error:', err);
            this.submissionError.set('Erro ao enviar pedido. Tente novamente mais tarde.');
            this.currentStep.set(5);
        } finally {
            this.isSubmitting.set(false);
        }
    }

    restart(): void {
        this.valuationData.set({});
        this.wantsContact.set(false);
        this.estimativeId.set(undefined);
        this.isSubmitting.set(false);
        this.submissionSuccess.set(false);
        this.submissionError.set(null);
        this.isProfessionalSubmitting.set(false);
        this.professionalSuccess.set(false);
        this.professionalError.set(null);
        this.currentStep.set(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Handles the requestProfessionalValuation output from ConfirmationComponent.
     * Builds a ProfessionalValuationRequest from already-collected valuationData
     * and submits it to the backend without requiring the user to re-enter contact data.
     */
    async handleRequestProfessionalValuation(): Promise<void> {
        const data = this.valuationData() as PropertyValuation;

        const request: ProfessionalValuationRequest = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            allowContact: !!data.privacyPolicy,
        };

        this.isProfessionalSubmitting.set(true);
        this.professionalSuccess.set(false);
        this.professionalError.set(null);

        try {
            await this.valuationService.submitProfessionalValuationRequest(request);
            this.professionalSuccess.set(true);
        } catch (err) {
            console.error('ValuationContainerComponent: professional valuation error', err);
            this.professionalError.set('Erro ao submeter pedido de avaliação profissional. Tente novamente.');
        } finally {
            this.isProfessionalSubmitting.set(false);
        }
    }
}