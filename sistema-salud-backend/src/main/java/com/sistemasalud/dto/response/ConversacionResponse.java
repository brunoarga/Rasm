package com.sistemasalud.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ConversacionResponse {
    private Long id;
    private Long idSolicitud;
    private String solicitudTitulo;
    private Long idInterlocutor;
    private String interlocutorNombre;
    private String interlocutorAvatar;
    private String rolInterlocutor;
    private String ultimoMensaje;
    private LocalDateTime fechaUltimoMensaje;
    private long noLeidos;
}
