import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators'; // <--- Senior Tip: Import this
import { MotiveService } from '../../../core/services/motive-service/motive-service';
import { AuthService } from '../../../core/auth-service/auth-service';
import { ContactService } from '../../../core/services/contact-service/contact-service';
import { UserService } from '../../../core/services/user-service/user-service';
import MotiveDTO from '../../../core/models/MotiveDTO';

// Models & Services

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact implements OnInit {

  contactForm!: FormGroup; // Renamed to English for consistency

  // Store motives retrieved from  Backend
  motivesList: MotiveDTO[] = [];

  // Dependency Injection
  private fb = inject(FormBuilder);
  private motiveService = inject(MotiveService);
  private authService = inject(AuthService);
  private contactService = inject(ContactService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);

  // Regex Patterns
  private namePattern = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/;
  private phonePattern = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;

  ngOnInit(): void {
    this.initForm();

    this.loadMotives();
    this.autoFillUserData()
  }

  initForm(): void {
    this.contactForm = this.fb.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(this.namePattern)
      ]],
      surname: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(this.namePattern)
      ]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      numberPhone: ['', [Validators.required, Validators.pattern(this.phonePattern)]],
      motive: ['', [Validators.required]], // Selected value stores here
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      state: ['PENDIENTE']
    });
  }

  loadMotives(): void {
    this.motiveService.getAllMotives().subscribe({
      next: (data) => {
        this.motivesList = data;
        this.checkIncomingService();
      },
      error: (err) => {
        console.error('Error loading motives:', err);
      }
    });
  }

  private checkIncomingService(): void {
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      const subjectFromUrl = params['subject'];
      const msgFromUrl = params['msg'];

      if (subjectFromUrl) {
        const normalizedSubject = this.normalizeString(subjectFromUrl);

        const foundMotive = this.motivesList.find(m =>
          this.normalizeString(m.motiveName) === normalizedSubject
        );

        if (foundMotive) {

          this.contactForm.patchValue({
            motive: foundMotive.motiveName,
            description: msgFromUrl || ''
          });
        } else {
          console.warn('No match found for subject:', subjectFromUrl);
        }
      }
    });
  }

  private autoFillUserData(): void {
    if (this.authService.isLoggedIn()) {

      const username = this.authService.getUsername();

      if (username) {
        this.userService.getUserByUsername(username)
          .pipe(take(1))
          .subscribe({
            next: (userData) => {
              this.contactForm.patchValue({
                firstName: userData.firstName,
                surname: userData.surname,
                email: userData.email,
                numberPhone: userData.numberPhone
              });
            },
            error: (err) => {
              console.warn('No se pudieron cargar los datos del usuario', err);
            }
          });
      }
    }
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    // Extract raw values and sanitize
    const rawFirstName = this.contactForm.get('firstName')?.value.trim();
    const rawSurname = this.contactForm.get('surname')?.value.trim();
    const rawEmail = this.contactForm.get('email')?.value.trim().toLowerCase();
    const rawPhone = this.contactForm.get('numberPhone')?.value.trim();
    const rawDesc = this.contactForm.get('description')?.value.trim();
    const motive = this.contactForm.get('motive')?.value;

    // Construct DTO
    const generalInquiry = {
      date: new Date().toISOString().split('T')[0],
      description: rawDesc,
      stateDTO: 'PENDIENTE',
      userDTO: {
        firstName: rawFirstName,
        surname: rawSurname,
        email: rawEmail,
        numberPhone: rawPhone
      },
      motiveDTO: {
        motiveName: motive
      }
    };

    this.contactService.post(generalInquiry).subscribe({
      next: (data) => console.log(data),
      error: (e) => console.log(e)
    })

  }

  private normalizeString(str: string): string {
    return (str || '')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

}