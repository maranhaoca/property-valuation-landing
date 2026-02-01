import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {StepperComponent} from "../../shared/components/stepper/stepper.component";
import {PropertyInfoComponent} from "./property-info/property-info.component";
import {PropertyDetailsComponent} from "./property-details/property-details.component";
import {ContactFormComponent} from "./contact-form/contact-form.component";
import {PriceEstimationComponent} from "./price-estimation/price-estimation.component";
import {ConfirmationComponent} from "./confirmation/confirmation.component";
import {PropertyValuation} from "../../shared/models/property-valuation.model";
import {EstimationService} from "../../core/services/estimation.service";
import {AppConfigService} from "../../core/services/app-config.service";

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
    private appConfigService = inject(AppConfigService);

    // Feature flag dinâmica: carregada do backend
    estimationFlowEnabled = computed(() =>
        this.appConfigService.config()?.settings.estimationFlowEnabled ?? false
    );

    currentStep = signal(1);
    valuationData = signal<Partial<PropertyValuation>>({});
    wantsContact = signal(false);
    estimativeId = signal<string | undefined>(undefined); // ID da estimativa para fluxo from-estimate

    // Estados de submissão
    isSubmitting = signal(false);
    submissionSuccess = signal(false);
    submissionError = signal<string | null>(null);

    handleNextStep(data: Partial<PropertyValuation>): void {
        this.valuationData.update(currentData => ({ ...currentData, ...data }));

        const current = this.currentStep();

        // Lógica de navegação baseada no fluxo e step atual
        if (this.estimationFlowEnabled()) {
            // Novo fluxo: 1 → 2 → 3 (estimation) → 4 (contact) → 5 (confirmation)
            if (current === 4) {
                // Após contact-form, submete e vai para confirmação
                this.submitToBackend();
            } else if (current < 5) {
                this.currentStep.update(s => s + 1);
            }
        } else {
            // Fluxo direto: 1 → 2 → 3 (contact) → 4 (confirmation)
            if (current === 3) {
                // Após contact-form, submete e vai para confirmação
                this.submitToBackend();
            } else if (current < 4) {
                this.currentStep.update(s => s + 1);
            }
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    handleEstimationResponse(response: { wantsContact: boolean; estimativeId?: string }): void {
        this.wantsContact.set(response.wantsContact);

        // Guardar estimativeId se fornecido
        if (response.estimativeId) {
            this.estimativeId.set(response.estimativeId);
        }

        if (response.wantsContact) {
            // Aceita contato: vai para contact-form (step 4)
            this.currentStep.set(4);
        } else {
            // Recusa contato: pula para confirmação sem submeter
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

            // Decidir qual fluxo usar baseado na existência do estimativeId
            if (estimId) {
                // Fluxo from-estimate: já temos estimativa, só enviar contato
                await this.valuationService.submitValuationFromEstimate(estimId, {
                    name: payload.name,
                    email: payload.email,
                    phone: payload.phone,
                    allowContact: !!payload.privacyPolicy
                });
            } else {
                // Fluxo direto: enviar tudo (property + contact)
                await this.valuationService.submitValuation(payload);
            }

            this.submissionSuccess.set(true);

            // Avança para a tela de confirmação
            if (this.estimationFlowEnabled()) {
                this.currentStep.set(5);
            } else {
                this.currentStep.set(4);
            }
        } catch (err) {
            console.error('Submission error:', err);
            this.submissionError.set('Erro ao enviar pedido. Tente novamente mais tarde.');

            // Também avança para confirmação para mostrar o erro
            if (this.estimationFlowEnabled()) {
                this.currentStep.set(5);
            } else {
                this.currentStep.set(4);
            }
        } finally {
            this.isSubmitting.set(false);
        }
    }

    restart(): void {
        this.valuationData.set({});
        this.wantsContact.set(false);
        this.estimativeId.set(undefined); // Limpar ID da estimativa
        this.isSubmitting.set(false);
        this.submissionSuccess.set(false);
        this.submissionError.set(null);
        this.currentStep.set(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    handleRequestNewEstimation(): void {
        this.currentStep.set(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}