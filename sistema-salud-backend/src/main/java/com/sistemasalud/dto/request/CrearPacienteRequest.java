package com.sistemasalud.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class CrearPacienteRequest {
    private String nombre;
    private String apellido;
    private String nombreCompleto;
    @Email
    private String email;
    private String password;
    private String telefono;
    private String direccion;
    private String tipoDocumento;
    private String numeroDocumento;
    private String numDocumento;
    private String fechaNacimiento;
    private Long obraSocialId;
    private Long idObraSocial;
    private String numeroAfiliado;
    private String planCobertura;
    private Long centroSaludId;
}
