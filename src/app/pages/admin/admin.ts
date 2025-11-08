import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ImgBbService } from '../../services/propertyServices/imgBB/img-bb-service';
import { finalize } from 'rxjs';
import { FormProperty } from '../../components/form-property/form-property';

@Component({
  selector: 'app-admin',
  imports: [ReactiveFormsModule,FormProperty],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin{

  // 3. El componente mantiene el estado de la UI
  uploading = false;
  uploadResponse: any = null;
  errorMessage: string | null = null;


  constructor(private imgService : ImgBbService)
  {}

  /**
   * Se llama cuando el usuario selecciona un archivo.
   */
  onFileSelected(event: Event): void {
    // event is's a reference about the tag that call or execute the evente.
    // In this case the event change (it's a event that will be active when him value change; easier, when we upload an image)
    // So, the event is a lot of things, the important is the .target!
    // The .target is the tag that activated the event, in this case, the input!
    // One more thing and we have all, we need parse the .target, becouse angular/ts dont know what type is the tag that call the event!!
    // So we need call the event.target as HTMLInputElement!!! This class is from DOM, is not native from ts, as the Event class!!
    const input = event.target as HTMLInputElement;

    // If the user did not add somefile in the input, we dont do nothing
    // The second conditional is "por las dudas"
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Resetea estados
      this.uploading = true;
      this.uploadResponse = null;
      this.errorMessage = null;

      // 4. Llama al servicio con el archivo
      this.imgService.uploadImage(file).pipe(
        finalize(() => {
          this.uploading = false; // this pipe is for setting the states in the html, it's completly optional
        })
      ).subscribe({
        // 5. El COMPONENTE se suscribe y maneja la respuesta
        next: (response) => {
          console.log('Respuesta del servicio:', response);
          this.uploadResponse = response;
        },
        error: (error) => {
          console.error('Error del servicio:', error);
          this.errorMessage = 'Falló la subida de la imagen.';
        }
      });
    }
  }
}
