import { Component, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, MapAdvancedMarker, MapInfoWindow } from '@angular/google-maps';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../../../environments/environment.development';
import { InquiryModel } from '../../../../../core/models/InquiryModel';
import Property from '../../../../../core/models/properties/Property';
import { InquiryService } from '../../../../../core/services/inquiry-service/inquiry-service';
import { PropertyService } from '../../../../../core/services/property-service/property-service';

@Component({
  selector: 'app-property-detail',
  imports: [RouterLink, ReactiveFormsModule, GoogleMap, MapAdvancedMarker, MapInfoWindow],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.css',
})
export class PropertyDetail implements OnInit {
  form!: FormGroup;

  lastPage!: number;
  pageSelected!: number;
  properties: Property[] = [];
  propertySelected!: Property;
  numberOfPropertiesLoadInArray!: number;

  imageNotFound!: string;

  // 1. NUEVAS VARIABLES DE ESTADO
  currentImageIndex: number = 0;

  center: google.maps.LatLngLiteral = { lat: -38.00347172577913, lng: -57.54663502109604 };
  zoom = 12;

  mapId = environment.mapId;

  // 2. Referencia a la ventana del HTML para controlarla desde código
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  // 3. Variable auxiliar para guardar qué propiedad se clickeó
  infoWindowData: Property | null = null;

  infoWindowImage: string = '';
  activeImageUrl: string = '';
  showNavigation: boolean = false;

  // Pattern Regex (Igual que en Contact.ts)
  private namePattern = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/;
  private phonePattern = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private fb: FormBuilder,
    private inquiryService: InquiryService,
  ) {}

  ngOnInit(): void {
    // 1. Iniciamos el formulario (solo una vez)
    this.formInitializer();

    // 2. Nos SUSCRIBIMOS a los cambios de la URL.
    // Esto soluciona el problema de que no recargaba al hacer clic en el mapa.
    this.route.paramMap.subscribe((params) => {
      console.log('log');

      const idString = params.get('id');

      if (idString) {
        const id = Number(idString);

        // Intentamos leer el estado (si viene del Home con datos)
        // Usamos history.state, que atrapa el "extras.state" enviado por el Router
        const state = window.history.state as { propertyData: Property };

        // VALIDACIÓN CLAVE:
        // Verificamos si existe state Y si el ID del state coincide con la URL actual.
        // (Esto evita que uses datos viejos si navegas de la Propiedad A a la B)
        if (state && state.propertyData && state.propertyData.id === id) {
          this.initProperty(state.propertyData);
        } else {
          // Si no hay state (F5 o clic en enlace "Ver detalle" del mapa), vamos a la API
          this.loadPropertyFromApi(id);
        }
      } else {
        console.error('Route id empty');
      }
    });

    this.cargarMapaSeguro();
  }

  formInitializer() {
    console.log('log');

    this.form = this.fb.group({
      // CAMBIO: Dividido en firstName y surname con validadores de Contact.ts
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(this.namePattern),
        ],
      ],
      surname: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(this.namePattern),
        ],
      ],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      numberPhone: [
        '',
        [
          Validators.required,
          Validators.pattern(this.phonePattern), // Usando el patrón estricto
        ],
      ],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      state: ['PENDIENTE', [Validators.required]],
      conditions: [false, [Validators.requiredTrue]], // Cambié a false default y requiredTrue
    });
  }

  // Extraje la llamada a la API a un método pequeño para mantener limpio el ngOnInit
  loadPropertyFromApi(id: number) {
    console.log('log');

    this.propertyService.getById(id).subscribe({
      next: (prop) => {
        this.initProperty(prop);
      },
      error: () => this.router.navigate(['properties']),
    });
  }

  // Método auxiliar para no repetir código
  initProperty(prop: Property) {
    this.propertySelected = prop;

    // A. LÓGICA DEL CARRUSEL
    if (this.propertySelected.imageDTOList && this.propertySelected.imageDTOList.length > 0) {
      this.propertySelected.imageDTOList.sort((a, b) => a.position - b.position);

      const primaryIndex = this.propertySelected.imageDTOList.findIndex((img) => img.isPrimary);
      this.currentImageIndex = primaryIndex !== -1 ? primaryIndex : 0;

      // 2. CALCULAMOS SI DEBE HABER NAVEGACIÓN (Una sola vez)
      this.showNavigation = this.propertySelected.imageDTOList.length > 1;
    } else {
      this.currentImageIndex = 0;
      // Si no hay imágenes, no hay navegación
      this.showNavigation = false;
    }

    // Actualizamos la imagen inicial
    this.updateGalleryImage();

    // B. LÓGICA DEL MAPA
    this.center = { lat: this.propertySelected.latitude, lng: this.propertySelected.longitude };
    if (this.infoWindow) this.infoWindow.close();

    // C. CARGA DE VECINOS
    this.propertyService.getAround(this.propertySelected.id).subscribe({
      next: (data: Property[]) => {
        // Guardamos la data cruda. El HTML se encargará de buscar la imagen con getCoverImage
        this.properties = data;
      },
      error: (err) => {
        console.error('Error al cargar propiedades cercanas:', err);
        this.properties = [];
      },
    });

    this.propertyService.registerView(prop.id).subscribe({
      next: () => console.log('View registered'),
    });
  }

  private updateGalleryImage() {
    const images = this.propertySelected?.imageDTOList;

    // 1. Validación básica
    if (!images || images.length === 0) {
      this.activeImageUrl = this.imageNotFound || 'assets/images/placeholder-property.jpg';
      return;
    }

    // 2. Asignamos la imagen actual
    this.activeImageUrl = images[this.currentImageIndex].url;

    // 3. PRECARGA INTELIGENTE (Solo vecinos)
    // Calculamos el índice del siguiente y del anterior
    const nextIndex = (this.currentImageIndex + 1) % images.length;
    const prevIndex = (this.currentImageIndex - 1 + images.length) % images.length;

    // Precargamos SOLO esas dos imágenes
    this.preloadSingleImage(images[nextIndex].url);
    this.preloadSingleImage(images[prevIndex].url);
  }

  // Pequeño helper para descargar una sola url
  private preloadSingleImage(url: string) {
    const img = new Image();
    img.src = url;
  }

  // 3. MÉTODOS DE NAVEGACIÓN (Para el HTML)

  // Devuelve la URL actual o la imagen de error si no hay fotos
  get currentImageUrl(): string {
    console.log('current image');

    const images = this.propertySelected?.imageDTOList;
    if (!images || images.length === 0) {
      return this.imageNotFound || 'assets/images/placeholder-property.jpg'; // Tu fallback
    }
    return images[this.currentImageIndex].url;
  }

  // 2. Para las Propiedades del Mapa (Busca isPrimary dinámicamente)
  getCoverImage(p: Property): string {
    console.log('get cover image');
    if (!p.imageDTOList || p.imageDTOList.length === 0) {
      return this.imageNotFound || 'assets/images/placeholder.jpg';
    }
    // Busca la que sea isPrimary, sino la primera (posición 0)
    const primary = p.imageDTOList.find((img) => img.isPrimary);
    return primary ? primary.url : p.imageDTOList[0].url;
  }

  // 5. ACTUALIZAMOS LOS BOTONES NEXT / PREV
  nextImage(event?: Event) {
    console.log('log');

    if (event) event.stopPropagation();
    const length = this.propertySelected.imageDTOList.length;
    this.currentImageIndex = (this.currentImageIndex + 1) % length;

    // Al cambiar el índice, actualizamos la variable
    this.updateGalleryImage();
  }

  prevImage(event?: Event) {
    console.log('log');

    if (event) event.stopPropagation();
    const length = this.propertySelected.imageDTOList.length;
    this.currentImageIndex = (this.currentImageIndex - 1 + length) % length;

    // Al cambiar el índice, actualizamos la variable
    this.updateGalleryImage();
  }

  cargarMapaSeguro() {
    console.log('log');

    if (document.getElementById('google-map-script')) return;
    const script = document.createElement('script');
    script.id = 'google-map-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }

  openInfoWindow(marker: MapAdvancedMarker, property: Property) {
    // 1. Primero cerramos cualquier ventana abierta (opcional, pero recomendado)
    if (this.infoWindow) {
      this.infoWindow.close();
    }

    // 2. IMPORTANTE: Reseteamos la data a null momentáneamente.
    // Esto hace que el @if (infoWindowData) del HTML elimine el DOM viejo.
    this.infoWindowData = null;

    // 3. Usamos un timeout mínimo (0ms) para permitir que Angular detecte el cambio
    // y destruya el HTML anterior antes de crear el nuevo.
    setTimeout(() => {
      this.infoWindowData = property;
      this.infoWindowImage = this.getCoverImage(property);

      // Abrimos la ventana ahora que la data es nueva y el DOM se regenerará
      if (this.infoWindow) {
        this.infoWindow.open(marker);
      }
    }, 0);
  }

  onSumbit() {
    console.log('log');

    // CAMBIO: Validación inicial igual que en Contact.ts
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Extracción y sanitización de valores
    const rawFirstName = this.form.get('firstName')?.value.trim();
    const rawSurname = this.form.get('surname')?.value.trim();
    const rawEmail = this.form.get('email')?.value.trim().toLowerCase();
    const rawPhone = this.form.get('numberPhone')?.value.trim();
    const rawDesc = this.form.get('description')?.value.trim();

    // Construcción del DTO
    let result = {
      description: rawDesc,
      state: this.form.value.state,
      user: {
        firstName: rawFirstName, // Asignación directa
        surname: rawSurname, // Asignación directa
        email: rawEmail,
        numberPhone: rawPhone,
      },
      propertyDTO: this.propertySelected,
    } as InquiryModel;

    this.inquiryService.post(result).subscribe({
      next: (data) => {
        console.log(data);
        // Opcional: Resetear formulario o mostrar éxito
        this.form.reset({ state: 'PENDIENTE' });
      },
      error: (e) => console.log(e),
    });
  }

  choiceMainImage(p: Property): string {
    console.log('log');

    const images = p.imageDTOList;

    // 1. Caso: No hay imágenes
    if (!images || images.length === 0) {
      return this.imageNotFound;
    }

    // 2. Caso: Buscar la imagen marcada como primaria (isPrimary: true)
    const primaryImg = images.find((img) => img.isPrimary);
    if (primaryImg) {
      return primaryImg.url;
    }

    // 3. Caso: No hay ninguna marcada como primaria, usamos la primera (fallback)
    return images[0].url;
  }
}
