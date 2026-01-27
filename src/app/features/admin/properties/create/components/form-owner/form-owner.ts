import { Component, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-owner',
  imports: [ReactiveFormsModule],
  templateUrl: './form-owner.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormOwner),
      multi: true
    }
  ],
  styleUrl: './form-owner.css'
})
export class FormOwner implements OnInit, OnDestroy, ControlValueAccessor {

  form: FormGroup;
  private subs: Subscription = new Subscription();

  onChange: any = () => {};
  onTouch: any = () => {};

  constructor(private fb: FormBuilder) {
    // Definimos aquí las validaciones que antes venían del padre
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      surname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(6), Validators.maxLength(254)]],
      numberPhone: ['', [Validators.required]] // Puedes agregar patrón de teléfono si quieres
    });
  }

  ngOnInit(): void {
    // Escuchamos cambios internos para avisar al padre
    const sub = this.form.valueChanges.subscribe(val => {
      if (this.form.valid) {
        this.onChange(val); // Enviamos el objeto Owner completo
      } else {
        this.onChange(null); // Bloqueamos al padre si hay error
      }
      this.onTouch();
    });
    this.subs.add(sub);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // --- Implementación CVA ---
  writeValue(value: any): void {
    if (value) {
      this.form.setValue(value, { emitEvent: false });
    } else {
      this.form.reset();
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouch = fn; }
  setDisabledState(isDisabled: boolean): void { 
    isDisabled ? this.form.disable() : this.form.enable(); 
  }
}
