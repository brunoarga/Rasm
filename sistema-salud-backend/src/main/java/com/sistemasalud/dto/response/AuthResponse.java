package com.sistemasalud.dto.response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String token; private String tipoToken = "Bearer";
    private Long idUsuario; private String nombreCompleto; private String email;
    private String tipoUsuario; private String tipoProfesional;
    private Long idPaciente; private Long idProfesional; private Long idSecretario; private boolean consentimientoOk;
}
