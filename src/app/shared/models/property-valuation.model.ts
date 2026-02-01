
export interface PropertyValuation {
  // Step 1
  purpose: 'SELL' | 'RENT';
  propertyType: string;
  zipCode: string;

  // Step 2
  propertyState: 'NEW' | 'USED' | 'RENOVATED' | 'UNDER_CONSTRUCTION';
  bedrooms: number;
  bathrooms: number;
  area: number;

  // Step 3
  name: string;
  email: string;
  phone: string;
  privacyPolicy: boolean;
}
