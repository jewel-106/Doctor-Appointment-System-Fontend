import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppComponent } from './app/app';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app/app.routes';
import { jwtInterceptor } from './app/services/jwt.interceptor';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
bootstrapApplication(AppComponent, {
  providers: [
    provideAnimationsAsync(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    importProvidersFrom(BrowserAnimationsModule)
  ]
}).catch(err => console.error(err));