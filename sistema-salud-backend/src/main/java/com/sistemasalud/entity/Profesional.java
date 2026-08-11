package com.sistemasalud.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "profesional")
public class Profesional {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_profesional") private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false, unique = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private Usuario usuario;
    @Column(name = "horario_atencion", length = 255) private String horarioAtencion;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_centro_salud")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private CentroSalud centroSalud;
}
