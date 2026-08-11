package com.sistemasalud.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CrearComentarioRequestDTO {
    @NotBlank(message = "El contenido es obligatorio")
    @Size(max = 2000, message = "El comentario no puede superar los 2000 caracteres")
    private String contenido;

    private Boolean esAnonimo = false;
}
