package com.sistemasalud.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class HistoriaClinicaResponse {
    private Long id;
    private Long idPaciente;
    private String nombrePaciente;
    private Long idSolicitud;
    private String tituloSolicitud;
    private Long idProfesional;
    private String nombreProfesional;
    private String diagnostico;
    private String tratamiento;
    private String observaciones;
    private String tipoPlantilla;
    private LocalDateTime fechaCreacion;
}
