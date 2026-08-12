package com.sistemasalud.dto.request;
import com.sistemasalud.enums.TipoCentro;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class CentroSaludRequest {
    @NotBlank private String nombre;
    private String direccion;
    private Double latitud;
    private Double longitud;
    private String telefono;
    private TipoCentro tipoCentro;
    private Boolean esPublico;
    private Boolean tieneEmergencias;
    private String horarioAtencion;
    private Boolean activo;
}