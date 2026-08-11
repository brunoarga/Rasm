package com.sistemasalud.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "notificacion")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "usuario", "solicitud"})
public class Notificacion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notificacion") private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_usuario", nullable = false) private Usuario usuario;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_solicitud") private Solicitud solicitud;
    @Column(nullable = false, length = 200) private String titulo;
    @Column(columnDefinition = "TEXT", nullable = false) private String mensaje;
    @Column(nullable = false) private Boolean leida = false;
    @Column(name = "fecha_envio", nullable = false, updatable = false) private LocalDateTime fechaEnvio;
}
