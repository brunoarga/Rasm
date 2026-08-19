package com.sistemasalud.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sistemasalud.enums.TipoCentro;
import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "centro_salud")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CentroSalud {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_centro") private Long id;
    @Column(nullable = false, length = 200) private String nombre;
    @Column(length = 255) private String direccion;
    @Column(precision = 10) private Double latitud;
    @Column(precision = 10) private Double longitud;
    @Column(length = 20) private String telefono;
    @Column(name = "email_institucional", length = 150) private String emailInstitucional;
    @Column(name = "telefono_institucional", length = 20) private String telefonoInstitucional;
    @Column(name = "webhook_url", length = 255) private String webhookUrl;
    @Enumerated(EnumType.STRING) @Column(name = "tipo_centro", length = 20) private TipoCentro tipoCentro;
    @Column(name = "es_publico") private Boolean esPublico = true;
    @Column(name = "tiene_emergencias") private Boolean tieneEmergencias = false;
    @Column(name = "horario_atencion", length = 255) private String horarioAtencion;
    @Column(nullable = false) private Boolean activo = true;
}
