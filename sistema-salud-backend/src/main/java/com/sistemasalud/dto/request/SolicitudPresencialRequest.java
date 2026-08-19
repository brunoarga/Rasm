package com.sistemasalud.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
@Data
public class SolicitudPresencialRequest {
    @NotNull private Long idPaciente;
    @NotNull private Long idCategoria;
    @NotBlank private String titulo;
    @NotBlank private String descripcion;
    private String resumenBreve;
    private Boolean esUrgente;
    private String nivelRiesgo;
    private String anamnesis;
    private Long idCentroSalud;
    private Long idProfesional;
    private String fechaHora;
    private Integer duracion;
    private String modalidad;
}