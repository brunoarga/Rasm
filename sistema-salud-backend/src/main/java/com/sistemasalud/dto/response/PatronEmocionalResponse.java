package com.sistemasalud.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PatronEmocionalResponse {

    private List<DiaSemanaResumen> porDiaSemana;
    private String tendenciaGeneral;
    private String correlacionSuenioAnimo;
    private String patronEstresSuenio;
    private String mejorDiaSemana;
    private String peorDiaSemana;
    private int diasRegistrados;
    private int rachaActual;

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DiaSemanaResumen {
        private String dia;
        private String animoPredominante;
        private double animoPromedio;
        private double estresPromedio;
        private double suenioPromedio;
        private int cantidadRegistros;
    }
}
