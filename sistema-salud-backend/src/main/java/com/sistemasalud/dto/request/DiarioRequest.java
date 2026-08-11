package com.sistemasalud.dto.request;
import lombok.Data;
@Data
public class DiarioRequest {
    private String estadoAnimo;
    private String sintomasTexto;
    private Integer intensidadDolor;
    private Double horasSuenio;
    private Boolean medicacionTomada;
    private String observaciones;
}
