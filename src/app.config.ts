import {APP_INITIALIZER, ApplicationConfig, provideZonelessChangeDetection} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {AgentService} from "./app/core/services/agent.service";

export function initializeApp(agentService: AgentService) {
    return () => agentService.loadConfig();
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideRouter(routes),
        {
            provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [AgentService],
            multi: true
        }
    ]
};