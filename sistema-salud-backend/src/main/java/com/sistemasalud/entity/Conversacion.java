package com.sistemasalud.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "conversacion")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "solicitud"})
public class Conversacion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_conversacion") private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_solicitud", nullable = false) private Solicitud solicitud;
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private LocalDateTime fechaCreacion;
    @Column(name = "fecha_ultimo_mensaje") private LocalDateTime fechaUltimoMensaje;
    @Column(nullable = false, length = 20) private String estado = "ABIERTA";
}
