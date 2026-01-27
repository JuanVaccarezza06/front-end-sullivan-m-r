import { Component, forwardRef, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
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
  ],
})
export class InputImages implements ControlValueAccessor, OnDestroy {
  images: ImageItem[] = []; // Esta es la variable única de verdad

  onChange: any = () => {};
  onTouch: any = () => {};

  ngOnDestroy() {
    // Liberamos las URLs temporales para que no consuman RAM
    this.images.forEach((img) => {
      if (img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url);
      }
    });
  }

  // --- 1. MÉTODOS DE LA ZONA DE DROP DE ARCHIVOS ---

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    // Aquí podrías agregar una clase CSS para indicar que se puede soltar
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(files);
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      console.log(files)
      this.processFiles(files);
    }
    // Reset del input para permitir seleccionar el mismo archivo si se borra
    event.target.value = '';
  }

  private processFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      console.log(file.name)
      console.log("file.name")


      // Validación simple de tipo
      if (!file.type.startsWith('image/')) continue;
      const newItem: ImageItem = {
        url: URL.createObjectURL(file),
        file: file,
        isPrimary: this.images.length === 0,
        position: this.images.length,
        // --- AQUÍ ESTÁ LA SOLUCIÓN ---
        // Asignamos el nombre del archivo al campo 'name'
        name: file.name,
        // -----------------------------
      };
      this.images.push(newItem);
    }
    this.updateModel();
  }

  // --- 2. LÓGICA DE ORDEN (Drag & Drop de Angular CDK) ---

  drop(event: CdkDragDrop<ImageItem[]>) {
    moveItemInArray(this.images, event.previousIndex, event.currentIndex);
    this.reorderIndices();
    this.updateModel();
  }

  reorderIndices() {
    this.images.forEach((img, index) => (img.position = index));
  }

  // --- 3. LÓGICA DE PORTADA ---

  setPrimary(index: number, event: Event) {
    event.stopPropagation(); // Evitar triggers indeseados
    this.images.forEach((img, i) => (img.isPrimary = i === index));
    this.updateModel();
  }

  // --- 4. GESTIÓN DE ELIMINACIÓN ---

  removeImage(index: number) {
    const wasPrimary = this.images[index].isPrimary;
    this.images.splice(index, 1);

    // Si borramos la portada, asignamos una nueva
    if (wasPrimary && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }

    this.reorderIndices();
    this.updateModel();
  }

  clearAllImages() {
    this.images = [];
    this.updateModel();
  }

  // --- 5. COMUNICACIÓN CON EL FORMULARIO PADRE ---

  private updateModel() {
    this.onChange(this.images); // Enviamos el array completo de ImageItem
    this.onTouch();
  }

  writeValue(obj: any): void {
    if (obj) {
      this.images = obj;
    } else {
      this.images = [];
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    // Podrías deshabilitar el input file si quieres
  }
}
