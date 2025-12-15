import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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
