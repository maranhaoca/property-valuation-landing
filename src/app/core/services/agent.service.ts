import {inject, Injectable, signal} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AgentConfig} from "../../shared/models/agent-config.model";
import {firstValueFrom} from "rxjs";
import {environment} from "../../../environments/environment";


@Injectable({ providedIn: 'root' })
export class AgentService {
    private http = inject(HttpClient);

    private baseUrl = environment.apiUrl;

    readonly config = signal<AgentConfig | null>(null);

    /**
     * Chamada pelo APP_INITIALIZER
     */
    async loadConfig(): Promise<void> {
        const domain = window.location.hostname;
        const url = `${this.baseUrl}/v1/tenants/config`;

        try {
            const config = await firstValueFrom(
                this.http.get<AgentConfig>(url)
            );

            this.config.set(config);
            this.applyBranding(config);
        } catch (error) {
            console.error('Falha ao carregar configuração do agente:', error);
            // TODO: aqui podes redirecionar para uma página de erro 404
        }
    }

    private applyBranding(config: AgentConfig): void {
        const root = document.documentElement;
        const colors = config.settings.branding;

        if (colors.primaryColor) {
            root.style.setProperty('--color-era-red', colors.primaryColor);
        }
    }
}