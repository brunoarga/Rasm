package com.sistemasalud.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MensajeResponse {
    private Long id;
    private Long idConversacion;
    private Long idEmisor;
    private String emisorNombre;
    private String contenido;
    private Boolean leido;
    private LocalDateTime fechaEnvio;
    private Boolean propio;
}
