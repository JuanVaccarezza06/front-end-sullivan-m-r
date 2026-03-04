import { Component, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, MapAdvancedMarker, MapInfoWindow } from '@angular/google-maps';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../../../environments/environment.development';
import { InquiryModel } from '../../../../../core/models/InquiryModel';
import Property from '../../../../../core/models/properties/Property';
import { InquiryService } from '../../../../../core/services/inquiry-service/inquiry-service';
import { PropertyService } from '../../../../../core/services/property-service/property-service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-property-detail',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    GoogleMap,
    MapAdvancedMarker,
    MapInfoWindow,
    DecimalPipe,
  ],
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

// 1. REEMPLAZA TUS VARIABLES DE PINES POR ESTAS:
  isMapReady = false;
  mainPinContent: HTMLElement | null = null;
  bluePinsRecord: Record<number, HTMLElement> = {}; // <-- Usamos Record para mejor reactividad

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

  // 2. ACTUALIZA ESTE MÉTODO:
  onMapInitialized() {
    this.isMapReady = true;
    this.generatePins(); // Intentamos generar pines si los datos ya llegaron
  }

  // 3. AGREGA ESTE NUEVO MÉTODO MAESTRO:
 // 1. REEMPLAZA TU generatePins() POR ESTE:
  generatePins() {
    // Si el mapa no está cargado o aún no tenemos la propiedad principal, abortamos
    if (!this.isMapReady || !this.propertySelected) return;

    // BYPASS: Usamos nuestra propia función generadora de HTML nativo
    if (!this.mainPinContent) {
      // Pin rojo (o tu color corporativo #108a55) para la propiedad principal
      this.mainPinContent = this.createCustomHTMLPin('#EA4335'); 
    }

    if (this.properties && this.properties.length > 0) {
      const newBluePins: Record<number, HTMLElement> = {};
      
      for (const item of this.properties) {
        // Pin azul para los vecinos
        newBluePins[item.id] = this.createCustomHTMLPin('#4285F4'); 
      }
      
      // Forzamos la reactividad
      this.bluePinsRecord = newBluePins;
    }
  }

  // 2. AGREGA ESTA NUEVA FUNCIÓN AUXILIAR:
  private createCustomHTMLPin(color: string): HTMLElement {
    const div = document.createElement('div');
    
    // Dibujamos un SVG idéntico al de Google Maps, pero con nuestro color
    div.innerHTML = `
      <svg width="36" height="36" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" style="filter: drop-shadow(0px 3px 3px rgba(0,0,0,0.3)); cursor: pointer;">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3" fill="white"></circle>
      </svg>
    `;
    
    // Retornamos el elemento SVG listo para inyectarse en el mapa
    return div.firstElementChild as HTMLElement;
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
        this.properties = data;
        
        // ¡NUEVO! Generamos los pines ahora que tenemos la data
        this.generatePins(); 
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

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawFirstName = this.form.get('firstName')?.value.trim();
    const rawSurname = this.form.get('surname')?.value.trim();
    const rawEmail = this.form.get('email')?.value.trim().toLowerCase();
    const rawPhone = this.form.get('numberPhone')?.value.trim();
    const rawDesc = this.form.get('description')?.value.trim();

    // CONSTRUCCIÓN DEL DTO
    // No uses 'as InquiryModel' todavía para ver si TS se queja
    const result: InquiryModel = {
      // 1. ID y FECHA:
      // Como es un POST (Creación), el ID y createAt los genera el Backend.
      // Puedes mandarlos null o undefined (ajusta tu interfaz si es estricta)
      id: 0, // O null, el backend lo ignorará
      createAt: '', // El backend pone la fecha actual (@PrePersist)

      description: rawDesc,

      // 2. CORRECCIÓN CRÍTICA DEL ESTADO:
      // No leemos del form. Creamos el objeto State explícito.
      state: {
        stateName: 'PENDIENTE',
      },

      user: {
        firstName: rawFirstName,
        surname: rawSurname,
        email: rawEmail,
        numberPhone: rawPhone,
      },

      propertyDTO: this.propertySelected,
    };

    console.log('Enviando Payload:', result); // Debugging Senior

    this.inquiryService.post(result).subscribe({
      next: (data) => {
        console.log('Éxito:', data);
        // Resetear el form y dejar el estado (interno del form) listo por si acaso
        this.form.reset();
        // Aquí podrías mostrar una alerta de éxito (SweetAlert2 o Toastr)
      },
      error: (e) => {
        console.error('Error al enviar consulta:', e);
        // Manejar el error visualmente
      },
    });
  }

  choiceMainImage(p: Property): string {
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
