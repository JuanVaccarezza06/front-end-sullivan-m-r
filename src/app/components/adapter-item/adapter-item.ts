import { Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TableConfiguration } from '../table-configuration/table-configuration';
import { ConfigurationType } from '../../models/property/complements/ConfigurationType';
import { GenericItem } from '../../models/property/complements/GenericItem';
import { ItemService } from '../../services/propertyServices/ItemService/item-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import PropertiesFilter from '../../models/property/request-response/PropertiesFilter';
import ZoneDTO from '../../models/property/geography/Zone';
import Amenity from '../../models/property/complements/Amenity';

@Component({
  selector: 'app-adapter-item',
  imports: [TableConfiguration, ReactiveFormsModule],
  templateUrl: './adapter-item.html',
  styleUrl: './adapter-item.css'
})
export class AdapterItem implements OnInit {
  // Referencia al hijo para acceder a featuredToUpdate        
  @ViewChild(TableConfiguration) childComponent!: TableConfiguration;

  form!: FormGroup

  items: GenericItem[] = [];
  itemFound!: GenericItem;
  configurationType: ConfigurationType = ConfigurationType.AMENITY;

  errorSignal!: boolean;
  errorMessage!: string;

  @Output() itemsUpdated = new EventEmitter<ConfigurationType>();
  @Output() itHadNotChanges = new EventEmitter<void>();
  @Output() filterRequested = new EventEmitter<PropertiesFilter>();

  constructor(
    private itemService: ItemService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {

    this.form = this.fb.group({
      controlToSearchItem: ['', [Validators.required]]
    });

    this.loadItems();

  }

  getConfigurationType() {
    return ConfigurationType;
  }

  changeConfigurationType(newConfigurationType: ConfigurationType) {
    if (newConfigurationType) {
      this.configurationType = newConfigurationType
    }
  }

  // Cambia entre Amenities y Zonas
  toggleConfigurationType(): void {
    // 1. Cambias el valor
    this.configurationType = (this.configurationType === ConfigurationType.AMENITY)
      ? ConfigurationType.ZONE
      : ConfigurationType.AMENITY;

    console.log("Cambié a:", this.configurationType);

    // 2. LLAMAS MANUALMENTE A LA CARGA
    this.loadItems();
  }

  loadItems(): void {
    // Reiniciamos la tabla cargando datos frescos de la BD
    this.itemService.getItems(this.configurationType).subscribe({
      next: (data) => {
        this.items = data;
        // Si el hijo existe, limpiamos su array de cambios pendientes
        if (this.childComponent) {
          this.childComponent.featuredToUpdate = [];
        }
      },
      error: (e) => console.error('Error cargando items', e)
    });
  }

  saveChanges(): void {
    console.log("Guardando configuración...");

    if (!this.childComponent) {
      console.error("El componente de tabla no está activo.");
      return;
    }

    const featuredToUpdate = this.childComponent.featuredToUpdate;

    if (featuredToUpdate.length === 0) {
      console.log("No hay cambios que guardar.")
      this.itHadNotChanges.emit();
      return;
    }

    this.itemService.updateFeatures(featuredToUpdate, this.configurationType).subscribe({
      next: (data) => {
        console.log("Update exitoso", data);

        // Avisamos al padre
        this.itemsUpdated.emit(this.configurationType);
      },
      error: (e) => console.error("Error al guardar", e)
    });

  }

  getItemsFeaturedLength() {
    return this.items.filter(value => value.isFeatured).length
  }

  findByName() {
    const name = this.form.get('controlToSearchItem')?.value; // Asegúrate que el control se llame así en tu HTML

    if (name) {
      this.itemService.findByName(name, this.configurationType).subscribe({
        next: (data: GenericItem) => {

          if (data) {
            // TRUCO: Metemos el único item encontrado en un array nuevo.
            // La tabla detectará el cambio y mostrará una sola fila.
            this.items = [data];

          } else this.showError("No hubo coincidencias")
        },
        error: (e) => {
          if (e.error.error == 'Not coincidence') {
            this.showError("No hubo coincidencias")
          } else {
            console.error(e);

            // Si falla, vaciamos la tabla para indicar que no hay resultados
            this.items = [];

            this.showError("Error al realizar la consulta")
          }
        }
      });
    }
  }

  clearSearch() {
    // Reset del control específico en lugar de crear uno nuevo (mejor práctica)
    this.form.get('controlToSearchItem')?.reset();
    this.loadItems()

  }

  // ... imports

  deleteItem(item: GenericItem) {
    if (!item) return;

    // Confirmación simple (opcional pero recomendada)
    if (!confirm(`¿Estás seguro de eliminar: ${item.itemName}?`)) return;

    // Usamos item.itemName (o item.id si prefieres) y el tipo actual
    this.itemService.delete(item.itemName, this.configurationType).subscribe({
      next: () => {
        console.log("Se eliminó correctamente.");

        // RECARGAMOS LA LISTA para que desaparezca de la tabla
        this.loadItems();

        // Limpiamos mensajes de error previos si los hubiera
        this.errorSignal = false;
      },
      error: (e) => {
        const errorMsg = e.error?.message || e.error || '';

        // Checkeo específico de DataIntegrityViolationException
        // A veces viene como string gigante o dentro de un objeto message
        if (JSON.stringify(e).includes("DataIntegrityViolationException") ||
          (typeof errorMsg === 'string' && errorMsg.includes("DataIntegrityViolationException"))) {

          console.warn("Intento de borrar registro en uso:", errorMsg);

          // Mensaje dinámico según lo que estemos borrando
          const tipoEntidad = this.configurationType === ConfigurationType.AMENITY ? 'una amenity' : 'una zona';
          this.showError(`No se puede eliminar ${tipoEntidad} que está siendo utilizada por una propiedad`)

        } else {
          // Otro tipo de error
          this.showError("Ocurrió un error al intentar eliminar el ítem.")
        }


      }
    });
  }

  showError(message: string) {
    this.errorMessage = message
    this.errorSignal = true;
    setTimeout(() => {
      this.errorSignal = false;
    }, 3000);
  }

  handleSeeItem(item: GenericItem) {
    console.log("Generando filtro rápido para:", item.itemName);

    // 1. Definimos la Zona Default Vacía (tal como lo tienes en tu onSubmit)
    const defaultZone: ZoneDTO = {
      zoneName: '',
      cityDTO: { cityName: '', provinceDTO: { provinceName: '', countryDTO: { countryName: '' } } },
      isFeatured: false
    };

    // 2. Inicializamos el filtro vacío
    const singleFilter: PropertiesFilter = {
      operationTypeDTO: { operationName: '' },
      propertyTypeDTO: { typeName: '' },
      minPrice: 0,
      maxPrice: 0,
      rooms: 0,
      zoneDTO: defaultZone, // Por defecto vacía
      amenityDTOList: []    // Por defecto vacía
    };

    // 3. Rellenamos SOLO lo que corresponde según el tipo
    if (item.type === ConfigurationType.AMENITY) {
      // Si es Amenity, la agregamos a la lista
      // (Hacemos cast a Amenity porque sabemos que originalData lo es)
      singleFilter.amenityDTOList = [item.originalData as Amenity];
    }
    else if (item.type === ConfigurationType.ZONE) {
      // Si es Zona, reemplazamos la zona vacía por esta
      singleFilter.zoneDTO = item.originalData as ZoneDTO;
    }

    // 4. Emitimos el filtro listo para usar
    this.filterRequested.emit(singleFilter);
  }

}