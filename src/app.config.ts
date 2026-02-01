import {APP_INITIALIZER, ApplicationConfig, provideZonelessChangeDetection} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {AppConfigService} from "./app/core/services/app-config.service";

export function initializeApp(appConfigService: AppConfigService) {
    return () => appConfigService.loadConfig();
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideRouter(routes),
        {
            provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [AppConfigService],
            multi: true
        }
    ]
};

