package com.sistemasalud.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PostResponseDTO {
    private Long id;
    private String titulo;
    private String contenido;
    private LocalDateTime fechaCreacion;
    private String autorNombre;
    private String autorAvatar;
    private String categoria;
    private long cantidadComentarios;
    private long cantidadApoyos;
    private List<ComentarioResponseDTO> comentarios;
}
