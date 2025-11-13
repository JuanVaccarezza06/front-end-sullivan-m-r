import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import ZoneDTO from '../../../../models/property/geography/Zone';
import { PropertyService } from '../../../../services/propertyServices/property/property-service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-zone',
  imports: [ReactiveFormsModule],
  templateUrl: './form-zone.html',
  styleUrl: './form-zone.css'
})
export class FormZone implements OnInit, OnChanges {

  zoneArray!: ZoneDTO[]

  addZone: boolean = false

  @Input() group!: FormGroup;

  @Input() startSignal!: number;

  @Output() finishEvent = new EventEmitter<boolean>();

  constructor(
    private service: PropertyService
  ) { }

  ngOnInit(): void {
    this.loadZones()
  }

  loadZones() {
    this.service.getAvailableZones().subscribe({
      next: (data) => {
        this.zoneArray = data;
      },
      error: (e) => console.log(e)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {

    // 1. Verifica si el Input cambió
    if (changes['startSignal']) {

      // 2. Opcional: Solo ejecutamos si el valor es mayor a 0 (es decir, ya se hizo un submit)
      // O solo ejecutamos si NO es la primera vez que se inicializa.
      if (!changes['startSignal'].firstChange) {
        this.setOthersValues();
      }
    }
  }

  setOthersValues() {

    if (!this.addZone){ // if the add is about an existing zone

      let finalZone = this.zoneArray
        .find(
          (value) => value.zoneName == this.group.get('zone')?.value
        ) as ZoneDTO

      if (finalZone) {
        this.group.get('city')?.setValue(finalZone.cityDTO.cityName)
        this.group.get('province')?.setValue(finalZone.cityDTO.provinceDTO.provinceName)
        this.group.get('country')?.setValue(finalZone.cityDTO.provinceDTO.countryDTO.countryName)

      } else console.log("No se encontro la zona existente.")
    }
    
    this.finishEvent.emit(true);

  }
}
