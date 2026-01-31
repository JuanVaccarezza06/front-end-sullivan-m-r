import { Component, forwardRef, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { ImageItem } from '../../../../core/models/ImageItem';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-input-images',
  imports: [ReactiveFormsModule, DragDropModule],
  templateUrl: './input-images.html',
  styleUrl: './input-images.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputImages),
      multi: true,
    },
    // --- 2. Proveedor de Validación ---
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InputImages),
      multi: true,
    },
  ],
})
export class InputImages implements ControlValueAccessor, Validator, OnDestroy {
  images: ImageItem[] = [];

  readonly MIN_IMAGES = 3;
  readonly MAX_IMAGES = 20;

  onChange: any = () => {};
  onTouch: any = () => {};

  // --- 1. VALIDATOR ---
  validate(control: AbstractControl): ValidationErrors | null {
    const total = this.images.length;
    const errors: any = {};

    if (total < this.MIN_IMAGES) {
      errors.minImages = { required: this.MIN_IMAGES, actual: total };
    }
    const hasPrimary = this.images.some((img) => img.isPrimary);
    if (total > 0 && !hasPrimary) {
      errors.noPrimary = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  // --- 2. INPUT FILE (Click) ---
  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) this.processFiles(files);
    event.target.value = '';
  }

  // --- 3. LÓGICA DE PROCESAMIENTO ---
  private processFiles(files: FileList) {
    let hasChanges = false;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check duplicados
      const isDuplicate = this.images.some((existing) => {
        if (existing.file) {
          return (
            existing.file.name === file.name &&
            existing.file.size === file.size &&
            existing.file.lastModified === file.lastModified
          );
        }
        return false;
      });

      if (isDuplicate) continue;
      if (!file.type.startsWith('image/')) continue;

      const newItem: ImageItem = {
        url: URL.createObjectURL(file),
        file: file,
        isPrimary: this.images.length === 0,
        position: this.images.length,
        name: file.name,
      };

      this.images.push(newItem);
      hasChanges = true;
    }

    if (hasChanges) this.updateModel();
  }

  // --- 4. MÉTODOS RECUPERADOS (Solución a tus errores) ---

  /** * Maneja el evento cuando arrastras archivos SOBRE la zona
   * Necesario para prevenir el comportamiento default del navegador
   */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Maneja el evento cuando SUELTAS archivos del escritorio
   * (Diferente al 'drop' de reordenar del CDK)
   */
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFiles(files);
    }
  }

  /**
   * Botón de borrar todo
   */
  clearAllImages() {
    this.images = [];
    this.updateModel();
  }

  // --- 5. MÉTODOS DE GESTIÓN (Borrar uno, Portada, Reordenar CDK) ---

  removeImage(index: number) {
    const wasPrimary = this.images[index].isPrimary;
    this.images.splice(index, 1);
    if (wasPrimary && this.images.length > 0) this.images[0].isPrimary = true;
    this.reorderIndices();
    this.updateModel();
  }

  setPrimary(index: number, event: Event) {
    event.stopPropagation();
    this.images.forEach((img, i) => (img.isPrimary = i === index));
    this.updateModel();
  }

  // Este es el drop del CDK (Reordenamiento visual)
  drop(event: CdkDragDrop<ImageItem[]>) {
    moveItemInArray(this.images, event.previousIndex, event.currentIndex);
    this.reorderIndices();
    this.updateModel();
  }

  reorderIndices() {
    this.images.forEach((img, index) => (img.position = index));
  }

  // --- 6. CVA IMPL ---
  private updateModel() {
    this.onChange(this.images);
    this.onTouch();
  }

  writeValue(obj: any): void {
    this.images = obj || [];
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  ngOnDestroy() {
    this.images.forEach((img) => {
      if (img.url.startsWith('blob:')) URL.revokeObjectURL(img.url);
    });
  }
}
