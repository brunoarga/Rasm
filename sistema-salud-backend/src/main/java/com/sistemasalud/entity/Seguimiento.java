package com.sistemasalud.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "seguimiento")
public class Seguimiento {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_seguimiento") private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_solicitud", nullable = false) private Solicitud solicitud;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_profesional", nullable = false) private Profesional profesional;
    @Column(columnDefinition = "TEXT", nullable = false) private String descripcion;
    @Column(name = "archivo_adjunto", length = 255) private String archivoAdjunto;
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private LocalDateTime fechaCreacion;
}
