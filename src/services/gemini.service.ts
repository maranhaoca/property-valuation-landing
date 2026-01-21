import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PropertyValuation } from '../models/property-valuation.model';
import {environment} from "../environments/environment";

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  async generatePropertySummary(data: PropertyValuation): Promise<string> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/api/generate-summary`;
    try {
      const resp = await firstValueFrom(
        this.http.post<{ summary?: string; text?: string }>(url, data)
      );
      return (resp && (resp.summary || resp.text)) || '';
    } catch (error) {
      console.error('Error calling backend generate endpoint:', error);
      throw new Error('Failed to generate property summary via backend.');
    }
  }

  /**
   * Envia um pedido de valuation para o backend: POST /api/{tenantSlug}/valuation
   * Mapeamentos:
   * - propertyType: 'Apartamento' -> APARTMENT, 'Casa' -> HOUSE
   * - typology: mapear por número de quartos: 0->T0, 1->T1, 2->T2, 3->T3, 4->T4, 5+->T5
   * - areaM2: usefulArea
   * - condition: mapear de propertyState para PropertyCondition: 'Novo'->NEW, 'Usado'->GOOD, 'Renovado'->GOOD, 'Construção'->TO_RENOVATE, 'Planta'->NEW
   * - lead: { name, email, phone, allowContact: privacyPolicy }
   */
  async submitValuation(tenantSlug: string, data: PropertyValuation): Promise<any> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/api/${encodeURIComponent(tenantSlug)}/valuation`;

    const body = {
      propertyType: this.mapPropertyType(data.propertyType),
      typology: this.mapTypology(data.bedrooms),
      areaM2: data.usefulArea,
      condition: this.mapCondition(data.propertyState),
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

  private mapCondition(state: string): 'NEW' | 'GOOD' | 'TO_RENOVATE' {
    const s = (state || '').toLowerCase();
    if (s === 'novo' || s === 'planta') return 'NEW';
    if (s === 'usado' || s === 'renovado' || s === 'construção') return 'GOOD';
    return 'TO_RENOVATE';
  }
}
