
export interface PropertyValuation {
  // Step 1
  purpose: 'Vender' | 'Arrendar' | 'Trespasse';
  propertyType: string;
  location: string;
  doorNumber: string;

  // Step 2
  propertyState: 'Novo' | 'Usado' | 'Renovado' | 'Construção' | 'Planta';
  bedrooms: number;
  bathrooms: number;
  usefulArea: number;
  grossArea: number;
  landArea?: number;
  energyCertificate: string;
  parking: string;
  otherFeatures: string[];

  // Step 3
  name: string;
  email: string;
  phone: string;
  privacyPolicy: boolean;
}
