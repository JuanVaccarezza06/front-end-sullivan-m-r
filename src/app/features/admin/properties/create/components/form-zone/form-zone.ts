import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  ReactiveFormsModule,
  ControlValueAccessor,
  FormGroup,
  FormBuilder,
  Validators,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import ZoneDTO from '../../../../../../core/models/Zone';
import { ZoneService } from '../../../../../../core/services/zone-service/zone-service';

@Component({
  selector: 'app-form-zone',
  imports: [ReactiveFormsModule],
  templateUrl: './form-zone.html',
  styleUrl: './form-zone.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormZone),
      multi: true,
    },
  ],
})
export class FormZone implements OnInit, OnDestroy, ControlValueAccessor {
  form: FormGroup;
  zoneArray: ZoneDTO[] = [];
  addZone: boolean = false; // Toggle para modo manual
  private subs: Subscription = new Subscription();

  onChange: any = () => {};
  onTouch: any = () => {};

  constructor(
    private fb: FormBuilder,
    private zoneService: ZoneService,
  ) {
    this.form = this.fb.group({
      // Campo para selección
      selectedZone: [''],

      // Campos para creación manual
      zone: [''],
      city: [''],
      province: [''],
      country: [''],
    });
  }
  writeValue(value: ZoneDTO): void {
    if (value) {
      // Si el valor ya viene, es una zona existente (modo selección)
      this.addZone = false;
      this.setupValidationLogic(); // Aseguramos que los validadores sean los de selección

      this.form.patchValue(
        {
          selectedZone: value, // Le pasamos el objeto completo
        },
        { emitEvent: false },
      );
    } else {
      this.form.reset();
    }
  }

  ngOnInit(): void {
    this.loadZones();
    this.setupValidationLogic();

    // Escuchar cambios para armar el DTO de salida
    const sub = this.form.valueChanges.subscribe(() => {
      this.emitValue();
    });
    this.subs.add(sub);
  }

  loadZones() {
    this.zoneService.getAll().subscribe({
      next: (data) => (this.zoneArray = data),
      error: (e) => console.error(e),
    });
  }

  // Lógica para activar/desactivar validaciones según el modo
  toggleMode() {
    this.addZone = !this.addZone;
    this.setupValidationLogic();

    // Limpiamos valores al cambiar de modo para evitar mezcla de datos
    this.form.reset();
    this.emitValue(); // Emitimos null al resetear
  }

  setupValidationLogic() {
    if (this.addZone) {
      // Modo: Crear Nueva -> Validamos los textos, ignoramos el select
      this.form.get('selectedZone')?.clearValidators();

      this.form.get('zone')?.setValidators([Validators.required, Validators.minLength(2)]);
      this.form.get('city')?.setValidators([Validators.required]);
      this.form.get('province')?.setValidators([Validators.required]);
      this.form.get('country')?.setValidators([Validators.required]);
    } else {
      // Modo: Seleccionar Existente -> Validamos el select, ignoramos los textos
      this.form.get('selectedZone')?.setValidators([Validators.required]);

      this.form.get('zone')?.clearValidators();
      this.form.get('city')?.clearValidators();
      this.form.get('province')?.clearValidators();
      this.form.get('country')?.clearValidators();
    }
    // Actualizar estado de validación
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.updateValueAndValidity({ emitEvent: false });
    });
  }

  compareZones(z1: ZoneDTO, z2: ZoneDTO): boolean {
    // Si ambos existen, comparamos por un valor único (nombre de zona)
    return z1 && z2 ? z1.zoneName === z2.zoneName : z1 === z2;
  }

  emitValue() {
    this.onTouch();

    if (this.form.invalid) {
      this.onChange(null);
      return;
    }

    const val = this.form.value;
    let resultDTO: any = null;

    if (this.addZone) {
      resultDTO = {
        zoneName: val.zone,
        cityDTO: {
          cityName: val.city,
          provinceDTO: {
            provinceName: val.province,
            countryDTO: { countryName: val.country },
          },
        },
      };
    } else {
      // IMPORTANTE: val.selectedZone ya es el objeto ZoneDTO gracias a [ngValue]
      resultDTO = val.selectedZone;
    }

    this.onChange(resultDTO);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
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
}
