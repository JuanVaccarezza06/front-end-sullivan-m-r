import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { InquiryModel } from '../../../core/models/InquiryModel';
import { InquiryService } from '../../../core/services/inquiry-service/inquiry-service';
import { HatoasPageResponse } from '../../../core/models/HatoasPageResponse';
import Property from '../../../core/models/properties/Property';
import { ImgBbService } from '../../../core/services/imgbb-service/img-bb-service';

@Component({
  selector: 'app-inquiry-list',
  imports: [DatePipe], // Zero CommonModule
  templateUrl: './inquiry-list.html',
  styleUrl: './inquiry-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InquiryList implements OnInit {
  private inquiryService = inject(InquiryService);
  private imgService = inject(ImgBbService);

  // --- SEÑALES ---
  inquiries = signal<InquiryModel[]>([]);

  imageNotFound: string = ""

  // Paginación
  currentPage = signal<number>(0);
  totalPages = signal<number>(0);
  totalElements = signal<number>(0);

  // Filtros
  searchTerm = signal<string>('');
  selectedStateFilter = signal<string>('ALL');

  // --- COMPUTED ---
  filteredInquiries = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const stateFilter = this.selectedStateFilter();

    return this.inquiries().filter((inquiry) => {
      const fullName = `${inquiry.user.firstName} ${inquiry.user.surname}`.toLowerCase();

      const matchesSearch =
        fullName.includes(term) ||
        inquiry.user.email.toLowerCase().includes(term) ||
        inquiry.propertyDTO.title.toLowerCase().includes(term);

      const matchesState = stateFilter === 'ALL' || inquiry.state.stateName === stateFilter;

      return matchesSearch && matchesState;
    });
  });

  // Helpers UI
  isFirstPage = computed(() => this.currentPage() === 0);
  isLastPage = computed(() => this.currentPage() >= this.totalPages() - 1);

  ngOnInit(): void {
    this.fetchInquiries();
    this.imageNotFound = this.imgService.getNotFound();
  }

  // --- LÓGICA DE DATOS ---

  fetchInquiries() {
    const page = this.currentPage();

    this.inquiryService.getAll(page).subscribe({
      next: (response: HatoasPageResponse<InquiryModel>) => {
        // Extracción agnóstica de HATEOAS
        const embeddedData = response._embedded ? Object.values(response._embedded)[0] : [];

        this.inquiries.set(embeddedData);
        this.totalPages.set(response.page.totalPages);
        this.totalElements.set(response.page.totalElements);
      },
      error: (err) => {
        console.error('Error fetching inquiries:', err);
        this.inquiries.set([]);
      },
    });
  }

  onPageChange(delta: number) {
    const newPage = this.currentPage() + delta;
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.currentPage.set(newPage);
      this.fetchInquiries();
    }
  }

  // --- EVENTOS NATIVOS (Reemplazo de ngModel) ---

  onSearch(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm.set(inputElement.value);
  }

  onStateFilterChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedStateFilter.set(selectElement.value);
  }

  // --- HELPERS VISUALES Y ACCIONES ---

  getStateBadgeClass(stateName: string): string {
    switch (stateName?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'contactado':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resuelto':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  // ESTE ES EL MÉTODO QUE USARÁ EL HTML DIRECTAMENTE
  getCoverImage(p: Property): string {
    const images = p.imageDTOList;

    // 1. Si no hay imágenes, devolvemos el placeholder
    if (!images || images.length === 0) {
      return this.imageNotFound;
    }

    // 2. Ordenamos visualmente por 'position' para asegurar consistencia (opcional pero recomendado)
    // Nota: slice() crea una copia para no mutar el array original en cada render
    const sortedImages = images.slice().sort((a, b) => a.position - b.position);

    // 3. Buscamos la que tenga isPrimary: true
    const primaryImg = sortedImages.find((img) => img.isPrimary);

    // 4. Si existe primary, devolvemos esa. Si no, la primera de la lista (posición 0)
    return primaryImg ? primaryImg.url : sortedImages[0].url;
  }

  viewInquiryDetails(inquiry: InquiryModel) {
    console.log('Ver', inquiry);
  }
  sendEmailToClient(email: string) {
    console.log('Email', email);
  }
  markAsContacted(inquiry: InquiryModel) {
    console.log('Contactado', inquiry);
  }
}
