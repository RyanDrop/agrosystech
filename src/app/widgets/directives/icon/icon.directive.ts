import { booleanAttribute, Directive, ElementRef, inject, Input } from '@angular/core';

@Directive({
  selector: '[agroIcon]',
  standalone: true,
  host: {
    class: 'material-icons-outlined',
    '[class.primary]': 'isColorPrimary',
  },
})
export class IconDirective {
  private readonly elementRef = inject(ElementRef);

  @Input({ transform: booleanAttribute }) public isColorPrimary?: boolean;
  @Input() public set agroType(value: string | undefined) {
    this.elementRef.nativeElement.innerText = value;
  }
}
