import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstimationService } from '../../../core/services/estimation.service';
import { ProfessionalValuationRequest } from '../../../shared/models/professional-valuation-request.interface';

/**
 * Standalone component for the direct contact form (left panel of the home page).
 * Manages its own four-state panel lifecycle: form → submitting → success | error.
 * All logic (validation, phone formatting, submission) lives here;
 * the ds agent owns the template/UI layer.
 */
@Component({
  selector: 'app-direct-contact-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './direct-contact-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectContactFormComponent {
  private estimationService = inject(EstimationService);

  // ---------------------------------------------------------------------------
  // Panel state
  // ---------------------------------------------------------------------------
  /** Controls which panel view is active. */
  panelState = signal<'form' | 'submitting' | 'success' | 'error'>('form');

  /** Set when an API error occurs so the template can show the message. */
  errorMessage = signal<string | null>(null);

  // ---------------------------------------------------------------------------
  // Field signals (raw values stored here; formatted display handled in template)
  // ---------------------------------------------------------------------------
  /** User's full name */
  name = signal('');

  /** User's email address */
  email = signal('');

  /**
   * Raw phone digits — always 0-9 characters, max 9 digits.
   * The formatted display value (NNN NNN NNN) is derived in the template / handler.
   */
  phone = signal('');

  /** Whether the user has accepted the privacy policy */
  allowContact = signal(false);

  /** Tracks whether the form was submitted at least once (for validation feedback) */
  submitted = signal(false);

  /** Field-level validation errors */
  errors = signal<Record<string, string>>({});

  // ---------------------------------------------------------------------------
  // Validation helpers
  // ---------------------------------------------------------------------------
  private isEmailValid(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!this.name().trim()) {
      newErrors['name'] = 'O nome é obrigatório.';
    }

    if (!this.email()) {
      newErrors['email'] = 'O e-mail é obrigatório.';
    } else if (!this.isEmailValid(this.email())) {
      newErrors['email'] = 'Por favor, insira um e-mail válido.';
    }

    if (!this.phone()) {
      newErrors['phone'] = 'O telefone é obrigatório.';
    } else if (this.phone().length !== 9) {
      newErrors['phone'] = 'O telefone deve ter exatamente 9 dígitos.';
    }

    if (!this.allowContact()) {
      newErrors['allowContact'] = 'É necessário aceitar a política de privacidade.';
    }

    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ---------------------------------------------------------------------------
  // Phone formatting
  // ---------------------------------------------------------------------------
  /**
   * Handles raw input events on the phone field.
   * Strips non-digits, caps at 9, updates the raw signal, and formats the displayed value.
   */
  formatPhone(event: Event): void {
    const input = event.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, '');

    if (digits.length > 9) {
      digits = digits.substring(0, 9);
    }

    this.phone.set(digits);

    // Format display as NNN NNN NNN
    input.value = digits.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3').trim();
  }

  // ---------------------------------------------------------------------------
  // Form actions
  // ---------------------------------------------------------------------------
  /** Submits the form if validation passes. */
  async submitForm(): Promise<void> {
    this.submitted.set(true);

    if (!this.validate()) {
      return;
    }

    this.panelState.set('submitting');
    this.errorMessage.set(null);

    const request: ProfessionalValuationRequest = {
      name: this.name().trim(),
      email: this.email(),
      phone: this.phone(),
      allowContact: this.allowContact(),
    };

    try {
      await this.estimationService.submitProfessionalValuationRequest(request);
      this.panelState.set('success');
    } catch (err) {
      console.error('DirectContactFormComponent: submission error', err);
      this.errorMessage.set('Ocorreu um erro ao enviar o pedido. Tente novamente mais tarde.');
      this.panelState.set('error');
    }
  }

  /** Resets all signals to their initial state so the user can start over. */
  resetForm(): void {
    this.name.set('');
    this.email.set('');
    this.phone.set('');
    this.allowContact.set(false);
    this.submitted.set(false);
    this.errors.set({});
    this.errorMessage.set(null);
    this.panelState.set('form');
  }
}

