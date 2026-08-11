package com.sistemasalud.dto.response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TurnoResponseDTO {
    private Long id;
    private LocalDateTime fechaHora;
    private Integer duracion;
    private String modalidad;
    private String estado;
    private String notas;
    private Long idSolicitud;
    private String titulo;
    private Long idPaciente;
    private String nombrePaciente;
    private Long idProfesional;
    private String nombreProfesional;
    private Long idCentroSalud;
    private String nombreCentroSalud;
}
