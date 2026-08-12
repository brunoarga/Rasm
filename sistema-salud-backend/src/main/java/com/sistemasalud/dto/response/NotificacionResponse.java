package com.sistemasalud.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificacionResponse {
    private Long id;
    private String titulo;
    private String mensaje;
    private Boolean leida;
    private LocalDateTime fechaEnvio;
    private Long solicitudId;
    private String solicitudTitulo;
    private String pacienteNombre;
    private Long postId;
    private String postTitulo;
}
