import { Component, Input, OnInit, ElementRef, HostBinding, Self, Optional } from '@angular/core';
import { ControlValueAccessor, Validator, ValidationErrors, NgControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatFormField, MatFormFieldControl, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { IMaskModule } from 'angular-imask';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { validationConfig } from '../../../validation/validation-config';

@Component({
  selector: 'app-form-element',
  standalone: true,
  imports: [
    FormsModule,
    IMaskModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  template: `
    <mat-form-field appearance="fill" class="full-width mb-20">
      <mat-label>{{ label }}</mat-label>
      @if (inputMode === 'text') {
        <input matInput
        [attr.inputmode]="type === 'number' ? 'numeric' : 'text'"
        [formControl]="formControl"
        (focus)="onFocus()"
        (blur)="onBlur()"
        [placeholder]="placeholder"
        [imask]="mask"
        [disabled]="isLoading">
      } @else if (inputMode === 'textarea') {
        <textarea matInput
        [formControl]="formControl"
        (focus)="onFocus()"
        (blur)="onBlur()"
        [placeholder]="placeholder"
        [disabled]="isLoading"></textarea>
      }
      <mat-error>
          @for(errorKey of errorKeys; track errorKey) {
            {{ getErrorMessage(errorKey) }}
          }
        </mat-error>
    </mat-form-field>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    .mb-20 {
      margin-bottom: 5px;
    }
  `],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: FormElementComponent
    }
  ]
})
export class FormElementComponent implements ControlValueAccessor, Validator, MatFormFieldControl<string>, OnInit {
  static nextId = 0;
  @HostBinding() id = `app-form-element-${FormElementComponent.nextId++}`;
  stateChanges = new Subject<void>();

  // Input properties
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() mask: any;
  @Input() isLoading: boolean = false;
  @Input() errorMessage: string = 'Invalid input';
  @Input() inputMode: string = 'text';
  @Input() inputType: string = 'text';

  // Implementing MatFormFieldControl properties
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;

  // Internal value
  private _value: string = '';
  get value(): string {
    return this._value;
  }
  set value(val: string) {
    if (val !== this._value) {
      this._value = val;
      this.stateChanges.next();
      this.onChange(val);
    }
  }

  // MatFormFieldControl properties
  focused = false;
  get empty(): boolean {
    return !this.value;
  }
  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }
  controlType = 'app-form-element';
  describedBy = '';

  // errorState computed via NgControl
  get errorState(): boolean {
    return !!(this.ngControl?.control?.invalid && (this.ngControl.control.touched || this.ngControl.control.dirty));
  }

  // ControlValueAccessor events
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(
    @Self() @Optional() public ngControl: NgControl,
    private _elementRef: ElementRef<HTMLElement>
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    this.stateChanges.next();
  }

  // MatFormFieldControl methods
  setDescribedByIds(ids: string[]): void {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent): void {
    const input = this._elementRef.nativeElement.querySelector('input');
    if (input) {
      (input as HTMLElement).focus();
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this._value = value;
    this.stateChanges.next();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.stateChanges.next();
  }

  // Validator implementation
  validate(): ValidationErrors | null {
    return this.ngControl?.control?.invalid ? { invalid: true } : null;
  }

  // Helper for displaying error messages
  get errorKeys(): string[] {
    return this.ngControl?.control?.errors ? Object.keys(this.ngControl.control.errors) : [];
  }

  getErrorMessage(errorKey: string): string {
    const controlName = this.ngControl?.name as string;
    if (!controlName) {
      return this.errorMessage;
    }
    const messages = validationConfig.personalInfo[controlName]?.messages;
    return messages ? messages[errorKey] : this.errorMessage;
  }

  // Focus handling
  onFocus(): void {
    this.focused = true;
    this.stateChanges.next();
  }

  onBlur(): void {
    this.focused = false;
    this.onTouched();
    this.stateChanges.next();
  }

  // Helper to get FormControl
  get formControl(): FormControl {
    return this.ngControl?.control as FormControl;
  }
}
