package com.sistemasalud.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PerfilSecretarioResponse {
    private Long id;
    private Long idSecretario;
    private String nombreCompleto;
    private String email;
    private Long idCentroSalud;
    private String nombreCentroSalud;
    private boolean referente;
}