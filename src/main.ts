import { provideHttpClient } from '@angular/common/http';
import { provideAppInitializer, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { firstValueFrom } from 'rxjs';

import { AppComponent } from './app/app.component';
import { APP_ROUTES } from './app/app.routes';
import { loadDefaultLanguage, TRANSLOCO_OPTIONS } from './app/shared/transloco/transloco.config';
import { pt_BR, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import pt from '@angular/common/locales/pt';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

registerLocaleData(pt);

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideEnvironmentNgxMask(),
    provideRouter(APP_ROUTES),
    provideTransloco(TRANSLOCO_OPTIONS),
    provideAppInitializer(() => firstValueFrom(loadDefaultLanguage())), provideNzI18n(pt_BR), importProvidersFrom(FormsModule), provideAnimationsAsync(), provideHttpClient(),
  ],
}).catch((err) => console.error(err));
