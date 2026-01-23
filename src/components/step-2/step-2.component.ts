import {ChangeDetectionStrategy, Component, effect, input, output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PropertyValuation} from '../../models/property-valuation.model';

@Component({
    selector: 'app-step-2',
    templateUrl: './step-2.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule]
})
export class Step2Component {
    initialData = input<Partial<PropertyValuation>>();
    nextStep = output<Partial<PropertyValuation>>();
    previousStep = output<void>();

    // Signals simplificados conforme a nova UI
    propertyState = signal<'Novo' | 'Usado' | 'Renovado' | 'Construção'>('Usado');
    bedrooms = signal(0);
    bathrooms = signal(1); // Começa com 1 conforme sugerido
    usefulArea = signal(0);

    // Controle de validação
    submitted = signal(false);

    constructor() {
        effect(() => {
            const data = this.initialData();
            if (data) {
                // Mapeamos apenas o que restou na UI simplificada
                this.propertyState.set(data.propertyState as any || 'Usado');
                this.bedrooms.set(data.bedrooms || 0);
                this.bathrooms.set(data.bathrooms || 1);
                this.usefulArea.set(data.area || 0);
            }
        }, {allowSignalWrites: true});
    }

    onNext(): void {
        this.submitted.set(true);

        // Validação estrita: Área deve ser preenchida
        if (this.usefulArea() > 0) {
            this.nextStep.emit({
                propertyState: this.propertyState(),
                bedrooms: this.bedrooms(),
                bathrooms: this.bathrooms(),
                area: this.usefulArea(),
            });
        }
    }
}
