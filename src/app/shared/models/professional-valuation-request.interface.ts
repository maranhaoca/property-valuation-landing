/**
 * Represents a professional valuation request containing only contact data.
 * Used when a user requests a professional (in-person) valuation without property data.
 */
export interface ProfessionalValuationRequest {
  /** Full name of the requester */
  name: string;
  /** Email address of the requester */
  email: string;
  /** Phone number — 9 raw digits, no spaces */
  phone: string;
  /** Whether the user has accepted the privacy policy and allows contact */
  allowContact: boolean;
}

