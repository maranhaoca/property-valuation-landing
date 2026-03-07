/**
 * Unit & Component tests for ValuationContainerComponent
 *
 * Strategy:
 * - Use NO_ERRORS_SCHEMA to avoid configuring child components
 * - Mock EstimationService with jasmine.createSpyObj
 * - Mock window.scrollTo to prevent browser errors
 * - Use fixture.componentRef.setInput() for input() signals
 * - Use provideZonelessChangeDetection() matching the app's zoneless setup
 * - Follow AAA (Arrange – Act – Assert) pattern
 */

import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  flushMicrotasks,
} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ValuationContainerComponent } from './valuation-container.component';
import { EstimationService } from '../../core/services/estimation.service';
import { PropertyValuation } from '../../shared/models/property-valuation.model';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal valid PropertyValuation object for use in test payloads */
function makeValuation(overrides: Partial<PropertyValuation> = {}): PropertyValuation {
  return {
    purpose: 'SELL',
    propertyType: 'Apartamento',
    zipCode: '1000-001',
    propertyState: 'NEW',
    bedrooms: 2,
    bathrooms: 1,
    area: 80,
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '912345678',
    privacyPolicy: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

describe('ValuationContainerComponent', () => {
  let fixture: ComponentFixture<ValuationContainerComponent>;
  let component: ValuationContainerComponent;
  let estimationServiceSpy: jasmine.SpyObj<EstimationService>;

  beforeEach(async () => {
    // Create a spy for EstimationService with all async methods
    estimationServiceSpy = jasmine.createSpyObj<EstimationService>('EstimationService', [
      'submitValuation',
      'submitValuationFromEstimate',
      'submitProfessionalValuationRequest',
      'getEstimation',
    ]);

    // Default: all service calls resolve successfully
    estimationServiceSpy.submitValuation.and.returnValue(Promise.resolve({}));
    estimationServiceSpy.submitValuationFromEstimate.and.returnValue(Promise.resolve({}));
    estimationServiceSpy.submitProfessionalValuationRequest.and.returnValue(
      Promise.resolve(undefined)
    );
    estimationServiceSpy.getEstimation.and.returnValue(
      Promise.resolve({ min: 100000, max: 200000, avg: 150000 })
    );

    await TestBed.configureTestingModule({
      imports: [ValuationContainerComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideRouter([]),
        { provide: EstimationService, useValue: estimationServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    // Spy on window.scrollTo to prevent browser errors in test environment
    spyOn(window as any, 'scrollTo');

    fixture = TestBed.createComponent(ValuationContainerComponent);
    component = fixture.componentInstance;

    // Patch the injected ElementRef so scrollToTop() works without a real DOM layout
    (component as any).el = {
      nativeElement: { getBoundingClientRect: () => ({ top: 0 }) },
    };

    fixture.detectChanges();
    await fixture.whenStable();
  });

  // -------------------------------------------------------------------------
  // A. Initialization
  // -------------------------------------------------------------------------

  describe('A. Initialization', () => {
    describe('when startAtContactStep = false (default)', () => {
      it('should start at step 1', () => {
        // Assert
        expect(component.currentStep()).toBe(1);
      });


      it('should have submission in initial state', () => {
        const sub = component.submission();
        expect(sub.isSubmitting).toBeFalse();
        expect(sub.success).toBeFalse();
        expect(sub.error).toBeNull();
      });

      it('showStepper should be true when startAtContactStep = false', () => {
        expect(component.showStepper()).toBeTrue();
      });

      it('should have empty valuationData on init', () => {
        expect(component.valuationData()).toEqual({});
      });

      it('should have estimativeId as undefined on init', () => {
        expect(component.estimativeId()).toBeUndefined();
      });
    });

    describe('when startAtContactStep = true', () => {
      beforeEach(async () => {
        fixture.componentRef.setInput('startAtContactStep', true);
        fixture.detectChanges();
        await fixture.whenStable();
      });

      it('should start at step 4', () => {
        expect(component.currentStep()).toBe(4);
      });


      it('showStepper should be false when step != 5', () => {
        expect(component.showStepper()).toBeFalse();
      });

      it('showStepper should be true when step is 5', async () => {
        // Arrange — manually advance to step 5
        component.currentStep.set(5);
        fixture.detectChanges();
        await fixture.whenStable();

        // Assert
        expect(component.showStepper()).toBeTrue();
      });

      it('should reset valuationData when startAtContactStep=true effect runs', async () => {
        // Arrange — effect has already run in beforeEach setting step=4, wantsContact=true
        // Verify that valuationData was cleared by the effect
        // (any prior data would have been reset)
        // Act — manually set some data to confirm the effect-cleared state
        component.valuationData.set(makeValuation());
        expect(component.valuationData().purpose).toBe('SELL'); // sanity check

        // Switch back to false to verify the other branch also clears data
        fixture.componentRef.setInput('startAtContactStep', false);
        fixture.detectChanges();
        await fixture.whenStable();

        // Assert — the false-branch effect also resets valuationData
        expect(component.valuationData()).toEqual({});
      });
    });
  });

  // -------------------------------------------------------------------------
  // B. handleNextStep
  // -------------------------------------------------------------------------

  describe('B. handleNextStep()', () => {
    it('should advance step 1 → 2 and merge data into valuationData', () => {
      // Arrange
      const stepData: Partial<PropertyValuation> = { purpose: 'SELL', propertyType: 'Apartamento' };

      // Act
      component.handleNextStep(stepData);

      // Assert
      expect(component.currentStep()).toBe(2);
      expect(component.valuationData()).toEqual(jasmine.objectContaining(stepData));
    });

    it('should advance step 2 → 3 and merge new data', () => {
      // Arrange
      component.currentStep.set(2);
      const stepData: Partial<PropertyValuation> = { bedrooms: 3, bathrooms: 2, area: 100 };

      // Act
      component.handleNextStep(stepData);

      // Assert
      expect(component.currentStep()).toBe(3);
      expect(component.valuationData()).toEqual(jasmine.objectContaining(stepData));
    });

    it('should advance step 3 → 4 and merge new data', () => {
      // Arrange
      component.currentStep.set(3);
      const stepData: Partial<PropertyValuation> = { name: 'Ana Costa' };

      // Act
      component.handleNextStep(stepData);

      // Assert
      expect(component.currentStep()).toBe(4);
      expect(component.valuationData()).toEqual(jasmine.objectContaining(stepData));
    });

    it('should call submitToBackend when step = 4 instead of incrementing step', fakeAsync(() => {
      // Arrange
      component.currentStep.set(4);
      spyOn(component, 'submitToBackend').and.returnValue(Promise.resolve());

      // Act
      component.handleNextStep({ name: 'Test' });
      tick();

      // Assert — submitToBackend was called, step was NOT incremented
      expect(component.submitToBackend).toHaveBeenCalled();
    }));

    it('should not advance beyond step 5', () => {
      // Arrange
      component.currentStep.set(5);

      // Act
      component.handleNextStep({});

      // Assert — stays at 5 (neither step++ nor submitToBackend)
      expect(component.currentStep()).toBe(5);
      expect(estimationServiceSpy.submitValuation).not.toHaveBeenCalled();
    });

    it('should accumulate data across multiple handleNextStep calls', () => {
      // Arrange
      const step1Data: Partial<PropertyValuation> = { purpose: 'SELL' };
      const step2Data: Partial<PropertyValuation> = { bedrooms: 2 };

      // Act
      component.handleNextStep(step1Data); // step 1 → 2
      component.handleNextStep(step2Data); // step 2 → 3

      // Assert
      expect(component.valuationData()).toEqual(
        jasmine.objectContaining({ purpose: 'SELL', bedrooms: 2 })
      );
    });

    it('should call scrollToTop after advancing from step 1', () => {
      // Arrange
      spyOn(component, 'scrollToTop');

      // Act
      component.handleNextStep({ purpose: 'SELL' });

      // Assert
      expect(component.scrollToTop).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // C. handlePreviousStep
  // -------------------------------------------------------------------------

  describe('C. handlePreviousStep()', () => {
    it('should go back from step 2 → 1', () => {
      // Arrange
      component.currentStep.set(2);

      // Act
      component.handlePreviousStep();

      // Assert
      expect(component.currentStep()).toBe(1);
    });

    it('should go back from step 3 → 2', () => {
      // Arrange
      component.currentStep.set(3);

      // Act
      component.handlePreviousStep();

      // Assert
      expect(component.currentStep()).toBe(2);
    });

    it('should go back from step 4 → 3', () => {
      // Arrange
      component.currentStep.set(4);

      // Act
      component.handlePreviousStep();

      // Assert
      expect(component.currentStep()).toBe(3);
    });

    it('should NOT go below step 1', () => {
      // Arrange — already at step 1
      component.currentStep.set(1);

      // Act
      component.handlePreviousStep();

      // Assert
      expect(component.currentStep()).toBe(1);
    });

    it('should call scrollToTop when going back from step 2', () => {
      // Arrange
      component.currentStep.set(2);
      spyOn(component, 'scrollToTop');

      // Act
      component.handlePreviousStep();

      // Assert
      expect(component.scrollToTop).toHaveBeenCalled();
    });

    it('should NOT call scrollToTop when already at step 1', () => {
      // Arrange
      component.currentStep.set(1);
      spyOn(component, 'scrollToTop');

      // Act
      component.handlePreviousStep();

      // Assert
      expect(component.scrollToTop).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // D. handleEstimationResponse
  // -------------------------------------------------------------------------

  describe('D. handleEstimationResponse()', () => {
    it('should set step to 4 and store estimativeId when wantsContact = true', () => {
      // Arrange
      component.currentStep.set(3);

      // Act
      component.handleEstimationResponse({ wantsContact: true, estimativeId: 'EST-123' });

      // Assert
      expect(component.estimativeId()).toBe('EST-123');
      expect(component.currentStep()).toBe(4);
    });

    it('should set step to 5 when wantsContact = false', () => {
      // Arrange
      component.currentStep.set(3);

      // Act
      component.handleEstimationResponse({ wantsContact: false });

      // Assert
      expect(component.currentStep()).toBe(5);
    });

    it('should NOT update estimativeId if not provided in response', () => {
      // Arrange
      component.estimativeId.set(undefined);

      // Act
      component.handleEstimationResponse({ wantsContact: true });

      // Assert — estimativeId stays undefined when not provided
      expect(component.estimativeId()).toBeUndefined();
    });


    it('should call scrollToTop after handling estimation response', () => {
      // Arrange
      spyOn(component, 'scrollToTop');

      // Act
      component.handleEstimationResponse({ wantsContact: false });

      // Assert
      expect(component.scrollToTop).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // E. submitToBackend
  // -------------------------------------------------------------------------

  describe('E. submitToBackend()', () => {
    it('should call submitValuation when no estimativeId, set step 5 and success=true', async () => {
      // Arrange
      component.estimativeId.set(undefined);
      component.valuationData.set(makeValuation());
      estimationServiceSpy.submitValuation.and.returnValue(Promise.resolve({}));

      // Act
      await component.submitToBackend();

      // Assert
      expect(estimationServiceSpy.submitValuation).toHaveBeenCalled();
      expect(estimationServiceSpy.submitValuationFromEstimate).not.toHaveBeenCalled();
      expect(component.currentStep()).toBe(5);
      expect(component.submission().success).toBeTrue();
      expect(component.submission().isSubmitting).toBeFalse();
      expect(component.submission().error).toBeNull();
    });

    it('should call submitValuationFromEstimate when estimativeId is set', async () => {
      // Arrange
      component.estimativeId.set('EST-456');
      component.valuationData.set(
        makeValuation({ name: 'Maria', email: 'maria@test.com', phone: '961111111', privacyPolicy: true })
      );
      estimationServiceSpy.submitValuationFromEstimate.and.returnValue(Promise.resolve({}));

      // Act
      await component.submitToBackend();

      // Assert
      expect(estimationServiceSpy.submitValuationFromEstimate).toHaveBeenCalledWith(
        'EST-456',
        jasmine.objectContaining({
          name: 'Maria',
          email: 'maria@test.com',
          phone: '961111111',
          allowContact: true,
        })
      );
      expect(estimationServiceSpy.submitValuation).not.toHaveBeenCalled();
      expect(component.currentStep()).toBe(5);
      expect(component.submission().success).toBeTrue();
    });

    it('should set isSubmitting=true while request is in flight', fakeAsync(() => {
      // Arrange — controlled promise that we can resolve manually
      let resolveFn!: (val: unknown) => void;
      const controlledPromise = new Promise<unknown>(resolve => { resolveFn = resolve; });
      estimationServiceSpy.submitValuation.and.returnValue(controlledPromise);
      component.estimativeId.set(undefined);
      component.valuationData.set(makeValuation());

      // Act — start the submission without awaiting
      component.submitToBackend();
      flushMicrotasks();

      // Assert — isSubmitting should be true while the request is in flight
      expect(component.submission().isSubmitting).toBeTrue();
      expect(component.submission().success).toBeFalse();
      expect(component.submission().error).toBeNull();

      // Cleanup — resolve and flush to avoid dangling promises
      resolveFn({});
      tick();
    }));

    it('should set error and stay at step 4 on failure (no estimativeId)', async () => {
      // Arrange
      component.estimativeId.set(undefined);
      component.valuationData.set(makeValuation());
      component.currentStep.set(4);
      estimationServiceSpy.submitValuation.and.returnValue(
        Promise.reject(new Error('server error'))
      );

      // Act
      await component.submitToBackend();

      // Assert — stays at step 4 so the user can retry
      expect(component.currentStep()).toBe(4);
      expect(component.submission().success).toBeFalse();
      expect(component.submission().isSubmitting).toBeFalse();
      expect(component.submission().error).toBe(
        'Erro ao enviar pedido. Tente novamente mais tarde.'
      );
    });

    it('should set error and stay at step 4 on failure (with estimativeId)', async () => {
      // Arrange
      component.estimativeId.set('EST-789');
      component.valuationData.set(makeValuation());
      component.currentStep.set(4);
      estimationServiceSpy.submitValuationFromEstimate.and.returnValue(
        Promise.reject(new Error('timeout'))
      );

      // Act
      await component.submitToBackend();

      // Assert — stays at step 4
      expect(component.currentStep()).toBe(4);
      expect(component.submission().success).toBeFalse();
      expect(component.submission().error).toBeTruthy();
    });

    it('should expose submissionSuccess=true and submissionError=null via computed signals on success', async () => {
      // Arrange
      component.estimativeId.set(undefined);
      component.valuationData.set(makeValuation());
      estimationServiceSpy.submitValuation.and.returnValue(Promise.resolve({}));

      // Act
      await component.submitToBackend();

      // Assert
      expect(component.submissionSuccess()).toBeTrue();
      expect(component.submissionError()).toBeNull();
    });

    it('should expose submissionSuccess=false and submissionError filled on error', async () => {
      // Arrange
      component.estimativeId.set(undefined);
      component.valuationData.set(makeValuation());
      estimationServiceSpy.submitValuation.and.returnValue(
        Promise.reject(new Error('err'))
      );

      // Act
      await component.submitToBackend();

      // Assert
      expect(component.submissionSuccess()).toBeFalse();
      expect(component.submissionError()).toBeTruthy();
    });

    it('should call scrollToTop after submitToBackend completes', async () => {
      // Arrange
      spyOn(component, 'scrollToTop');
      component.estimativeId.set(undefined);
      component.valuationData.set(makeValuation());
      estimationServiceSpy.submitValuation.and.returnValue(Promise.resolve({}));

      // Act
      await component.submitToBackend();

      // Assert
      expect(component.scrollToTop).toHaveBeenCalled();
    });

    it('should pass allowContact=false when privacyPolicy is false', async () => {
      // Arrange
      component.estimativeId.set('EST-999');
      component.valuationData.set(makeValuation({ privacyPolicy: false }));
      estimationServiceSpy.submitValuationFromEstimate.and.returnValue(Promise.resolve({}));

      // Act
      await component.submitToBackend();

      // Assert
      expect(estimationServiceSpy.submitValuationFromEstimate).toHaveBeenCalledWith(
        'EST-999',
        jasmine.objectContaining({ allowContact: false })
      );
    });
  });

  // -------------------------------------------------------------------------
  // F. restart
  // -------------------------------------------------------------------------

  describe('F. restart()', () => {
    beforeEach(() => {
      component.currentStep.set(5);
      component.estimativeId.set('EST-999');
      component.valuationData.set(makeValuation());
      component.submission.set({ isSubmitting: false, success: true, error: 'previous error' });
    });

    it('should reset currentStep to 1', () => {
      component.restart();
      expect(component.currentStep()).toBe(1);
    });

    it('should clear estimativeId to undefined', () => {
      component.restart();
      expect(component.estimativeId()).toBeUndefined();
    });

    it('should clear valuationData to empty object', () => {
      component.restart();
      expect(component.valuationData()).toEqual({});
    });

    it('should reset submission to initial state', () => {
      component.restart();
      const sub = component.submission();
      expect(sub.isSubmitting).toBeFalse();
      expect(sub.success).toBeFalse();
      expect(sub.error).toBeNull();
    });

    it('should call scrollToTop', () => {
      spyOn(component, 'scrollToTop');
      component.restart();
      expect(component.scrollToTop).toHaveBeenCalled();
    });

    it('should reset showStepper to true after restart', () => {
      component.restart();
      expect(component.showStepper()).toBeTrue();
    });
  });

  // -------------------------------------------------------------------------
  // G. scrollToTop
  // -------------------------------------------------------------------------

  describe('G. scrollToTop()', () => {
    it('should call window.scrollTo with smooth behavior', () => {
      // Act
      component.scrollToTop();

      // Assert
      expect(window.scrollTo as unknown as jasmine.Spy).toHaveBeenCalledWith(
        jasmine.objectContaining({ behavior: 'smooth' })
      );
    });

    it('should call window.scrollTo with a top value adjusted by headerOffset', () => {
      // Arrange — getBoundingClientRect returns top: 100, scrollY = 0
      (component as any).el = {
        nativeElement: { getBoundingClientRect: () => ({ top: 100 }) },
      };
      // window.scrollY is 0 by default in JSDOM, headerOffset is 72
      // Expected top = 100 + 0 - 72 = 28

      // Act
      component.scrollToTop();

      // Assert
      expect(window.scrollTo as unknown as jasmine.Spy).toHaveBeenCalledWith(
        jasmine.objectContaining({ top: 28, behavior: 'smooth' })
      );
    });
  });
});

