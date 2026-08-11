package com.sistemasalud.dto.request;
import lombok.Data;
@Data
public class DerivacionRequest {
    private Long idProfesional; private Long idCentroSalud;
    private String tipoPractica; private String motivoDerivacion; private String notas;
}
