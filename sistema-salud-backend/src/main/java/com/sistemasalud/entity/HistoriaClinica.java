package com.sistemasalud.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "historia_clinica")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "paciente", "profesional", "solicitud"})
public class HistoriaClinica {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historia") private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_paciente", nullable = false)
    @JsonIgnoreProperties({"usuario", "obraSocial", "profesionalRegistra", "hibernateLazyInitializer", "handler"})
    private Paciente paciente;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_profesional", nullable = false)
    @JsonIgnoreProperties({"usuario", "especialidades", "centroSalud", "hibernateLazyInitializer", "handler"})
    private Profesional profesional;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_solicitud", nullable = false)
    @JsonIgnoreProperties({"paciente", "profesional", "categoria", "centroSalud", "hibernateLazyInitializer", "handler"})
    private Solicitud solicitud;
    @Lob @Column(columnDefinition = "TEXT") private String diagnostico;
    @Lob @Column(columnDefinition = "TEXT") private String tratamiento;
    @Lob @Column(columnDefinition = "TEXT") private String observaciones;
    @Column(name = "tipo_plantilla", length = 50) private String tipoPlantilla;
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private LocalDateTime fechaCreacion;
    @Column(name = "fecha_actualizacion") private LocalDateTime fechaActualizacion;
}
