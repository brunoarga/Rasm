package com.sistemasalud.dto.response;

import com.sistemasalud.entity.CentroSalud;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PerfilProfesionalResponse {
    private Long id;
    private String nombreCompleto;
    private String email;
    private String telefono;
    private String direccion;
    private String tipoProfesional;
    private String especialidad;
    private String numeroLicencia;
    private String horarioAtencion;
    private String fotoPerfil;
    private CentroSalud centroActual;
    private List<CentroSalud> centrosDisponibles;
}
