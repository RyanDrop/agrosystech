import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';

@Directive({
  selector: 'form[formGroup][agroFormStorage]',
  standalone: true,
})
export class FormStorageDirective implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  @Input() public formGroup!: FormGroup;
  @Input() public agroFormStorage = 'agroFormStorage';

  ngOnInit(): void {
    this.updateFormValue();
    this.listenUpdateValue();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateFormValue(): void {
    const storageValue = JSON.parse(localStorage.getItem(this.agroFormStorage) || '{}');
    if (storageValue) {
      this.formGroup.patchValue(storageValue);
    }
  }

  private listenUpdateValue(): void {
    this.formGroup.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((value) => localStorage.setItem(this.agroFormStorage, JSON.stringify(value)));
  }
}
