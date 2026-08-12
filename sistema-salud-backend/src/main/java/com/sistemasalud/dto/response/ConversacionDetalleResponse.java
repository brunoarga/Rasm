package com.sistemasalud.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ConversacionDetalleResponse {
    private ConversacionResponse conversacion;
    private List<MensajeResponse> mensajes;
}
