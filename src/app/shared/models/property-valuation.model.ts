
export interface PropertyValuation {
  // Step 1
  purpose: 'Vender' | 'Arrendar';
  propertyType: string;
  zipCode: string;

  // Step 2
  propertyState: 'Novo' | 'Usado' | 'Renovado' | 'Construção';
  bedrooms: number;
  bathrooms: number;
  area: number;

  // Step 3
  name: string;
  email: string;
  phone: string;
  privacyPolicy: boolean;
}
