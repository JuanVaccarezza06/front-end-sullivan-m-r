import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-images',
  imports: [ReactiveFormsModule],
  templateUrl: './input-images.html',
  styleUrl: './input-images.css',
})
export class InputImages {

  form! : FormGroup


}
