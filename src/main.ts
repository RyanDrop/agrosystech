import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import pt from '@angular/common/locales/pt';
import { importProvidersFrom, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { IconDefinition } from '@ant-design/icons-angular';
import {
  ArrowLeftOutline,
  ArrowRightOutline,
  BarChartOutline,
  DeleteFill,
  DoubleLeftOutline,
  DoubleRightOutline,
  EditOutline,
  EyeInvisibleOutline,
  EyeOutline,
  FileDoneOutline,
  FilePdfOutline,
  FilterOutline,
  ImportOutline,
  LogoutOutline,
  SearchOutline,
  ShopOutline,
  SolutionOutline,
  UserOutline,
} from '@ant-design/icons-angular/icons';
import { provideTransloco } from '@jsverse/transloco';
import { provideNzI18n, pt_BR } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { firstValueFrom } from 'rxjs';

import { AppComponent } from './app/app.component';
import { APP_ROUTES } from './app/app.routes';
import { loadDefaultLanguage, TRANSLOCO_OPTIONS } from './app/shared/transloco/transloco.config';

const icons: IconDefinition[] = [
  UserOutline,
  ArrowRightOutline,
  ArrowLeftOutline,
  EyeOutline,
  EyeInvisibleOutline,
  ShopOutline,
  FileDoneOutline,
  EditOutline,
  DeleteFill,
  SearchOutline,
  FilePdfOutline,
  DoubleRightOutline,
  ImportOutline,
  SolutionOutline,
  DoubleLeftOutline,
  FilterOutline,
  BarChartOutline,
  LogoutOutline,
];

registerLocaleData(pt);

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideEnvironmentNgxMask(),
    provideNzIcons(icons),
    provideRouter(APP_ROUTES),
    provideTransloco(TRANSLOCO_OPTIONS),
    provideAppInitializer(() => firstValueFrom(loadDefaultLanguage())),
    provideNzI18n(pt_BR),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    provideHttpClient(),
    NzModalService,
  ],
}).catch((err) => console.error(err));
