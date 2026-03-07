import { ChangeDetectionStrategy, Component, signal, inject, input, effect, computed, ElementRef } from '@angular/core';
import { StepperComponent } from '../../shared/components/stepper/stepper.component';
import { PropertyInfoComponent } from './property-info/property-info.component';
import { PropertyDetailsComponent } from './property-details/property-details.component';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { PriceEstimationComponent } from './price-estimation/price-estimation.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { PropertyValuation } from '../../shared/models/property-valuation.model';
import { EstimationService } from '../../core/services/estimation.service';

interface SubmissionState {
    isSubmitting: boolean;
    success: boolean;
    error: string | null;
}

const initialSubmissionState = (): SubmissionState => ({ isSubmitting: false, success: false, error: null });

@Component({
    selector: 'app-valuation-container',
    imports: [
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
    private el = inject(ElementRef);

    scrollToTop(): void {
        const headerOffset = 72;
        const top = this.el.nativeElement.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });
    }

    startAtContactStep = input<boolean>(false);
    currentStep = signal(1);
    showStepper = computed(() => !this.startAtContactStep() || this.currentStep() === 5);

    valuationData = signal<Partial<PropertyValuation>>({});
    estimativeId = signal<string | undefined>(undefined);
    submission = signal<SubmissionState>(initialSubmissionState());

    // Computed accessors used in template
    readonly submissionSuccess = computed(() => this.submission().success);
    readonly submissionError = computed(() => this.submission().error);

    constructor() {
        effect(() => {
            if (this.startAtContactStep()) {
                this.valuationData.set({});
                this.estimativeId.set(undefined);
                this.submission.set(initialSubmissionState());
                this.currentStep.set(4);
            } else {
                this.valuationData.set({});
                this.estimativeId.set(undefined);
                this.submission.set(initialSubmissionState());
                this.currentStep.set(1);
            }
        });
    }

    handleNextStep(data: Partial<PropertyValuation>): void {
        this.valuationData.update(current => ({ ...current, ...data }));
        if (this.currentStep() === 4) {
            this.submitToBackend();
        } else if (this.currentStep() < 5) {
            this.currentStep.update(s => s + 1);
            this.scrollToTop();
        }
    }

    handleEstimationResponse(response: { wantsContact: boolean; estimativeId?: string }): void {
        if (response.estimativeId) {
            this.estimativeId.set(response.estimativeId);
        }
        if (response.wantsContact) {
            this.currentStep.set(4);
        } else {
            // Utilizador recusou contacto — fluxo termina sem submissão
            this.currentStep.set(5);
        }
        this.scrollToTop();
    }

    handlePreviousStep(): void {
        if (this.currentStep() > 1) {
            this.currentStep.update(step => step - 1);
            this.scrollToTop();
        }
    }

    async submitToBackend(): Promise<void> {
        this.submission.set({ isSubmitting: true, success: false, error: null });
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
            this.submission.set({ isSubmitting: false, success: true, error: null });
            this.currentStep.set(5);
        } catch (err) {
            console.error('Submission error:', err);
            this.submission.set({ isSubmitting: false, success: false, error: 'Erro ao enviar pedido. Tente novamente mais tarde.' });
            // Permanece no step 4 para permitir nova tentativa
        }
        this.scrollToTop();
    }

    restart(): void {
        this.valuationData.set({});
        this.estimativeId.set(undefined);
        this.submission.set(initialSubmissionState());
        this.currentStep.set(1);
        this.scrollToTop();
    }
}