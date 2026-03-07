import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { AppConfig } from '../models/app-config.interface';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private readonly http = inject(HttpClient);

  private configUrl = '/assets/config.json';
  readonly config = signal<AppConfig | null>(null);

  /**
   * Carrega configuração inicial da aplicação
   * Chamado no APP_INITIALIZER
   */
  loadConfig(): Observable<void> {
    return this.http.get<AppConfig>(`${this.configUrl}`).pipe(
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
      root.style.setProperty('--color-primary', config.settings.branding.primaryColor);
    }

    if (config.settings.branding.secondaryColor) {
      root.style.setProperty('--color-gray-dark', config.settings.branding.secondaryColor);
    }
  }
}
