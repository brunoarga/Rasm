package com.sistemasalud.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "diario_sintomas")
public class DiarioSintomas {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_diario") private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_paciente", nullable = false)
    @JsonIgnoreProperties({"usuario", "obraSocial", "historiaClinica", "solicitudes"}) private Paciente paciente;
    @Column(nullable = false) private LocalDate fecha;
    @Column(name = "estado_animo", length = 50) private String estadoAnimo;
    @Column(name = "sintomas_texto", columnDefinition = "TEXT") private String sintomasTexto;
    @Column(name = "intensidad_dolor") private Integer intensidadDolor;
    @Column(name = "horas_suenio") private Double horasSuenio;
    @Column(name = "medicacion_tomada") private Boolean medicacionTomada;
    @Column(columnDefinition = "TEXT") private String observaciones;
}
