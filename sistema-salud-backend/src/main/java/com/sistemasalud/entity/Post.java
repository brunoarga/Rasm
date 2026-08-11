package com.sistemasalud.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "post_foro")
public class Post {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_post") private Long id;
    @Column(nullable = false, length = 200) private String titulo;
    @Column(nullable = false, columnDefinition = "TEXT") private String contenido;
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private LocalDateTime fechaCreacion;
    @Column(name = "es_anonimo", nullable = false) private Boolean esAnonimo = false;
    @Column(nullable = false, length = 50) private String categoria;
    @Column(name = "cantidad_apoyos", nullable = false) private Integer cantidadApoyos = 0;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Paciente usuario;
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"post", "hibernateLazyInitializer", "handler"})
    private List<Comentario> comentarios = new ArrayList<>();
}
