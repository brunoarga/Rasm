package com.sistemasalud.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "autorizacion_obra_social")
public class AutorizacionObraSocial {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_autorizacion") private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_cita", nullable = false) private Cita cita;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_obra_social", nullable = false) private ObraSocial obraSocial;
    @Column(name = "numero_solicitud", length = 50) private String numeroSolicitud;
    @Column(name = "numero_autorizacion", length = 50) private String numeroAutorizacion;
    @Column(length = 20) private String estado;
    @Column(name = "diagnostico_autorizacion", columnDefinition = "TEXT") private String diagnosticoAutorizacion;
    @Column(name = "codigo_practica", length = 20) private String codigoPractica;
    @Column(name = "monto_autorizado", precision = 10, scale = 2) private BigDecimal montoAutorizado;
    @Column(name = "observaciones_autorizacion", columnDefinition = "TEXT") private String observacionesAutorizacion;
    @Column(name = "fecha_solicitud") private LocalDateTime fechaSolicitud;
    @Column(name = "fecha_respuesta") private LocalDateTime fechaRespuesta;
    @Column(name = "archivo_autorizacion", length = 255) private String archivoAutorizacion;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "creado_por") private Usuario creadoPor;
}
