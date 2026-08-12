package com.sistemasalud.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EstadoUsuarioRequest {
    @NotNull(message = "El estado activo es obligatorio")
    private Boolean activo;
}