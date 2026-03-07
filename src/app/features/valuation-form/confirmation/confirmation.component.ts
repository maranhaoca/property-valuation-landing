import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfessionalValuationRequest } from '../../../shared/models/professional-valuation-request.interface';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class ConfirmationComponent {
  success = input<boolean>(false);
  error = input<string | null>(null);
  restart = output<void>();

  /** Contact data from the completed simulation flow; null when not available. */
  contactData = input<ProfessionalValuationRequest | null>(null);

  /** Emitted when the user clicks the "Request Professional Valuation" CTA. */
  requestProfessionalValuation = output<void>();
}
