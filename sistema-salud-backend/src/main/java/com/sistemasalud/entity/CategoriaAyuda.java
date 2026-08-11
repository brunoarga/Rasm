package com.sistemasalud.entity;

import com.sistemasalud.enums.Prioridad;
import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "categoria_ayuda")
public class CategoriaAyuda {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria") private Long id;
    @Column(nullable = false, length = 100) private String nombre;
    @Column(columnDefinition = "TEXT") private String descripcion;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10) private Prioridad prioridad;
    @Column(length = 50) private String icono;
    @Column(nullable = false) private Boolean activa = true;
}
