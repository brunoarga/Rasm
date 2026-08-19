package com.sistemasalud.entity;

import com.sistemasalud.enums.*;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "cita")
public class Cita {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cita") private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_solicitud", nullable = false) private Solicitud solicitud;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_profesional", nullable = false) private Profesional profesional;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_centro_salud") private CentroSalud centroSalud;
    @Column(name = "fecha_hora", nullable = false) private LocalDateTime fechaHora;
    @Column(nullable = false) private Integer duracion;
    @Enumerated(EnumType.STRING) @Column(length = 20) private ModalidadCita modalidad;
    @Column(length = 20) private String estado;
    @Column(columnDefinition = "TEXT") private String notas;
    @Enumerated(EnumType.STRING) @Column(name = "tipo_practica", length = 30) private TipoPractica tipoPractica;
    @Column(name = "requiere_autorizacion") @Builder.Default private Boolean requiereAutorizacion = false;
    @Enumerated(EnumType.STRING) @Column(name = "estado_autorizacion", length = 20) @Builder.Default private EstadoAutorizacion estadoAutorizacion = EstadoAutorizacion.NO_REQUERIDA;
    @Column(name = "numero_autorizacion", length = 50) private String numeroAutorizacion;
    @Column(name = "fecha_solicitud_autorizacion") private LocalDateTime fechaSolicitudAutorizacion;
    @Column(name = "fecha_respuesta_autorizacion") private LocalDateTime fechaRespuestaAutorizacion;
    @Column(name = "recordatorio_24h_enviado") @Builder.Default private Boolean recordatorio24hEnviado = false;
    @Column(name = "recordatorio_2h_enviado") @Builder.Default private Boolean recordatorio2hEnviado = false;
    @Column(name = "codigo_pase", length = 16) private String codigoPase;
    @Column(name = "fecha_presentacion") private LocalDateTime fechaPresentacion;
}
