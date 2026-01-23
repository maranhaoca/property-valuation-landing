import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PropertyValuation } from '../models/property-valuation.model';
import {environment} from "../environments/environment";

@Injectable({ providedIn: 'root' })
export class ValuationService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  async submitValuation(tenantSlug: string, data: PropertyValuation): Promise<any> {
    const url = `${this.baseUrl}/${encodeURIComponent(tenantSlug)}/valuation`;

    const body = {
      propertyType: this.mapPropertyType(data.propertyType),
      typology: this.mapTypology(data.bedrooms),
      area: data.area,
      zipCode: data.zipCode,
      lead: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        allowContact: !!data.privacyPolicy,
      },
    };

    try {
      return await firstValueFrom(this.http.post(url, body));
    } catch (error) {
      console.error('Error submitting valuation to backend:', error);
      throw error;
    }
  }

  private mapPropertyType(input: string): 'APARTMENT' | 'HOUSE' {
    const v = (input || '').toLowerCase();
    if (v.includes('apart') || v.includes('apartamento') || v.includes('apartment')) return 'APARTMENT';
    return 'HOUSE';
  }

  private mapTypology(bedrooms: number): string {
    if (bedrooms <= 0) return 'T0';
    if (bedrooms === 1) return 'T1';
    if (bedrooms === 2) return 'T2';
    if (bedrooms === 3) return 'T3';
    if (bedrooms === 4) return 'T4';
    return 'T5';
  }
}
