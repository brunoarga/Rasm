package com.sistemasalud.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SintomatologiaResponse {
    private Long id;
    private Long idPaciente;
    private LocalDate fecha;
    private Integer calidadSuenio;
    private Integer estresAnsiedad;
    private Integer adherencia;
    private String notas;
}
