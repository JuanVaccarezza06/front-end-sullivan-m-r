import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import OperationType from '../../../../../core/models/OperationType';
import Property from '../../../../../core/models/properties/Property';
import PropertyType from '../../../../../core/models/PropertyType';
import { PropertyService } from '../../../../../core/services/property-service/property-service';
import { InputAmenities } from '../../../../../shared/components/ui/input-amenities/input-amenities';
import { InputImages } from '../../../../../shared/components/ui/input-images/input-images';
import ZoneDTO from '../../../../../core/models/Zone';
import { ZoneService } from '../../../../../core/services/zone-service/zone-service';
import { ImgBbService } from '../../../../../core/services/imgbb-service/img-bb-service';
import { catchError, finalize, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { ImageItem } from '../../../../../core/models/ImageItem';

@Component({
  selector: 'app-form-property',
  imports: [ReactiveFormsModule, InputAmenities, InputImages],
  templateUrl: './form-property.html',
  styleUrl: './form-property.css',
})
export class FormProperty implements OnInit {
  // Inyeccion de dependencias moderna
  private fb = inject(FormBuilder);
  private propertyService = inject(PropertyService);
  private zoneService = inject(ZoneService);
  private router = inject(Router);
  private imgBbService = inject(ImgBbService); // <--- INYECTAR

  // Signals para Estado Reactivo (Angular 20 Best Practices)
  isUpdate = signal<boolean>(false);
  isNewZoneMode = signal<boolean>(false); // false = Seleccionar, true = Crear
  isUploading = signal<boolean>(false); // <--- NUEVA SIGNAL PARA LOADING UI

  // Datos para Selects
  operationTypes = signal<OperationType[]>([]);
  propertyTypes = signal<PropertyType[]>([]);
  zones = signal<ZoneDTO[]>([]);

  // Referencia para Update
  private propertyToEdit: Property | null = null;

  // El Gran Formulario Unificado
  form!: FormGroup;

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCatalogs();
    this.checkEditMode();
  }

  // --- 1. Inicialización y Estructura Unificada ---
  private initForm() {
    this.form = this.fb.group({
      // 1. Información Básica
      id: [null],
      title: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(30), Validators.maxLength(300)]],
      price: [null, [Validators.required, Validators.min(1)]],
      propertyTypeName: ['', Validators.required],
      operationTypeName: ['', Validators.required],

      // 2. Características Físicas
      yearConstruction: [
        null,
        [Validators.required, Validators.min(1800), Validators.max(new Date().getFullYear())],
      ],
      areaStructure: [null, [Validators.required, Validators.min(1)]],
      totalArea: [null, [Validators.required, Validators.min(1)]],
      rooms: [null, [Validators.required, Validators.min(1)]],
      bathrooms: [null, [Validators.required, Validators.min(1)]],
      bedrooms: [null, [Validators.required, Validators.min(1)]],

      // 3. Ubicación: Zona (Lógica Dual)
      zoneSelection: [null, Validators.required], // Select existente
      zoneNew: this.fb.group({
        // Crear nueva
        zoneName: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
        cityName: [{ value: '', disabled: true }, Validators.required],
        provinceName: [{ value: '', disabled: true }, Validators.required],
        countryName: [{ value: '', disabled: true }, Validators.required],
      }),

      // 4. Ubicación: Dirección
      address: this.fb.group({
        mainStreet: ['', [Validators.required, Validators.minLength(2)]],
        secondaryStreet: ['', Validators.required],
        numbering: [null, [Validators.required, Validators.min(1)]],
      }),

      // 5. Propietario
      owner: this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(3)]],
        surname: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        numberPhone: ['', Validators.required],
      }),

      // 6. Extras (Componentes externos)
      amenitiesList: [[]],
      imageDTOList: [[]],
    });
  }

  // --- 2. Lógica de Negocio: Zona ---
  toggleZoneMode() {
    // Invertimos el modo
    const isNew = !this.isNewZoneMode();
    this.isNewZoneMode.set(isNew);

    const zoneSelect = this.form.get('zoneSelection');
    const zoneNewGroup = this.form.get('zoneNew');

    if (isNew) {
      // Modo CREAR: Habilitamos inputs manuales, Deshabilitamos select
      zoneSelect?.disable();
      zoneSelect?.setValue(null);
      zoneNewGroup?.enable();
    } else {
      // Modo SELECCIONAR: Habilitamos select, Deshabilitamos inputs manuales
      zoneSelect?.enable();
      zoneNewGroup?.disable();
      zoneNewGroup?.reset();
    }
  }

  // --- 3. Carga de Datos y Edición ---
  private loadCatalogs() {
    this.propertyService
      .getAvailablesOperationTypes()
      .subscribe((data) => this.operationTypes.set(data));
    this.propertyService
      .getAvailablePropertyTypes()
      .subscribe((data) => this.propertyTypes.set(data));
    this.zoneService.getAll().subscribe((data) => this.zones.set(data));
  }

  private checkEditMode() {
    const state = this.router.lastSuccessfulNavigation?.extras?.state as { info?: Property };
    if (state?.info) {
      this.isUpdate.set(true);
      this.propertyToEdit = state.info;
      this.patchForm(state.info);
    }
  }

  private patchForm(prop: Property) {
    // Mapeo inverso: De DTO complejo a Formulario plano
    this.form.patchValue({
      id: prop.id,
      title: prop.title,
      description: prop.description,
      price: prop.price,
      propertyTypeName: prop.propertyTypeDTO.typeName,
      operationTypeName: prop.operationTypeDTO.operationName,
      yearConstruction: prop.yearConstruction,
      areaStructure: prop.areaStructure,
      totalArea: prop.totalArea,
      rooms: prop.rooms,
      bathrooms: prop.bathrooms,
      bedrooms: prop.bedrooms,
      // Objetos anidados directos
      address: prop.addressDTO,
      owner: prop.ownerDTO,
      amenitiesList: prop.amenitiesList,
      imageDTOList: prop.imageDTOList,
      // Zona (Siempre asumimos que al editar viene una zona existente)
      zoneSelection: prop.zoneDTO?.zoneName || '',
    });
    // Asegurar estado inicial de zona
    this.isNewZoneMode.set(false);
    this.form.get('zoneNew')?.disable();

    setTimeout(() => this.debugValidation(), 500);
  }

  // --- 4. Submit ---
  // --- EL NUEVO ONSUBMIT ---
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // 1. Bloqueamos UI
    this.isUploading.set(true);

    // 2. Obtenemos las imágenes "crudas" del formulario (mezcla de Files y URLs)
    const rawImages: ImageItem[] = this.form.get('imageDTOList')?.value || [];

    // 3. Preparamos array de Observables para subir las fotos en paralelo
    const uploadTasks: Observable<any>[] = rawImages.map((img) => {
      // CASO A: Imagen ya existente (Edición) -> No tiene objeto File
      if (!img.file) {
        return of({
          url: img.url,
          name: img.name,
          isPrimary: img.isPrimary,
          position: img.position,
        });
      }

      // CASO B: Imagen Nueva -> Tiene File -> Subir a ImgBB
      return this.imgBbService.uploadImage(img.file).pipe(
        map((response) => {
          // Mapeamos la respuesta de ImgBB al formato que quiere tu backend Java
          return {
            url: response.data.url, // La URL pública que devuelve ImgBB
            name: img.name,
            isPrimary: img.isPrimary,
            position: img.position,
          };
        }),
        catchError((err) => {
          console.error(`Error subiendo imagen ${img.name}`, err);
          // Si falla una, lanzamos error para detener el proceso (o podrías ignorarla)
          throw err;
        }),
      );
    });

    // 4. Ejecutamos todas las subidas en paralelo (forkJoin)
    forkJoin(uploadTasks)
      .pipe(
        // Cuando TODAS terminan, entramos aquí con el array de DTOs limpios
        switchMap((cleanImagesDTO) => {
          // 5. Construimos el Payload Final
          // Pasamos cleanImagesDTO, que ya son solo URLs y metadatos
          const payload = this.buildPayload(cleanImagesDTO);

          console.log('Payload listo para Backend:', payload);

          // 6. Enviamos a Spring Boot
          return this.isUpdate()
            ? this.propertyService.put(payload)
            : this.propertyService.post(payload);
        }),
        // Finalize se ejecuta siempre (éxito o error) para desbloquear el botón
        finalize(() => this.isUploading.set(false)),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['admin/property-list']);
        },
        error: (err) => {
          console.error('Error en el proceso de guardado:', err);
          alert('Hubo un error subiendo las imágenes o guardando la propiedad. Intenta de nuevo.');
        },
      });
  }

  // Modifiqué tu buildPayload para recibir las imágenes procesadas
  private buildPayload(processedImages: any[]): any {
    const v = this.form.getRawValue();

    // ... (Tu lógica de ZonaDTO igual que antes) ...
    let finalZoneDTO;
    if (this.isNewZoneMode()) {
      // ... misma lógica ...
      finalZoneDTO = {
        zoneName: v.zoneNew.zoneName,
        cityDTO: {
          cityName: v.zoneNew.cityName,
          provinceDTO: {
            provinceName: v.zoneNew.provinceName,
            countryDTO: { countryName: v.zoneNew.countryName },
          },
        },
        isFeatured: false,
      };
    } else {
      // LÓGICA DE SELECCIÓN (CAMBIO AQUÍ)
      // 1. Obtenemos el string seleccionado del form (ej. "Manhattan")
      const selectedName = v.zoneSelection;

      // 2. Buscamos el objeto completo en tu señal de zonas
      const selectedZoneObj = this.zones().find((z) => z.zoneName === selectedName);

      // 3. Asignamos ese objeto. Si no lo encuentra (caso raro), mandamos null.
      finalZoneDTO = selectedZoneObj || null;
    }

    return {
      id: this.isUpdate() ? this.propertyToEdit?.id : null,
      title: v.title,
      description: v.description,
      price: v.price,
      // ... resto de campos simples ...
      yearConstruction: v.yearConstruction,
      areaStructure: v.areaStructure,
      totalArea: v.totalArea,
      rooms: v.rooms,
      bathrooms: v.bathrooms,
      bedrooms: v.bedrooms,
      publicationDate: this.isUpdate() ? this.propertyToEdit?.publicationDate : null,

      propertyTypeDTO: { typeName: v.propertyTypeName },
      operationTypeDTO: { operationName: v.operationTypeName },

      zoneDTO: finalZoneDTO,
      addressDTO: v.address,
      ownerDTO: v.owner,
      amenitiesList: v.amenitiesList,

      latitude: this.isUpdate() ? this.propertyToEdit?.latitude : null,
      longitude: this.isUpdate() ? this.propertyToEdit?.longitude : null,

      // AQUÍ ESTÁ LA CLAVE: Usamos las imágenes procesadas, NO las del form
      imageDTOList: processedImages,
    };
  }

  onCancel() {
    this.router.navigate(['admin/property-list']);
  }

  // Helper para templates
  hasError(path: string, error: string = 'required'): boolean {
    const control = this.form.get(path);
    return !!(control?.hasError(error) && control?.touched);
  }

  fillFormForTesting() {
    // 1. Preparamos el entorno: Activamos el modo "Crear Nueva Zona"
    // Esto es necesario para habilitar los campos de 'zoneNew' y deshabilitar el select
    if (!this.isNewZoneMode()) {
      this.toggleZoneMode();
    }

    // 2. Datos de prueba (Mock Data)
    const mockData = {
      title: 'Departamento de Lujo frente al Mar',
      description:
        'Espectacular unidad con vista panorámica, amenities de primera categoría y seguridad 24hs. Ideal para inversión o vivienda permanente.',
      price: 250000,
      propertyTypeName: 'Departamento', // Asegúrate que coincida con tus Selects
      operationTypeName: 'Venta', // Asegúrate que coincida con tus Selects

      yearConstruction: 2023,
      areaStructure: 120,
      totalArea: 140,
      rooms: 4,
      bathrooms: 2,
      bedrooms: 3,

      // GRUPO ANIDADO: Zona (Modo Manual)
      zoneNew: {
        zoneName: 'Puerto Madero',
        cityName: 'Buenos Aires',
        provinceName: 'Buenos Aires',
        countryName: 'Argentina',
      },

      // GRUPO ANIDADO: Dirección (Antes era addressDTO)
      address: {
        mainStreet: 'Juana Manso',
        secondaryStreet: 'Azucena Villaflor',
        numbering: 1550,
      },

      // GRUPO ANIDADO: Propietario (Antes era ownerDTO)
      owner: {
        firstName: 'Ricardo',
        surname: 'Fort',
        email: 'ricky@chocolate.com',
        numberPhone: '1155558888',
      },
    };

    // 3. Impactamos los datos en el formulario
    this.form.patchValue(mockData);

    console.log('🧪 Datos de prueba cargados exitosamente');
    console.log('Estado del Formulario:', this.form.valid ? '✅ VÁLIDO' : '❌ INVÁLIDO');
  }

  debugValidation() {
    console.group('🕵️‍♂️ Auditoría del Formulario');
    console.log('Form Válido:', this.form.valid);
    console.log('Form Status:', this.form.status);

    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      if (control && control.invalid) {
        const value = control.value;
        const errors = control.errors;
        console.error(`❌ Campo INVÁLIDO: [${key}]`);
        console.table(errors); // Muestra el error exacto (ej: minlength, required, minImages)
        console.log('Valor actual:', value);
      }
    });
    console.groupEnd();
  }
}
