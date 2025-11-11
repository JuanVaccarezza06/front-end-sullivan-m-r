import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-address',
  imports: [ReactiveFormsModule],
  templateUrl: './form-address.html',
  styleUrl: './form-address.css'
})
export class FormAddress {

  @Input() group!: FormGroup;

  constructor(
  ) { }

}
