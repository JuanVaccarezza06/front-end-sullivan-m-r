import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';

@Component({
  selector: 'app-form-address',
  imports: [ReactiveFormsModule],

  templateUrl: './form-address.html',
  styleUrl: './form-address.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormAddress),
      multi: true,
    },
  ],
})
export class FormAddress implements OnInit, OnDestroy, ControlValueAccessor {
  form: FormGroup;
  private subs = new Subscription();

  onChange: any = () => {};
  onTouch: any = () => {};

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      mainStreet: ['', [Validators.required, Validators.minLength(2)]],
      secondaryStreet: ['', [Validators.required]],
      numbering: [null, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    // Escuchamos cambios con un pequeño debounce para no saturar al padre en cada tecla
    const sub = this.form.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((value) => {
        this.onChange(value);
        this.onTouch();
      });
    this.subs.add(sub);
  }

  // El Padre le "escribe" al Hijo (Modo Edición)
  writeValue(value: any): void {
    if (value) {
      this.form.patchValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.form.disable() : this.form.enable();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
