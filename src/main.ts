import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

// Angular 22 is zoneless by default, so no zone provider is needed (and no zone.js).
bootstrapApplication(App, appConfig).catch((err: unknown) => console.error(err));
