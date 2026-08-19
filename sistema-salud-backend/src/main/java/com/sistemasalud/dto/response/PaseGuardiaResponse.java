package com.sistemasalud.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PaseGuardiaResponse {
    private String codigoPase;
    private String linkPase;
    private String folio;
    private Long solicitudId;
    private String titulo;
    private String descripcion;
    private String anamnesis;
    private String resumenBreve;
    private String prioridad;
    private boolean emergencia;
    private String nombrePaciente;
    private String tipoDocumento;
    private String numDocumento;
    private Integer edadPaciente;
    private String obraSocial;
    private LocalDateTime fechaTurno;
    private Integer duracionTurno;
    private String modalidad;
    private String nombreProfesional;
    private Long idCentro;
    private String nombreCentro;
    private String direccionCentro;
    private String telefonoCentro;
    private String emailCentro;
    private String estadoCita;
    private LocalDateTime fechaPresentacion;
    private String indicaciones;
}