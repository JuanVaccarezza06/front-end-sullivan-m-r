import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import OperationType from '../../../../../core/models/OperationType';
import Property from '../../../../../core/models/properties/Property';
import PropertyType from '../../../../../core/models/PropertyType';
import { PropertyService } from '../../../../../core/services/property-service/property-service';
import { InputAmenities } from '../../../../../shared/components/ui/input-amenities/input-amenities';
import { InputImages } from '../../../../../shared/components/ui/input-images/input-images';
import { FormAddress } from '../components/form-address/form-address';
import { FormOwner } from '../components/form-owner/form-owner';
import { FormZone } from '../components/form-zone/form-zone';

@Component({
  selector: 'app-form-property',
  imports: [ReactiveFormsModule, InputAmenities, InputImages, FormZone, FormAddress, FormOwner],
  templateUrl: './form-post-property.html',
  styleUrl: './form-post-property.css',
})
export class FormPostProperty implements OnInit {
  form!: FormGroup;

  // Estado
  isUpdate: boolean = false;
  propertyUpdate!: Property;

  // Listas para selects
  operationsTypesArray: OperationType[] = [];
  propertyTypesArray: PropertyType[] = [];

  constructor(
    private fb: FormBuilder,
    private service: PropertyService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // 1. Inicializar estructura del formulario
    this.initForm();

    // 2. Cargar datos auxiliares (Selects)
    this.loadAvailablesOperationTypes();
    this.loadPropertyTypes();

    // 3. Verificar si estamos en modo EDICIÓN
    const state = this.router.lastSuccessfulNavigation?.extras?.state as { info?: Property };
    if (state?.info) {
      this.propertyUpdate = state.info;
      this.isUpdate = true;
      this.patchValuesForEdit(); // Método dedicado a poblar el form
    }
  }

  // --- 1. Inicialización "Clean Code" ---
  initForm() {
    this.form = this.fb.group({
      // -- Datos Primitivos --
      id: [null], // Solo para update

      title: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(50),
          Validators.pattern(/^\S+\s+\S+\s+\S+.*$/), // Mínimo 3 palabras
        ],
      ],

      description: ['', [Validators.required, Validators.minLength(30), Validators.maxLength(300)]],

      price: [
        '',
        [
          Validators.required,
          Validators.min(1), // Corregido de 0 a 1 lógico
          Validators.max(1000000000),
        ],
      ],

      // Selects simples
      propertyTypeName: ['', [Validators.required]],
      operationTypeName: ['', [Validators.required]],

      // Datos Numéricos de Estructura
      yearConstruction: [
        '',
        [Validators.required, Validators.min(1800), Validators.max(new Date().getFullYear())],
      ],
      areaStructure: ['', [Validators.required, Validators.min(1)]],
      totalArea: ['', [Validators.required, Validators.min(1)]],
      rooms: ['', [Validators.required, Validators.min(1)]],
      bathrooms: ['', [Validators.required, Validators.min(1)]],
      bedrooms: ['', [Validators.required, Validators.min(1)]],

      // -- SUB-COMPONENTES (La magia del CVA) --
      // Estos campos esperan OBJETOS completos, no strings sueltos.
      // Si el hijo es inválido, estos campos serán inválidos.

      zoneDTO: [null, Validators.required],
      addressDTO: [null, Validators.required],
      ownerDTO: [null, Validators.required],

      amenitiesList: [[]], // Array de amenities
      imageDTOList: [[]], // Array de imágenes con lógica de portada/orden
    });
  }

  // --- 2. Carga de Selects ---
  loadAvailablesOperationTypes() {
    this.service.getAvailablesOperationTypes().subscribe({
      next: (data) => (this.operationsTypesArray = data),
      error: (e) => console.error('Error loading operations', e),
    });
  }

  loadPropertyTypes() {
    this.service.getAvailablePropertyTypes().subscribe({
      next: (data) => (this.propertyTypesArray = data),
      error: (e) => console.error('Error loading property types', e),
    });
  }

  fillFormForTesting() {
    this.form.patchValue({
      title: 'Hermoso Departamento con Vista al Mar',
      description:
        'Increíble propiedad ubicada en la mejor zona de la ciudad. Cuenta con acabados de lujo, excelente iluminación natural y seguridad 24/7. Cerca de centros comerciales y parques.',
      price: 155000,
      propertyTypeName: 'Departamento', // Asegúrate que coincida con un valor de tu array
      operationTypeName: 'Venta', // Asegúrate que coincida con un valor de tu array
      yearConstruction: 2022,
      areaStructure: 85,
      totalArea: 95,
      rooms: 3,
      bathrooms: 2,
      bedrooms: 2,

      // Datos para app-form-zone (CVA)
      zoneDTO: {
        zoneName: 'Playa Grande',
        cityDTO: {
          cityName: 'Mar del Plata',
          provinceDTO: {
            provinceName: 'Buenos Aires',
            countryDTO: { countryName: 'Argentina' },
          },
        },
      },

      // Datos para app-form-address (CVA)
      addressDTO: {
        mainStreet: 'Boulevard Marítimo',
        secondaryStreet: 'General Roca',
        numbering: 2540,
      },

      // Datos para app-form-owner (CVA)
      ownerDTO: {
        firstName: 'Juan',
        surname: 'Pérez',
        email: 'juan.perez@test.com',
        numberPhone: 2235123456,
      },

      // Lista de Amenities (CVA)
      amenitiesList: [
        { amenityName: 'Piscina', isFeatured: true },
        { amenityName: 'Gimnasio', isFeatured: false },
        { amenityName: 'Cochera', isFeatured: true },
      ],

      // Lista de Imágenes (CVA) - Usamos una URL real de placeholder
      imageDTOList: [
        {
          url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
          isPrimary: true,
          position: 0,
          name: 'foto_living_mock.jpg', // <--- ¡FALTABA ESTO!
        },
        {
          url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
          isPrimary: false,
          position: 0,
          name: 'foto_cocina_mock.jpg' // <--- ¡FALTABA ESTO!
        },
      ],
    });

    console.log('✅ Formulario cargado con datos de prueba.');

    // LOG DE DEPURACIÓN SENIOR:
    Object.keys(this.form.controls).forEach((key) => {
      const controlErrors = this.form.get(key)?.errors;
      if (controlErrors != null) {
        console.error(`❌ Campo inválido: ${key}`, controlErrors);
      }
    });

    // Si el error está dentro de un CVA, revisa si el objeto que pasaste es null
    console.log('Estado del Formulario:', this.form.status); // Debería decir 'VALID'
  }

  // --- 3. Lógica de Submit Simplificada ---
  onSubmit() {
    if (this.form.invalid) {
      console.warn('Formulario inválido. Revisar campos marcados.');
      this.form.markAllAsTouched(); // Esto pinta de rojo TODOS los inputs, incluidos los hijos
      return;
    }

    // Preparar el objeto para el Backend
    // Mapeamos los valores planos del form a la estructura DTO compleja
    const formValue = this.form.value;

    const finalDTO: any = {
      id: this.isUpdate ? this.propertyUpdate.id : null,

      // Datos directos
      title: formValue.title,
      description: formValue.description,
      price: formValue.price,
      yearConstruction: formValue.yearConstruction,
      areaStructure: formValue.areaStructure,
      totalArea: formValue.totalArea,
      rooms: formValue.rooms,
      bathrooms: formValue.bathrooms,
      bedrooms: formValue.bedrooms,
      publicationDate: this.isUpdate ? this.propertyUpdate.publicationDate : new Date(), // Fecha actual si es nuevo

      // Objetos anidados (Selects convertidos a DTO)
      propertyTypeDTO: { typeName: formValue.propertyTypeName },
      operationTypeDTO: { operationName: formValue.operationTypeName },

      // Sub-componentes (Ya vienen como objetos gracias a CVA)
      zoneDTO: formValue.zoneDTO,
      addressDTO: formValue.addressDTO,
      ownerDTO: formValue.ownerDTO,

      // Listas
      amenitiesList: formValue.amenitiesList,
      imageDTOList: formValue.imageDTOList,
    };

    console.log('🚀 Payload listo para enviar:', finalDTO);

    // Llamada al servicio
    const request = this.isUpdate ? this.service.put(finalDTO) : this.service.post(finalDTO);

    request?.subscribe({
      next: (response) => {
        console.log('Éxito:', response);
        this.router.navigate(['admin/property-list']);
      },
      error: (err) => console.error('Error al guardar:', err),
    });
  }

  // --- 4. Edición (Patch Value) ---
  patchValuesForEdit() {
    if (!this.propertyUpdate) return;

    // Aquí "aplanamos" lo necesario y pasamos los objetos complejos tal cual
    this.form.patchValue({
      id: this.propertyUpdate.id,
      title: this.propertyUpdate.title,
      description: this.propertyUpdate.description,
      price: this.propertyUpdate.price,

      yearConstruction: this.propertyUpdate.yearConstruction,
      areaStructure: this.propertyUpdate.areaStructure,
      totalArea: this.propertyUpdate.totalArea,
      rooms: this.propertyUpdate.rooms,
      bathrooms: this.propertyUpdate.bathrooms,
      bedrooms: this.propertyUpdate.bedrooms,

      // Selects: Extraemos el string del DTO
      propertyTypeName: this.propertyUpdate.propertyTypeDTO?.typeName,
      operationTypeName: this.propertyUpdate.operationTypeDTO?.operationName,

      // Componentes Complejos: Pasamos el DTO entero
      // Los componentes hijos CVA sabrán leer este objeto en su método `writeValue`
      zoneDTO: this.propertyUpdate.zoneDTO,
      addressDTO: this.propertyUpdate.addressDTO,
      ownerDTO: this.propertyUpdate.ownerDTO,

      amenitiesList: this.propertyUpdate.amenitiesList,
      imageDTOList: this.propertyUpdate.imageDTOList,
    });
  }

  // Botón de Cancelar
  onCancel() {
    this.router.navigate(['admin/property-list']); // O volver atrás
  }
}
