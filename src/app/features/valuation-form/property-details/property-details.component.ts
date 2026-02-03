import {ChangeDetectionStrategy, Component, effect, input, output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PropertyValuation} from "../../../shared/models/property-valuation.model";

@Component({
    selector: 'app-property-details',
    templateUrl: './property-details.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule]
})
export class PropertyDetailsComponent {
    initialData = input<Partial<PropertyValuation>>();
    nextStep = output<Partial<PropertyValuation>>();
    previousStep = output<void>();

    // Opções de estado: value em inglês (backend), label em português (UI)
    stateOptions = [
        { value: 'NEW' as const, label: 'Novo' },
        { value: 'USED' as const, label: 'Usado' },
    ];

    propertyState = signal<'NEW' | 'USED' | 'RENOVATED' | 'UNDER_CONSTRUCTION'>('USED'); // Padrão: Usado
    bedrooms = signal(2); // Padrão: 2 quartos (T2)
    bathrooms = signal(1);
    usefulArea = signal(0);

    submitted = signal(false);

    constructor() {
        effect(() => {
            const data = this.initialData();
            if (data) {
                this.propertyState.set(data.propertyState as any || 'USED');
                this.bedrooms.set(data.bedrooms || 2); // Mantém padrão se não houver dado
                this.bathrooms.set(data.bathrooms || 1);
                this.usefulArea.set(data.area || 0);
            }
        });
    }

    onNext(): void {
        this.submitted.set(true);

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
