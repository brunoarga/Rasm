package com.sistemasalud.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "comentario_foro")
public class Comentario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_comentario") private Long id;
    @Column(nullable = false, columnDefinition = "TEXT") private String contenido;
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private LocalDateTime fechaCreacion;
    @Column(name = "es_anonimo", nullable = false) private Boolean esAnonimo = false;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_post", nullable = false)
    @JsonIgnoreProperties({"comentarios", "hibernateLazyInitializer", "handler"})
    private Post post;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Paciente usuario;
}
