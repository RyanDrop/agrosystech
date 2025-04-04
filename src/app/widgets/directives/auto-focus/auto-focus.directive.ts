import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[agroAutoFocus]',
  standalone: true,
})
export class AutoFocusDirective implements AfterViewInit {
  @Input('agroAutoFocus') public autoFocus?: boolean = true;

  constructor(private readonly elementRef: ElementRef) {}

  ngAfterViewInit() {
    if (!this.autoFocus) return;

    setTimeout(() => {
      this.elementRef.nativeElement.focus();
    }, 500);
  }
}
