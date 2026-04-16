import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status-card',
  standalone: true,
  template: `
    <div [class]="containerClasses()" role="status" aria-live="polite">
      <svg
        width="15"
        height="15"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
        [class]="iconClasses()"
      >
        @if (type() === 'success') {
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12.5l2.5 2.5L16 9.5" />
        } @else {
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        }
      </svg>

      <span>{{ message() }}</span>
    </div>
  `,
})
export class StatusCard {
  readonly message = input.required<string>();
  readonly type = input<'success' | 'error'>('success');

  readonly palette = computed(() => {
    if (this.type() === 'error') {
      return {
        container:
          'flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700',
        icon: 'text-red-600',
      };
    }

    return {
      container:
        'flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700',
      icon: 'text-emerald-600',
    };
  });

  readonly containerClasses = computed(() => this.palette().container);
  readonly iconClasses = computed(() => this.palette().icon);
}