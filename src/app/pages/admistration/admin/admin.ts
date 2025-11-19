import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ImgBbService } from '../../../services/propertyServices/imgBB/img-bb-service';
import { finalize } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-admin',
  imports: [ReactiveFormsModule, RouterOutlet, Navbar],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {

  userDelete() {
    console.log("Se eliminaria un user...")
  }
}
