package com.sistemasalud.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "mensaje")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "conversacion"})
public class Mensaje {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mensaje") private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_conversacion", nullable = false) private Conversacion conversacion;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_emisor", nullable = false) private Usuario emisor;
    @Column(columnDefinition = "TEXT", nullable = false) private String contenido;
    @Column(nullable = false) private Boolean leido = false;
    @Column(name = "fecha_envio", nullable = false, updatable = false) private LocalDateTime fechaEnvio;
}
