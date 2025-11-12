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

  // This variable is a signals catch, when the signal 
  // is done form the father, this input, catch him
  @Input() signalUpdateControls!: number;

  @Output() zoneControlsUpdated = new EventEmitter<boolean>();

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
    if (changes['signalUpdateControls']) {

      // 2. Opcional: Solo ejecutamos si el valor es mayor a 0 (es decir, ya se hizo un submit)
      // O solo ejecutamos si NO es la primera vez que se inicializa.
      if (!changes['signalUpdateControls'].firstChange) {
        console.log("ME SETEE!")
        this.setOthersValues();
      }
    }
  }

  setOthersValues() {

    if (!this.addZone) {


      let finalZone = this.zoneArray.find((value) => value.zoneName === this.group.get('zone')?.value) as ZoneDTO
      this.group.get('city')?.setValue(finalZone.cityDTO.cityName)
      this.group.get('province')?.setValue(finalZone.cityDTO.provinceDTO.provinceName)
      this.group.get('country')?.setValue(finalZone.cityDTO.provinceDTO.countryDTO.countryName)
      console.log("ESTE ES EL FINAL ")

      this.zoneControlsUpdated.emit(true);

    } else this.zoneControlsUpdated.emit(true);
    

  }

}
