import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-owner',
  imports: [ReactiveFormsModule],
  templateUrl: './form-owner.html',
  styleUrl: './form-owner.css'
})
export class FormOwner {

  @Input() group!: FormGroup;


}
