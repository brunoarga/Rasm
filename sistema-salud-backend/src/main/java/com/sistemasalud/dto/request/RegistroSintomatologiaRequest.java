package com.sistemasalud.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegistroSintomatologiaRequest {
    @NotNull @Min(1) @Max(10) private Integer calidadSuenio;
    @NotNull @Min(1) @Max(10) private Integer estresAnsiedad;
    @NotNull @Min(1) @Max(10) private Integer adherencia;
    private String notas;
}
