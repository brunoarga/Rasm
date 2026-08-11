package com.sistemasalud.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DiarioResponse {
    private Long id;
    private LocalDate fecha;
    private String estadoAnimo;
    private String sintomasTexto;
    private Integer intensidadDolor;
    private Double horasSuenio;
    private Boolean medicacionTomada;
    private String observaciones;
}
