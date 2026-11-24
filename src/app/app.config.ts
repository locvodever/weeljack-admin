import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideWeeljack } from 'weeljack-ng';
import { wjPolice } from 'weeljack-ng/preset-police';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Police is the default look and the only preset in the initial bundle; the others load on
    // demand from the configurator. `darkMode: 'class'` = dark while `.wj-dark` is on <html>, which
    // LayoutService toggles.
    provideWeeljack({ preset: wjPolice, darkMode: 'class' }),
  ],
};
