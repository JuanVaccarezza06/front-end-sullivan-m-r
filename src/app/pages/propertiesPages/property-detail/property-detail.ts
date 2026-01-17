import { Component, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, MapAdvancedMarker, MapInfoWindow } from '@angular/google-maps';
import Property from '../../../models/property/Property';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PropertyService } from '../../../services/propertyServices/property/property-service';
import { InquiryService } from '../../../services/inquiryService/inquiry-service';
import { InquiryModel } from '../../../models/contact/InquiryModel';
import { environment } from '../../../../environments/environment.development';

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

  center: google.maps.LatLngLiteral = { lat: -38.00347172577913, lng: -57.54663502109604 };
  zoom = 12;

  mapId = environment.mapId;

  // 2. Referencia a la ventana del HTML para controlarla desde código
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  // 3. Variable auxiliar para guardar qué propiedad se clickeó
  infoWindowData: Property | null = null;

  // Pattern Regex (Igual que en Contact.ts)
  private namePattern = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/;
  private phonePattern = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private fb: FormBuilder,
    private inquiryService: InquiryService
  ) {}

  ngOnInit(): void {
    // 1. Iniciamos el formulario (solo una vez)
    this.formInitializer();

    // 2. Nos SUSCRIBIMOS a los cambios de la URL.
    // Esto soluciona el problema de que no recargaba al hacer clic en el mapa.
    this.route.paramMap.subscribe((params) => {
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
    this.choiceMainImage(this.propertySelected);
    this.center = { lat: this.propertySelected.latitude, lng: this.propertySelected.longitude };

    if (this.infoWindow) this.infoWindow.close();

    this.propertyService.getAround(this.propertySelected.id).subscribe({
      next: (data: Property[]) => {
        this.properties = data;
        this.properties.forEach((value) => this.choiceMainImage(value));
      },
      error: (err) => {
        console.error('Error al cargar propiedades cercanas:', err);
        // Opcional: Podrías vaciar la lista si falla
        this.properties = [];
      },
    });

    this.propertyService.registerView(prop.id).subscribe({
      next: (data) => console.log("View registered")
    });
  }

  cargarMapaSeguro() {
    // 1. Preguntamos: ¿Ya existe el script en la página?
    if (document.getElementById('google-map-script')) {
      return; // Si ya está, no hacemos nada.
    }

    // 2. Si no está, lo creamos
    const script = document.createElement('script');
    script.id = 'google-map-script';

    // 3. Le ponemos tu CLAVE SECRETA del environment
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    // 4. Lo pegamos en el documento
    document.body.appendChild(script);
  }

  openInfoWindow(marker: MapAdvancedMarker, property: Property) {
    console.log('Click en propiedad ID:', property.id); // ¿Cambia el ID o es siempre el mismo?
    console.log('Imagen que debería mostrar:', property.mainImage);

    this.infoWindowData = property;
    this.infoWindow.open(marker);
  }

  onSumbit() {
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

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    // Construcción del DTO
    let result = {
      date: formattedDate,
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

  choiceMainImage(p: Property) {
    if (!p.imageDTOList || p.imageDTOList.length == 0) p.mainImage = this.imageNotFound;
    // If the image array is null or empty, we load the not found image in the cards
    else if (!p.imageDTOList.find((img) => img.name.includes('Portada')))
      p.mainImage = p.imageDTOList[0].url;
    // If the image array don't has any image with 'portada' name, load any image
    else p.mainImage = p.imageDTOList.find((img) => img.name.includes('Portada'))?.url; // If the image array has the 'portada' image, it returs
  }
}
