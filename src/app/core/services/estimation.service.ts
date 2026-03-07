import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PropertyValuation } from '../../shared/models/property-valuation.model';
import { ProfessionalValuationRequest } from '../../shared/models/professional-valuation-request.interface';
import {environment} from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class EstimationService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtém estimativa de preço do imóvel
   * POST /api/v1/estimation
   */
  async getEstimation(data: {
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    zipCode: string;
    propertyState: string;
    purpose: string;
  }): Promise<{ min: number; max: number; avg: number; estimativeId?: string }> {
    const url = `${this.baseUrl}/v1/estimation`;

    const body = {
      purpose: this.mapPurpose(data.purpose),
      propertyType: this.mapPropertyType(data.propertyType),
      zipCode: data.zipCode,
      propertyState: this.mapPropertyState(data.propertyState),
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area
    };

    try {
      const response = await firstValueFrom(
        this.http.post<{ min: number; max: number; avg: number; estimativeId?: string }>(url, body)
      );

      return {
        min: response.min,
        max: response.max,
        avg: response.avg,
        estimativeId: response.estimativeId
      };
    } catch (error: any) {
      console.error('Error getting estimation:', error);
      throw error;
    }
  }

  /**
   * Submete pedido de avaliação completo (fluxo direto)
   * POST /api/v1/valuation
   */
  async submitValuation(data: PropertyValuation): Promise<any> {
    const url = `${this.baseUrl}/v1/valuation`;

    const body = {
      property: {
        purpose: this.mapPurpose(data.purpose),
        propertyType: this.mapPropertyType(data.propertyType),
        zipCode: data.zipCode,
        propertyState: this.mapPropertyState(data.propertyState),
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: data.area
      },
      contact: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        allowContact: !!data.privacyPolicy
      }
    };

    try {
      return await firstValueFrom(this.http.post(url, body));
    } catch (error) {
      console.error('Error submitting valuation:', error);
      throw error;
    }
  }

  /**
   * Cria pedido de avaliação a partir de uma estimativa existente
   * POST /api/v1/valuation/from-estimate/{estimativeId}
   */
  async submitValuationFromEstimate(estimativeId: string, contact: {
    name: string;
    email: string;
    phone: string;
    allowContact: boolean;
  }): Promise<any> {
    const url = `${this.baseUrl}/v1/valuation/from-estimate/${estimativeId}`;

    const body = {
      contact: {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        allowContact: contact.allowContact
      }
    };

    try {
      return await firstValueFrom(this.http.post(url, body));
    } catch (error) {
      console.error('Error submitting valuation from estimate:', error);
      throw error;
    }
  }

  /**
   * Submete pedido de avaliação profissional presencial (sem dados de imóvel).
   * POST /api/v1/valuation/direct-contact
   */
  async submitProfessionalValuationRequest(contact: ProfessionalValuationRequest): Promise<void> {
    const url = `${this.baseUrl}/v1/valuation/direct-contact`;

    const body = {
      contact: {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        allowContact: contact.allowContact
      },
      property: null
    };

    try {
      await firstValueFrom(this.http.post(url, body));
    } catch (error) {
      console.error('Error submitting professional valuation request:', error);
      throw error;
    }
  }

  private mapPropertyType(input: string): 'APARTMENT' | 'HOUSE' {
    const v = (input || '').toLowerCase();
    if (v.includes('apart') || v.includes('apartamento') || v.includes('apartment')) return 'APARTMENT';
    return 'HOUSE';
  }

  private mapPropertyState(input: string): 'NEW' | 'USED' | 'RENOVATED' | 'UNDER_CONSTRUCTION' {
    const v = (input || '').toUpperCase();

    // Mapeamento PT -> EN
    if (v === 'NOVO' || v === 'NEW') return 'NEW';
    if (v === 'USADO' || v === 'USED') return 'USED';
    if (v === 'RENOVADO' || v === 'RENOVATED') return 'RENOVATED';
    if (v === 'EM CONSTRUÇÃO' || v === 'UNDER_CONSTRUCTION') return 'UNDER_CONSTRUCTION';

    // Fallback
    return 'USED';
  }

  private mapPurpose(input: string): 'SELL' | 'RENT' {
    const v = (input || '').toUpperCase();

    // Já deve vir como SELL ou RENT do PropertyInfoComponent
    if (v === 'SELL' || v === 'VENDER') return 'SELL';
    if (v === 'RENT' || v === 'ARRENDAR') return 'RENT';

    // Fallback
    return 'SELL';
  }
}
