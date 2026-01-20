import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard-service/dashboard.service';
import { Inquiry, Metric, TopProperty } from '../../../core/models/dashboard.interfaces';

@Component({
  selector: 'app-dashboard-page',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage implements OnInit {
  private dashboardService = inject(DashboardService);

  // Estado reactivo con Signals
  metrics = signal<Metric[]>([]);
  topProperties = signal<TopProperty[]>([]);
  inquiries = signal<Inquiry[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data); // Debug
        this.metrics.set(data.metrics);
        this.topProperties.set(data.topProperties);
        this.inquiries.set(data.inquiries);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error conectando al backend:', err);
        this.isLoading.set(false);
      },
    });
  }

  // --- MÉTODOS DE AYUDA PARA LA VISTA (Reemplazan a ngClass) ---

  // 1. Para el color del texto (+12% vs -5%)
  getTrendColorClass(direction: string): string {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-slate-500'; // neutral
    }
  }

  // 2. Para el icono de la flecha
  getTrendIconClass(direction: string): string {
    switch (direction) {
      case 'up':
        return 'pi-arrow-up';
      case 'down':
        return 'pi-arrow-down';
      default:
        return 'pi-minus';
    }
  }

  // Lógica de ICONOS (Basada en KEY, no en Title)
  getIconClass(key: string): string {
    const base = 'pi text-2xl ';

    switch (key) {
      case 'PROPERTIES':
        return base + 'pi-home text-blue-600';
      case 'INQUIRIES':
        return base + 'pi-inbox text-purple-600';
      case 'VIEWS':
        return base + 'pi-eye text-teal-600';
      case 'USERS':
        return base + 'pi-users text-orange-600';
      default:
        return base + 'pi-info-circle text-gray-600';
    }
  }

  // Lógica de COLORES DE FONDO (Basada en KEY)
  getBgClass(key: string): string {
    switch (key) {
      case 'PROPERTIES':
        return 'bg-blue-100';
      case 'INQUIRIES':
        return 'bg-purple-100';
      case 'VIEWS':
        return 'bg-teal-100';
      case 'USERS':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  }

  // Agrega esto en tu clase
  getAvatarColor(name: string): string {
    const colors = [
      'bg-red-100 text-red-600',
      'bg-orange-100 text-orange-600',
      'bg-amber-100 text-amber-600',
      'bg-green-100 text-green-600',
      'bg-teal-100 text-teal-600',
      'bg-blue-100 text-blue-600',
      'bg-indigo-100 text-indigo-600',
      'bg-violet-100 text-violet-600',
      'bg-pink-100 text-pink-600',
    ];
    // Truco simple para que el mismo nombre siempre tenga el mismo color
    const index = name.length % colors.length;
    return colors[index];
  }

  // ... dentro de tu clase HomeComponent

  // Método nuevo para reemplazar al ngClass del fondo
  getTrendBgClass(direction: string): string {
    switch (direction) {
      case 'up':
        return 'bg-green-100';
      case 'down':
        return 'bg-red-100';
      default:
        return 'bg-slate-100';
    }
  }
}
