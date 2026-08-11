package com.sistemasalud.entity;

import com.sistemasalud.enums.DiaSemana;
import com.sistemasalud.enums.ModalidadCita;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "disponibilidad_profesional")
public class DisponibilidadProfesional {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_disponibilidad") private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_profesional", nullable = false) private Profesional profesional;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_centro_salud", nullable = false) private CentroSalud centroSalud;
    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", nullable = false, length = 10) private DiaSemana diaSemana;
    @Column(name = "hora_inicio", nullable = false) private LocalTime horaInicio;
    @Column(name = "hora_fin", nullable = false) private LocalTime horaFin;
    @Column(name = "duracion_turno_minutos") private Integer duracionTurnoMinutos = 15;
    @Column(name = "modalidad_permitida", length = 20) private String modalidadPermitida = "PRESENCIAL";
    @Column(nullable = false) private Boolean activa = true;
}
