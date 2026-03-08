/**
 * Unit & Component tests for ContactFormComponent
 *
 * Strategy (one spec per component):
 * - Test this component in isolation using NO_ERRORS_SCHEMA so that
 *   `app-form-navigation` is stubbed and does not require its own providers.
 * - Signals are set directly via `component.signal.set()` and validated via
 *   `component.signal()` — no Reactive Forms involved (component uses signals).
 * - Use provideZonelessChangeDetection() to match the app's zoneless setup.
 * - Router is provided with provideRouter([]) so that `routerLink` compiles.
 * - Follow AAA (Arrange – Act – Assert) pattern throughout.
 *
 * Coverage targets:
 *   ✅ Rendering — all fields present in the DOM
 *   ✅ Privacy-policy link opens in a new tab (target="_blank")
 *   ✅ Validation — required fields, email format, phone length
 *   ✅ Phone formatting — strips non-digits, caps at 9 digits
 *   ✅ initialData input — pre-populates signals via effect()
 *   ✅ Event emission — nextStep, previousStep
 *   ✅ submitted flag — error messages only shown after first submission
 */

import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { ContactFormComponent } from './contact-form.component';
import { PropertyValuation } from '../../../shared/models/property-valuation.model';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a minimal valid PropertyValuation (only contact fields matter here). */
function makeContactData(
  overrides: Partial<PropertyValuation> = {}
): Partial<PropertyValuation> {
  return {
    name: 'Ana Costa',
    email: 'ana@example.com',
    phone: '912345678',
    privacyPolicy: true,
    ...overrides,
  };
}

/** Dispatches a native input event on an element and sets its value. */
function setInputValue(el: HTMLInputElement, value: string): void {
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

/** Queries a required element and throws if not found. */
function getEl<T extends Element>(fixture: ComponentFixture<ContactFormComponent>, selector: string): T {
  const el = fixture.nativeElement.querySelector(selector) as T | null;
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

describe('ContactFormComponent', () => {
  let fixture: ComponentFixture<ContactFormComponent>;
  let component: ContactFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactFormComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),            // required for routerLink directive
      ],
      schemas: [NO_ERRORS_SCHEMA],   // stubs app-form-navigation
    }).compileComponents();

    fixture = TestBed.createComponent(ContactFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  // -------------------------------------------------------------------------
  // A. Rendering
  // -------------------------------------------------------------------------

  describe('A. Rendering — fields present in the DOM', () => {
    it('should render the section heading "Dados de Contato"', () => {
      const heading = fixture.nativeElement.querySelector('h2') as HTMLElement;
      expect(heading.textContent).toContain('Dados de Contato');
    });

    it('should render the name input field', () => {
      expect(getEl(fixture, 'input#name')).toBeTruthy();
    });

    it('should render the email input field', () => {
      expect(getEl(fixture, 'input#email')).toBeTruthy();
    });

    it('should render the phone input field', () => {
      expect(getEl(fixture, 'input#phone')).toBeTruthy();
    });

    it('should render the privacy policy checkbox', () => {
      const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox).toBeTruthy();
    });

    it('should render the privacy policy link', () => {
      const link = fixture.nativeElement.querySelector('a[routerLink]') as HTMLAnchorElement | null;
      expect(link).toBeTruthy();
      expect(link!.textContent?.trim()).toBe('Política de Privacidade');
    });

    it('should render the privacy policy link with target="_blank" (opens in new tab)', () => {
      // Arrange — the link must never navigate within the same tab for legal/UX reasons
      const link = fixture.nativeElement.querySelector('a[routerLink]') as HTMLAnchorElement;
      // Assert
      expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should not show error messages before the form is submitted', () => {
      const errors = fixture.nativeElement.querySelectorAll('p.text-red-600') as NodeList;
      expect(errors.length).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // B. initialData input — pre-population via effect()
  // -------------------------------------------------------------------------

  describe('B. initialData input — pre-populates signals', () => {
    it('should pre-populate name, email, phone and privacyPolicy from initialData', async () => {
      // Arrange
      const data = makeContactData();

      // Act
      fixture.componentRef.setInput('initialData', data);
      fixture.detectChanges();
      await fixture.whenStable();

      // Assert
      expect(component.name()).toBe(data.name!);
      expect(component.email()).toBe(data.email!);
      expect(component.phone()).toBe(data.phone!);
      expect(component.privacyPolicy()).toBeTrue();
    });

    it('should reflect the pre-populated name value in the DOM input', async () => {
      // Arrange & Act
      fixture.componentRef.setInput('initialData', makeContactData({ name: 'Bruno Ferreira' }));
      fixture.detectChanges();
      await fixture.whenStable();

      // Assert
      const nameInput = getEl<HTMLInputElement>(fixture, 'input#name');
      expect(nameInput.value).toBe('Bruno Ferreira');
    });

    it('should reflect the pre-populated checkbox state in the DOM', async () => {
      // Arrange & Act
      fixture.componentRef.setInput('initialData', makeContactData({ privacyPolicy: true }));
      fixture.detectChanges();
      await fixture.whenStable();

      // Assert
      const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox.checked).toBeTrue();
    });

    it('should not overwrite signals when initialData is undefined', () => {
      // Arrange — signals have default empty values
      expect(component.name()).toBe('');
      expect(component.email()).toBe('');
      expect(component.phone()).toBe('');
      expect(component.privacyPolicy()).toBeFalse();
    });
  });

  // -------------------------------------------------------------------------
  // C. Validation — errors shown only after submit
  // -------------------------------------------------------------------------

  describe('C. Validation', () => {
    describe('C1. submitted flag — errors hidden before first attempt', () => {
      it('validate() should return false when all fields are empty', () => {
        // Arrange — component starts with all empty signals
        // Act
        const result = component.validate();
        // Assert
        expect(result).toBeFalse();
      });

      it('should not render error messages until onNext() is called', () => {
        // Act — do NOT call onNext()
        fixture.detectChanges();
        // Assert
        const errors = fixture.nativeElement.querySelectorAll('p.text-red-600');
        expect(errors.length).toBe(0);
      });
    });

    describe('C2. Required field errors — appear after first submission', () => {
      beforeEach(async () => {
        // Trigger submission with all empty fields
        component.onNext();
        fixture.detectChanges();
        await fixture.whenStable();
      });

      it('should set submitted to true', () => {
        expect(component.submitted()).toBeTrue();
      });

      it('should report "name" error when name is empty', () => {
        expect(component.errors()['name']).toBe('O nome é obrigatório.');
      });

      it('should report "email" error when email is empty', () => {
        expect(component.errors()['email']).toBe('O e-mail é obrigatório.');
      });

      it('should report "phone" error when phone is empty', () => {
        expect(component.errors()['phone']).toBe('O telefone é obrigatório.');
      });

      it('should report "privacyPolicy" error when checkbox is unchecked', () => {
        expect(component.errors()['privacyPolicy']).toBe('É necessário aceitar a política de privacidade.');
      });

      it('should render all four error messages in the DOM', () => {
        const errors = fixture.nativeElement.querySelectorAll('p.text-red-600');
        expect(errors.length).toBe(4);
      });
    });

    describe('C3. Email format validation', () => {
      it('should report invalid email error for malformed address', () => {
        // Arrange
        component.name.set('João');
        component.email.set('not-an-email');
        component.phone.set('912345678');
        component.privacyPolicy.set(true);

        // Act
        component.validate();

        // Assert
        expect(component.errors()['email']).toBe('Por favor, insira um e-mail válido.');
      });

      it('isEmailValid() should return true for a valid email', () => {
        expect(component.isEmailValid('user@domain.com')).toBeTrue();
      });

      it('isEmailValid() should return false for missing @', () => {
        expect(component.isEmailValid('userdomain.com')).toBeFalse();
      });

      it('isEmailValid() should return false for missing TLD', () => {
        expect(component.isEmailValid('user@domain')).toBeFalse();
      });

      it('isEmailValid() should return false for empty string', () => {
        expect(component.isEmailValid('')).toBeFalse();
      });
    });

    describe('C4. Phone length validation', () => {
      it('should report phone error when phone has fewer than 9 digits', () => {
        // Arrange
        component.name.set('Maria');
        component.email.set('maria@ex.com');
        component.phone.set('91234'); // only 5 digits
        component.privacyPolicy.set(true);

        // Act
        component.validate();

        // Assert
        expect(component.errors()['phone']).toBe('O telefone deve ter exatamente 9 dígitos.');
      });

      it('should not report phone error when phone has exactly 9 digits', () => {
        // Arrange
        component.name.set('Maria');
        component.email.set('maria@ex.com');
        component.phone.set('912345678');
        component.privacyPolicy.set(true);

        // Act
        component.validate();

        // Assert
        expect(component.errors()['phone']).toBeUndefined();
      });
    });

    describe('C5. Privacy policy validation', () => {
      it('should report privacy error when checkbox is unchecked', () => {
        // Arrange
        component.name.set('Rita');
        component.email.set('rita@ex.com');
        component.phone.set('931234567');
        component.privacyPolicy.set(false);

        // Act
        component.validate();

        // Assert
        expect(component.errors()['privacyPolicy']).toBeTruthy();
      });

      it('should not report privacy error when checkbox is checked', () => {
        // Arrange
        component.name.set('Rita');
        component.email.set('rita@ex.com');
        component.phone.set('931234567');
        component.privacyPolicy.set(true);

        // Act
        component.validate();

        // Assert
        expect(component.errors()['privacyPolicy']).toBeUndefined();
      });
    });

    describe('C6. validate() returns true when all fields are valid', () => {
      it('should return true with a complete valid payload', () => {
        // Arrange
        component.name.set('Carlos Silva');
        component.email.set('carlos@example.com');
        component.phone.set('961234567');
        component.privacyPolicy.set(true);

        // Act & Assert
        expect(component.validate()).toBeTrue();
        expect(component.errors()).toEqual({});
      });
    });
  });

  // -------------------------------------------------------------------------
  // D. Phone formatting — formatPhone()
  // -------------------------------------------------------------------------

  describe('D. Phone formatting', () => {
    it('should strip non-digit characters from phone input', () => {
      // Arrange
      const phoneInput = getEl<HTMLInputElement>(fixture, 'input#phone');
      const mockEvent = { target: phoneInput } as unknown as Event;

      // Act
      phoneInput.value = 'abc912def345ghi678';
      component.formatPhone(mockEvent);

      // Assert — internal signal holds only digits
      expect(component.phone()).toBe('912345678');
    });

    it('should cap phone at 9 digits if more are entered', () => {
      // Arrange
      const phoneInput = getEl<HTMLInputElement>(fixture, 'input#phone');
      const mockEvent = { target: phoneInput } as unknown as Event;

      // Act
      phoneInput.value = '9123456789999'; // 13 digits
      component.formatPhone(mockEvent);

      // Assert
      expect(component.phone()).toBe('912345678');
      expect(component.phone().length).toBe(9);
    });

    it('should format the displayed value as "XXX XXX XXX"', () => {
      // Arrange
      const phoneInput = getEl<HTMLInputElement>(fixture, 'input#phone');
      const mockEvent = { target: phoneInput } as unknown as Event;

      // Act
      phoneInput.value = '912345678';
      component.formatPhone(mockEvent);

      // Assert — DOM input shows formatted value
      expect(phoneInput.value).toBe('912 345 678');
    });

    it('should handle partial phone (fewer than 9 digits) without crashing', () => {
      // Arrange
      const phoneInput = getEl<HTMLInputElement>(fixture, 'input#phone');
      const mockEvent = { target: phoneInput } as unknown as Event;

      // Act
      phoneInput.value = '912';
      component.formatPhone(mockEvent);

      // Assert
      expect(component.phone()).toBe('912');
    });
  });

  // -------------------------------------------------------------------------
  // E. Signal two-way binding via DOM events
  // -------------------------------------------------------------------------

  describe('E. Signal two-way binding via DOM events', () => {
    it('should update name signal when user types in name input', () => {
      // Arrange
      const nameInput = getEl<HTMLInputElement>(fixture, 'input#name');

      // Act
      setInputValue(nameInput, 'Beatriz Lopes');

      // Assert
      expect(component.name()).toBe('Beatriz Lopes');
    });

    it('should update email signal when user types in email input', () => {
      // Arrange
      const emailInput = getEl<HTMLInputElement>(fixture, 'input#email');

      // Act
      setInputValue(emailInput, 'beatriz@example.com');

      // Assert
      expect(component.email()).toBe('beatriz@example.com');
    });

    it('should update privacyPolicy signal when checkbox is toggled', () => {
      // Arrange
      const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(component.privacyPolicy()).toBeFalse();

      // Act
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));

      // Assert
      expect(component.privacyPolicy()).toBeTrue();
    });
  });

  // -------------------------------------------------------------------------
  // F. Event emission — nextStep and previousStep outputs
  // -------------------------------------------------------------------------

  describe('F. Event emission', () => {
    describe('F1. nextStep output', () => {
      it('should NOT emit nextStep when form is invalid', () => {
        // Arrange
        const nextStepSpy = jasmine.createSpy('nextStep');
        component.nextStep.subscribe(nextStepSpy);

        // Act — all fields are empty → invalid
        component.onNext();

        // Assert
        expect(nextStepSpy).not.toHaveBeenCalled();
      });

      it('should emit nextStep with contact data when form is valid', () => {
        // Arrange
        component.name.set('Luís Mendes');
        component.email.set('luis@example.com');
        component.phone.set('961234567');
        component.privacyPolicy.set(true);

        const nextStepSpy = jasmine.createSpy('nextStep');
        component.nextStep.subscribe(nextStepSpy);

        // Act
        component.onNext();

        // Assert
        expect(nextStepSpy).toHaveBeenCalledOnceWith({
          name: 'Luís Mendes',
          email: 'luis@example.com',
          phone: '961234567',
          privacyPolicy: true,
        });
      });

      it('should emit nextStep with the correct partial PropertyValuation shape', () => {
        // Arrange
        component.name.set('Sofia Ramos');
        component.email.set('sofia@example.pt');
        component.phone.set('912000001');
        component.privacyPolicy.set(true);

        let emittedData: Partial<PropertyValuation> | undefined;
        component.nextStep.subscribe((data) => (emittedData = data));

        // Act
        component.onNext();

        // Assert — each property is present and typed correctly
        expect(emittedData).toBeDefined();
        expect(typeof emittedData!.name).toBe('string');
        expect(typeof emittedData!.email).toBe('string');
        expect(typeof emittedData!.phone).toBe('string');
        expect(typeof emittedData!.privacyPolicy).toBe('boolean');
      });
    });

    describe('F2. previousStep output', () => {
      it('should emit previousStep when previousStep.emit() is called directly', () => {
        // Arrange
        const prevSpy = jasmine.createSpy('previousStep');
        component.previousStep.subscribe(prevSpy);

        // Act
        component.previousStep.emit();

        // Assert
        expect(prevSpy).toHaveBeenCalledOnceWith(undefined);
      });
    });
  });

  // -------------------------------------------------------------------------
  // G. Error message DOM rendering
  // -------------------------------------------------------------------------

  describe('G. Error message DOM rendering', () => {
    beforeEach(async () => {
      // Submit with all fields empty to trigger all errors
      component.onNext();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should show the name error message in the DOM', () => {
      const errors = fixture.nativeElement.querySelectorAll('p.text-red-600') as NodeListOf<HTMLParagraphElement>;
      const texts = Array.from(errors).map((p) => p.textContent?.trim());
      expect(texts).toContain('O nome é obrigatório.');
    });

    it('should show the email error message in the DOM', () => {
      const errors = fixture.nativeElement.querySelectorAll('p.text-red-600') as NodeListOf<HTMLParagraphElement>;
      const texts = Array.from(errors).map((p) => p.textContent?.trim());
      expect(texts).toContain('O e-mail é obrigatório.');
    });

    it('should show the phone error message in the DOM', () => {
      const errors = fixture.nativeElement.querySelectorAll('p.text-red-600') as NodeListOf<HTMLParagraphElement>;
      const texts = Array.from(errors).map((p) => p.textContent?.trim());
      expect(texts).toContain('O telefone é obrigatório.');
    });

    it('should show the privacy policy error message in the DOM', () => {
      const errors = fixture.nativeElement.querySelectorAll('p.text-red-600') as NodeListOf<HTMLParagraphElement>;
      const texts = Array.from(errors).map((p) => p.textContent?.trim());
      expect(texts).toContain('É necessário aceitar a política de privacidade.');
    });

    it('should clear errors after a valid submission', async () => {
      // Arrange — fill valid data
      component.name.set('Pedro Neves');
      component.email.set('pedro@example.com');
      component.phone.set('921234567');
      component.privacyPolicy.set(true);

      // Act
      component.onNext();
      fixture.detectChanges();
      await fixture.whenStable();

      // Assert
      expect(component.errors()).toEqual({});
      const domErrors = fixture.nativeElement.querySelectorAll('p.text-red-600');
      expect(domErrors.length).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // H. Privacy policy link — accessibility & security
  // -------------------------------------------------------------------------

  describe('H. Privacy policy link — accessibility & security', () => {
    let link: HTMLAnchorElement;

    beforeEach(() => {
      link = fixture.nativeElement.querySelector('a[routerLink]') as HTMLAnchorElement;
    });

    it('should have target="_blank" so the link opens in a new tab', () => {
      expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should display readable text for the link', () => {
      expect(link.textContent?.trim()).toBeTruthy();
    });

    it('should point to the privacy route via routerLink', () => {
      // The routerLink="/privacidade" attribute is present in the template
      expect(link.getAttribute('ng-reflect-router-link') ?? link.getAttribute('routerlink'))
        .toContain('privacidade');
    });
  });
});


