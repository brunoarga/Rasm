package com.sistemasalud.dto.request;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class DerivacionRequest {
    private Long idProfesional; private Long idCentroSalud;
    private String tipoPractica; private String motivoDerivacion; private String notas;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaHora;
    private Integer duracion;
    private String modalidad;
}