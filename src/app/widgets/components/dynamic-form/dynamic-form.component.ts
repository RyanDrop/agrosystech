import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import {
  booleanAttribute,
  Component,
  EventEmitter,
  Inject,
  inject,
  Input,
  OnInit,
  Output,
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule, NzImageService } from 'ng-zorro-antd/image';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NgxMaskDirective } from 'ngx-mask';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

import { AutoFocusDirective } from './../../directives//auto-focus/auto-focus.directive';
import { IconDirective } from './../../directives/icon/icon.directive';
import { DownloadStoragePipe } from './../../pipes/download-storage/download-storage.pipe';
import { eDynamicField } from './dynamic-field.enum';
import { DynamicFormConfig } from './dynamic-form-config.interface';
import { ERROR_MESSAGES, ErrorMessages } from './form-errors';

@Pipe({ name: 'formIsRequired', standalone: true })
export class FormIsRequiredPipe implements PipeTransform {
  transform(value: AbstractControl) {
    return value.statusChanges.pipe(
      startWith(value),
      map(() => {
        return !value.hasValidator(Validators.required);
      }),
    );
  }
}

const DYNAMIC_FORM_MODULES = [
  AutoFocusDirective,
  A11yModule,
  CommonModule,
  DownloadStoragePipe,
  FormIsRequiredPipe,
  FormsModule,
  IconDirective,
  NgxMaskDirective,
  NzAvatarModule,
  NzButtonModule,
  NzCheckboxModule,
  NzDatePickerModule,
  NzDividerModule,
  NzFormModule,
  NzGridModule,
  NzIconModule,
  NzImageModule,
  NzInputModule,
  NzInputNumberModule,
  NzModalModule,
  NzRadioModule,
  NzSelectModule,
  NzSwitchModule,
  NzUploadModule,
  NzTypographyModule,
  ReactiveFormsModule,
  RouterModule,
];

@UntilDestroy()
@Component({
  selector: 'agro-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
  standalone: true,
  imports: DYNAMIC_FORM_MODULES,
  providers: [DownloadStoragePipe],
})
export class DynamicFormComponent implements OnInit {
  private readonly nzImageService = inject(NzImageService);
  private readonly downloadAvatarPipe = inject(DownloadStoragePipe);

  protected autoSizeColumns = 12;
  protected eDynamicField = eDynamicField;

  @Input() public config?: DynamicFormConfig[];
  @Input({ transform: booleanAttribute }) public hideOptionalLabel = false;
  @Output() public formValueChange = new EventEmitter();

  public form: FormGroup = new FormGroup({});

  constructor(@Inject(ERROR_MESSAGES) private readonly errors: ErrorMessages) {}

  ngOnInit() {
    this.createForm();
    this.form.valueChanges.pipe(debounceTime(500), distinctUntilChanged(), untilDestroyed(this)).subscribe((value) => {
      this.formValueChange.emit(value);
    });
  }

  public getErrorMessage(errors: ValidationErrors): string | null {
    if (!errors) return null;

    const [firstKey] = Object.keys(errors);
    const getErrorMessageFn = this.errors[firstKey];
    if (!getErrorMessageFn) return null;

    const text = getErrorMessageFn(errors[firstKey]);
    return text;
  }

  public beforeUploadAvatar = (file: NzUploadFile): boolean => {
    const avatarControl = this.config?.find((c) => c.type.field === eDynamicField.AVATAR);
    if (avatarControl) this.form.get(avatarControl.name)?.setValue(file);
    return false;
  };

  public beforeUploadImage = (file: NzUploadFile): boolean => {
    const control = this.config?.find((c) => c.type.field === eDynamicField.IMAGE);
    if (control) this.form.get(control.name)?.setValue(file);
    return false;
  };

  public previewImage(controlName: string) {
    const image = this.form.get(controlName)?.value;
    if (!image) return;

    this.downloadAvatarPipe.transform(image).then((base64) => {
      this.nzImageService.preview([{ src: base64 }]);
    });
  }

  public togglePasswordIconVisibility(field: DynamicFormConfig) {
    const control = this.config?.find((c) => c.name === field.name);
    if (!control) return;

    control.showPasswordIcon = !control.showPasswordIcon;
  }

  public preventDefault() {
    return false;
  }

  private createForm() {
    this.config?.forEach((control) => {
      if (control.type.field !== eDynamicField.DIVIDER) {
        this.form.addControl(
          control.name,
          new FormControl(
            { value: control.initialValue !== undefined ? control.initialValue : null, disabled: control.disabled },
            control.validations,
          ),
        );
      }
    });
  }
}
