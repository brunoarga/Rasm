package com.sistemasalud.entity;

import java.time.LocalDateTime;
import com.sistemasalud.enums.TipoProfesional;
import com.sistemasalud.enums.TipoUsuario;
import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "usuario")
public class Usuario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario") private Long id;
    @Column(name = "nombre_completo", nullable = false, length = 150) private String nombreCompleto;
    @Column(nullable = false, unique = true, length = 100) private String email;
    @Column(name = "password_hash", nullable = false, length = 255) private String password;
    @Column(length = 20) private String telefono;
    @Column(length = 255) private String direccion;
    @Column(precision = 10) private Double latitud;
    @Column(precision = 10) private Double longitud;
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_usuario", nullable = false, length = 20) private TipoUsuario tipoUsuario;
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_profesional", length = 20) private TipoProfesional tipoProfesional;
    @Column(length = 100) private String especialidad;
    @Column(name = "numero_licencia", length = 50) private String numeroLicencia;
    @Column(nullable = false) private Boolean activo = true;
    @Column(name = "fecha_registro", nullable = false, updatable = false) private LocalDateTime fechaRegistro;
    @Column(name = "email_confirmado") private Boolean emailConfirmado = false;
    @Column(name = "foto_perfil", length = 255) private String fotoPerfil;
}
