package com.sistemasalud.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AlertaDemoraResponse {
    private Long id;
    private Long solicitudId;
    private String folio;
    private String titulo;
    private String nombrePaciente;
    private Integer edadPaciente;
    private String documentoPaciente;
    private String emailPaciente;
    private String telefonoPaciente;
    private String direccionPaciente;
    private String nombreCentroSalud;
    private Long idCentroSalud;
    private String estado;
    private String tipo;
    private String detalle;
    private LocalDateTime fechaGenerada;
    private LocalDateTime fechaResuelta;
    private Long horasDemora;
}
