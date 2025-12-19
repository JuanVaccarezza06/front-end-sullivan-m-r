import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import Amenity from '../../models/property/complements/Amenity';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AmenityService } from '../../services/propertyServices/amenity/amenity-service';
import { PropertyService } from '../../services/propertyServices/property/property-service';

@Component({
  selector: 'app-configuration-filter',
  standalone: true, // Asumo que es standalone por tu código anterior
  imports: [ReactiveFormsModule],
  templateUrl: './configuration-filter.html',
  styleUrl: './configuration-filter.css'
})
export class ConfigurationFilter implements OnInit, OnChanges {

  form!: FormGroup;

  // --- CAMBIO IMPORTANTE: Ahora son Inputs ---
  @Input() amenitiesArray: Amenity[] = [];
  @Input() amenitiesArrayFeatured: Amenity[] = [];
  
  // Array local para manejar los cambios que se enviarán al backend
  featured: Amenity[] = [];

  amenityFound!: Amenity;

  // Control variables
  isAmenitySearch: boolean = false;
  isAmenityNotCoincidence: boolean = false;

  errorMessage: string = '';
  errorSignal: boolean = false;

  // Eliminé el Input 'amenities' que no estabas usando y el Output que tampoco parecía conectarse
  // Si los necesitas, avísame, pero para este caso sobran.

  constructor(
    private amenityService: AmenityService,
    private propertyService: PropertyService, // Si no lo usas aquí, podrías borrarlo
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      controlToSearchAmenity: ['', [Validators.required]]
    });
    console.log("ConfigurationFilter inicializado");
  }

  // --- NUEVO: Detecta cuando el padre envía los datos ---
  ngOnChanges(changes: SimpleChanges): void {
    // Si cambian los amenities destacados desde el padre, inicializamos nuestro array local 'featured'
    if (changes['amenitiesArrayFeatured'] && this.amenitiesArrayFeatured) {
      // Hacemos una copia para empezar a trabajar
      this.featured = [...this.amenitiesArrayFeatured];
      console.log("Datos recibidos en el hijo. Featured inicializados:", this.featured);
    }
  }

  findAmenityByName() {
    console.log("Estoy en findAmenityByName");
    const amenityName = this.form.get('controlToSearchAmenity')?.value;
    
    if (amenityName) {
      this.amenityService.getAmenityByName(amenityName).subscribe({
        next: (data) => {
          this.amenityFound = data;
          this.isAmenitySearch = true;
          this.isAmenityNotCoincidence = false; // Resetear error si hubo antes
        },
        error: (e) => {
          this.isAmenityNotCoincidence = true;
          this.errorMessage = 'No existen coincidencias';
          this.errorSignal = true;
          setTimeout(() => {
            this.clearSearch(); // Opcional: si quieres borrar la búsqueda automática
            this.errorSignal = false;
          }, 3000);
        }
      });
    } else {
      console.log("The amenity name from the input is undefined");
    }
  }

  clearSearch() {
    console.log("Estoy en clearSearch");
    // Reset del control específico en lugar de crear uno nuevo (mejor práctica)
    this.form.get('controlToSearchAmenity')?.reset();
    this.isAmenityNotCoincidence = false;
    this.isAmenitySearch = false;
    this.amenityFound = {} as Amenity; // Limpiar objeto encontrado
  }

  deleteAmenity(amenity: Amenity) {
    if (!amenity) return;
    
    this.amenityService.delete(amenity.amenityName).subscribe({
      next: (data) => {
        console.log("Se eliminó correctamente.");
        // Opcional: Emitir evento al padre para recargar la lista
        // this.refreshRequest.emit(); 
      }, 
      error: (e) => {
        // Manejo de error seguro
        const errorMsg = e.error?.message || e.error || '';
        if (typeof errorMsg === 'string' && errorMsg.includes("DataIntegrityViolationException")) {
             console.log(errorMsg);
        }
        
        this.errorMessage = 'No se puede eliminar una amenity que está siendo utilizada por una propiedad';
        this.errorSignal = true;
      }
    });

    setTimeout(() => {
      this.errorSignal = false;
    }, 5000);
  }

  addIntoFeaturedArray(item: Amenity, event: Event): void {
    console.log("Estoy en addIntoFeaturedArray");

    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;
    
    // Actualizamos visualmente el objeto (referencia)
    item.isFeatured = isChecked;

    // Lógica para manejar el array 'featured' que se enviará al backend
    const index = this.featured.findIndex(
      (existingItem) => existingItem.amenityName === item.amenityName
    );

    if (isChecked) {
        // Si se marca y no está, lo agregamos
        if (index === -1) {
            this.featured.push(item);
        }
    } else {
        // Si se desmarca y está, lo sacamos (si tu lógica de backend espera solo los marcados)
        // O si tu backend espera el objeto con isFeatured=false, actualizamos:
        if (index !== -1) {
             this.featured[index] = item; 
             // O si prefieres sacarlo del array: this.featured.splice(index, 1);
             // Depende de cómo funcione tu 'updateFeatures' en el backend.
        }
    }

    console.log("Featured Array actual:", this.featured);
  }
}