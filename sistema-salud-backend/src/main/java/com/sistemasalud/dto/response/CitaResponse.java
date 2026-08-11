package com.sistemasalud.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CitaResponse {
    private Long id;
    private LocalDateTime fechaHora;
    private Integer duracion;
    private String modalidad;
    private String estado;
    private String notas;
    private Long idSolicitud;
    private String titulo;
    private String descripcion;
    private Long idPaciente;
    private String nombrePaciente;
    private String tipoDocumento;
    private String numDocumento;
    private Integer edad;
    private String telefonoContacto;
    private String nombreCategoria;
    private Long idObraSocial;
    private String nombreObraSocial;
    private String planCobertura;
    private String prioridad;
    private String resumenBreve;
    private String anamnesis;
    private Long idProfesional;
    private String nombreProfesional;
    private Long idCentroSalud;
    private String nombreCentroSalud;
}
