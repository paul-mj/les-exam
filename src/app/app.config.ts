import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppService } from './core/services/app/app.service';
import { ApiService } from './core/services/api/api.service';
import { APP_BASE_HREF, PlatformLocation } from '@angular/common';


const initializeApp = (appConfig: AppService) => {
    return async () => {
        return await appConfig.isLocalFilesLoad();
    };
};

const BASEURL = [{
    provide: APP_BASE_HREF,
    useFactory: (s: PlatformLocation) => s.getBaseHrefFromDOM(),
    deps: [PlatformLocation]
}];

const APIURL = [
    AppService,
    ApiService,
    { provide: APP_INITIALIZER, useFactory: initializeApp, multi: true, deps: [AppService] },
];

export const appConfig: ApplicationConfig = {

    providers: [
        BASEURL,
        APIURL,
        provideRouter(routes),
        provideHttpClient(), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(),
    ]

};
