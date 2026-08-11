package com.sistemasalud.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "registro_sintomatologia")
public class RegistroSintomatologia {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_registro") private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_paciente", nullable = false)
    @JsonIgnoreProperties({"usuario", "obraSocial", "historiaClinica", "solicitudes"})
    private Paciente paciente;
    @Column(nullable = false) private LocalDate fecha;
    @Column(name = "calidad_suenio", nullable = false) private Integer calidadSuenio;
    @Column(name = "estres_ansiedad", nullable = false) private Integer estresAnsiedad;
    @Column(nullable = false) private Integer adherencia;
    @Column(columnDefinition = "TEXT") private String notas;
}
