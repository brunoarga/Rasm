package com.sistemasalud.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "paciente")
public class Paciente {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_paciente") private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false, unique = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private Usuario usuario;
    @Column(name = "fecha_nacimiento") private LocalDate fechaNacimiento;
    @Column(name = "tipo_documento", length = 20) private String tipoDocumento;
    @Column(name = "num_documento", length = 20, unique = true) private String numDocumento;
    @Column(name = "consentimiento_ok") private Boolean consentimientoOk = false;
    @Column(name = "fecha_consentimiento") private LocalDate fechaConsentimiento;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_obra_social")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ObraSocial obraSocial;
    @Column(name = "numero_afiliado", length = 50) private String numeroAfiliado;
    @Column(name = "plan_cobertura", length = 100) private String planCobertura;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_profesional_registra")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @JsonIgnore
    private Profesional profesionalRegistra;
}
