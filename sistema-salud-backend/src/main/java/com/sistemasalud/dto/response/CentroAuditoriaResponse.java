package com.sistemasalud.dto.response;

import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CentroAuditoriaResponse {
    private Long idCentroSalud;
    private String nombreCentroSalud;
    private String direccion;
    private String emailInstitucional;
    private String telefono;
    private Boolean activo;
    private Boolean tieneEmergencias;
    private Long totalDerivadas;
    private Long confirmadas;
    private Integer pctConfirmados;
    private Double promedioHorasTurno;
    private Long noRespuesta;
    private Long alertasAbiertas;
    private Long diasSinActividad;
}