package com.sistemasalud.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CrearPostRequestDTO {
    @NotBlank(message = "El titulo es obligatorio")
    @Size(max = 200, message = "El titulo no puede superar los 200 caracteres")
    private String titulo;

    @NotBlank(message = "El contenido es obligatorio")
    private String contenido;

    @NotBlank(message = "La categoria es obligatoria")
    @Size(max = 50, message = "La categoria no puede superar los 50 caracteres")
    private String categoria;

    private Boolean esAnonimo = false;
}
