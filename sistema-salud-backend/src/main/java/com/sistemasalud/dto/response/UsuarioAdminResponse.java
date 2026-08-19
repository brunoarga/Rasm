package com.sistemasalud.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UsuarioAdminResponse {
    private Long id;
    private String nombreCompleto;
    private String email;
    private String tipoUsuario;
    private String tipoProfesional;
    private String especialidad;
    private Boolean activo;
    private LocalDateTime fechaRegistro;

    private Long idPaciente;
    private Long idProfesional;
    private Long idSecretario;
    private Long idCentroSalud;
    private String nombreCentroSalud;

    private String tipoDocumento;
    private String numDocumento;
    private LocalDate fechaNacimiento;
    private String obraSocial;
    private Boolean consentimientoOk;
}