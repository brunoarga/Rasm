package com.sistemasalud.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "obra_social")
public class ObraSocial {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_obra_social") private Long id;
    @Column(nullable = false, length = 100) private String nombre;
    @Column(length = 20) private String tipo;
    @Column(name = "telefono_autorizaciones", length = 20) private String telefonoAutorizaciones;
    @Column(nullable = false) private Boolean activa = true;
}
