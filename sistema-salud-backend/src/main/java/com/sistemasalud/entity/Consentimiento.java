package com.sistemasalud.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "consentimiento")
public class Consentimiento {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_consentimiento") private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_paciente", nullable = false) private Paciente paciente;
    @Column(nullable = false, length = 20) private String version;
    @Column(nullable = false) private Boolean aceptado;
    @Column(name = "fecha_aceptacion", nullable = false) private LocalDateTime fechaAceptacion;
    @Column(name = "ip_origen", length = 45) private String ipOrigen;
}
