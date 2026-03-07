import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable navigation footer for multi-step forms.
 * Renders "Anterior" and "Seguinte" buttons in a responsive layout:
 * stacked vertically on mobile, side-by-side on desktop.
 */
@Component({
  selector: 'app-form-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border-t border-gray-100 pt-6 mt-8">
      <div class="flex flex-col md:flex-row md:justify-between gap-3">

        @if (showPrevious) {
          <button
            type="button"
            (click)="previousClick.emit()"
            class="border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-8 rounded-xl transition-colors duration-300 w-full md:w-auto"
            aria-label="Passo anterior">
            Anterior
          </button>
        }

        <button
          type="submit"
          [disabled]="isLoading"
          (click)="nextClick.emit()"
          class="bg-primary text-white font-bold py-3 px-10 rounded-xl w-full md:w-auto transition-opacity duration-300"
          [class.opacity-60]="isLoading"
          [class.cursor-not-allowed]="isLoading"
          [class.md:ml-auto]="!showPrevious"
          [attr.aria-busy]="isLoading || null"
          [attr.aria-label]="isLoading ? 'A processar…' : nextLabel">
          @if (isLoading) {
            <span class="inline-flex items-center gap-2">
              <svg
                class="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              A processar…
            </span>
          } @else {
            {{ nextLabel }}
          }
        </button>

      </div>
    </div>
  `
})
export class FormNavigationComponent {
  /** Whether to render the "Anterior" back button. Defaults to true. */
  @Input() showPrevious = true;

  /** Label for the primary action button. Defaults to 'Seguinte'. */
  @Input() nextLabel = 'Seguinte';

  /** When true the next button is disabled and shows a loading spinner. */
  @Input() isLoading = false;

  /** Emitted when the "Anterior" button is clicked. */
  @Output() previousClick = new EventEmitter<void>();

  /** Emitted when the next button is clicked (supplement to form submit). */
  @Output() nextClick = new EventEmitter<void>();
}

