import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PropertyValuation } from '../../shared/models/property-valuation.model';
import {environment} from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class ValuationService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  async submitValuation(data: PropertyValuation): Promise<any> {
    const url = `${this.baseUrl}/valuation`;

    const body = {
      propertyType: this.mapPropertyType(data.propertyType),
      typology: data.bedrooms,
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
}
