package com.sistemasalud.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PerfilPacienteSolicitudResponse {

    private DatosPaciente paciente;
    private DatosSolicitud solicitud;
    private List<EntradaDiario> diario;
    private ContactoEmergencia contactoEmergencia;

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DatosPaciente {
        private Long id;
        private String nombreCompleto;
        private String email;
        private String telefono;
        private String tipoDocumento;
        private String numDocumento;
        private Integer edad;
        private String nombreObraSocial;
        private String numeroAfiliado;
        private String planCobertura;
        private Boolean consentimientoOk;
        private String fotoPerfil;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DatosSolicitud {
        private Long id;
        private String titulo;
        private String descripcion;
        private String anamnesis;
        private String resumenBreve;
        private String estado;
        private String prioridad;
        private String nombreCategoria;
        private LocalDateTime fechaCreacion;
        private String archivoAdjunto;
        private String nombreCentroSalud;
        private String nombreProfesional;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class EntradaDiario {
        private LocalDate fecha;
        private String estadoAnimo;
        private Integer intensidadDolor;
        private Double horasSuenio;
        private Boolean medicacionTomada;
        private String sintomasTexto;
        private String observaciones;
        private Integer calidadSuenio;
        private Integer estresAnsiedad;
        private Integer adherencia;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ContactoEmergencia {
        private String nombre;
        private String telefono;
        private String parentesco;
    }
}
