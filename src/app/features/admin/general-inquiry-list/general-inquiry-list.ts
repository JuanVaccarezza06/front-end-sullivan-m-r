import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { GeneralInquiryService } from '../../../core/services/general-inquiry-service/general-inquiry-service';
import GeneralInquiry from '../../../core/models/GeneralInquiry';

@Component({
  selector: 'app-general-inquiry-list',
  imports: [ReactiveFormsModule],
  templateUrl: './general-inquiry-list.html',
  styleUrl: './general-inquiry-list.css'
})
export class GeneralInquiryList {
private readonly service = inject(GeneralInquiryService);

  // Signals para el estado
  inquiries = signal<GeneralInquiry[]>([]);
  totalElements = signal<number>(0);
  loading = signal<boolean>(false);

  // Filtros
  searchControl = new FormControl('');
  stateFilter = signal<string>('ALL');

  constructor() {
    // Efecto para escuchar cambios en el buscador (Reactive Forms -> Signal Logic)
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((term) => {
        this.loadInquiries(term || '', this.stateFilter());
      });

    // Carga inicial
    this.loadInquiries();
  }

  loadInquiries(term: string = '', state: string = 'ALL') {
    this.loading.set(true);
    // Asumimos paginación página 0, tamaño 10 por defecto para este ejemplo visual
    this.service.search(term, state, 0, 10).subscribe({
      next: (response) => {
        this.inquiries.set(response.content);
        this.totalElements.set(response.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // --- Lógica de UI (Reemplazo de ngClass) ---

  /**
   * Retorna las clases de Tailwind completas basadas en el estado.
   * Angular 17+ permite bindear strings completos a [class].
   */
  getStateBadgeStyles(stateName: string): string {
    const base = 'px-2.5 py-0.5 rounded-full text-xs font-medium border ';
    
    switch (stateName.toUpperCase()) {
      case 'NUEVO':
        return base + 'bg-blue-50 text-blue-700 border-blue-100';
      case 'LEÍDO':
        return base + 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'RESPONDIDO':
        return base + 'bg-green-50 text-green-700 border-green-100';
      default:
        return base + 'bg-gray-50 text-gray-600 border-gray-100';
    }
  }

  // Helpers para formateo rápido de fecha (o usa un pipe custom standalone si prefieres)
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es-ES', { 
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' 
    });
  }
}
