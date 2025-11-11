import { Component, Input, OnInit } from '@angular/core';
import ZoneDTO from '../../../../models/property/geography/Zone';
import { PropertyService } from '../../../../services/propertyServices/property/property-service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-zone',
  imports: [ReactiveFormsModule],
  templateUrl: './form-zone.html',
  styleUrl: './form-zone.css'
})
export class FormZone implements OnInit {

  zoneArray!: ZoneDTO[]

  addZone: boolean = false

  @Input() group!: FormGroup;

  constructor(
    private service : PropertyService
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

}
