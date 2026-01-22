
export interface PropertyValuation {
  // Step 1
  purpose: 'Vender' | 'Arrendar';
  propertyType: string;
  location: string;

  // Step 2
  propertyState: 'Novo' | 'Usado' | 'Renovado' | 'Construção';
  bedrooms: number;
  bathrooms: number;
  usefulArea: number;

  // Step 3
  name: string;
  email: string;
  phone: string;
  privacyPolicy: boolean;
}
