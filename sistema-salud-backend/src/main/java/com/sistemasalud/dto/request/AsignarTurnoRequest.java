package com.sistemasalud.dto.request;
import lombok.Data;
@Data
public class AsignarTurnoRequest {
    private Long idCentroSalud;
    private Long idProfesional;
    private String fechaHora;
    private Integer duracion;
    private String modalidad;
}
