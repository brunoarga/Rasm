package com.sistemasalud.entity;

import com.sistemasalud.enums.EstadoSolicitud;
import com.sistemasalud.enums.OrigenSolicitud;
import com.sistemasalud.enums.Prioridad;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "solicitud")
public class Solicitud {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud") private Long id;
    @Column(length = 30) private String folio;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false) private Paciente paciente;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_profesional") private Profesional profesional;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria", nullable = false) private CategoriaAyuda categoria;
    @Column(nullable = false, length = 200) private String titulo;
    @Column(columnDefinition = "TEXT", nullable = false) private String descripcion;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private EstadoSolicitud estado;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10) private Prioridad prioridad;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10) private OrigenSolicitud origen;
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private LocalDateTime fechaCreacion;
    @Column(name = "fecha_actualizacion") private LocalDateTime fechaActualizacion;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_centro_salud") private CentroSalud centroSalud;
    @Column(name = "fecha_turno") private LocalDateTime fechaTurno;
    @Column(name = "duracion_turno") private Integer duracionTurno;
    @Column(length = 20) private String modalidad;
    @Column(name = "resumen_breve", columnDefinition = "TEXT") private String resumenBreve;
    @Column(name = "archivo_adjunto", length = 255) private String archivoAdjunto;
    @Column(columnDefinition = "TEXT") private String anamnesis;
    @Builder.Default @Column(name = "activa") private Boolean activa = true;
    @Builder.Default @Column(name = "emergencia") private Boolean emergencia = false;
}
