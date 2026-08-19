package com.sistemasalud.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "bitacora_solicitud")
public class BitacoraSolicitud {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_bitacora") private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_solicitud", nullable = false)
    private Solicitud solicitud;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private Usuario usuario;
    @Column(name = "estado_desde", length = 20) private String estadoDesde;
    @Column(name = "estado_hasta", length = 20) private String estadoHasta;
    @Column(columnDefinition = "TEXT", nullable = false) private String detalle;
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private LocalDateTime fechaCreacion;
}