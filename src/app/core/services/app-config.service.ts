import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { AppConfig } from '../models/app-config.interface';
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private readonly http = inject(HttpClient);

  private baseUrl = environment.apiUrl;
  readonly config = signal<AppConfig | null>(null);

  readonly estimationFlowEnabled = computed(() =>
    this.config()?.settings.estimationFlowEnabled ?? false
  );

  readonly primaryColor = computed(() =>
    this.config()?.settings.branding?.primaryColor ?? '#E30613'
  );

  readonly secondaryColor = computed(() =>
    this.config()?.settings.branding?.secondaryColor ?? '#374151'
  );

  /**
   * Carrega configuração inicial da aplicação
   * Chamado no APP_INITIALIZER
   */
  loadConfig(): Observable<void> {
    return this.http.get<AppConfig>(`${this.baseUrl}/v1/init`).pipe(
      tap(config => {
        this.config.set(config);
        this.applyBranding(config);
      }),
      map(() => void 0),
      catchError(error => {
        console.error('❌ Failed to load config:', error);
        // redirect to error page in production
        return of(void 0);
      })
    );
  }

  /**
   * Aplica cores de branding como CSS variables
   */
  private applyBranding(config: AppConfig): void {
    if (!config.settings.branding) return;

    const root = document.documentElement;

    if (config.settings.branding.primaryColor) {
      root.style.setProperty('--color-era-red', config.settings.branding.primaryColor);
    }

    if (config.settings.branding.secondaryColor) {
      root.style.setProperty('--color-era-gray-dark', config.settings.branding.secondaryColor);
    }
  }

  /**
   * Atualiza a configuração manualmente (útil para testes)
   */
  updateConfig(config: Partial<AppConfig>): void {
    this.config.update(current => ({
      ...current,
      ...config
    } as AppConfig));
  }
}
