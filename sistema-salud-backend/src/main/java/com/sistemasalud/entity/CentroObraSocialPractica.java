package com.sistemasalud.entity;

import com.sistemasalud.enums.TipoPractica;
import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "centro_obra_social_practica")
public class CentroObraSocialPractica {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_centro_obra_practica") private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_centro", nullable = false) private CentroSalud centro;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_obra_social", nullable = false) private ObraSocial obraSocial;
    @Enumerated(EnumType.STRING) @Column(name = "tipo_practica", nullable = false, length = 30) private TipoPractica tipoPractica;
    @Column(name = "requiere_autorizacion") private Boolean requiereAutorizacion = true;
    @Column(name = "telefono_autorizacion", length = 20) private String telefonoAutorizacion;
    @Column(name = "dias_estimado_respuesta") private Integer diasEstimadoRespuesta;
    @Column(nullable = false) private Boolean activo = true;
}
