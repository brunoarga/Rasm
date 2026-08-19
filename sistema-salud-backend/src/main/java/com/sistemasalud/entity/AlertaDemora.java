package com.sistemasalud.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "alerta_demora")
public class AlertaDemora {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_alerta") private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_solicitud", nullable = false)
    private Solicitud solicitud;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_centro_salud")
    private CentroSalud centroSalud;
    @Column(length = 20, nullable = false) private String estado;
    @Column(length = 20, nullable = false) private String tipo;
    @Column(length = 500) private String detalle;
    @Column(name = "fecha_generada", nullable = false, updatable = false) private LocalDateTime fechaGenerada;
    @Column(name = "fecha_resuelta") private LocalDateTime fechaResuelta;
}
