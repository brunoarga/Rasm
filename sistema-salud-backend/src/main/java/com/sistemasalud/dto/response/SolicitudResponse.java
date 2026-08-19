package com.sistemasalud.dto.response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SolicitudResponse {
    private Long id; private String folio; private Long idPaciente; private String nombrePaciente;
    private Long idProfesional; private String nombreProfesional;
    private Long idCategoria; private String nombreCategoria;
    private Long idObraSocial; private String nombreObraSocial;
    private String titulo; private String descripcion; private String estado; private String origen;
    private String prioridad; private LocalDateTime fechaCreacion; private LocalDateTime fechaActualizacion;
    private Long idCentroSalud; private String nombreCentroSalud; private String direccionCentroSalud;
    private LocalDateTime fechaTurno; private Integer duracionTurno; private String modalidad;
    private String resumenBreve; private String archivoAdjunto; private String anamnesis;
    private String direccionPaciente; private String tipoDocumento; private String numDocumento;
    private String emailPaciente; private String telefonoPaciente;
    private Integer edadPaciente; private java.time.LocalDate fechaNacimientoPaciente;
    private boolean activa;
    private boolean emergencia;
    private String codigoPase;
}
