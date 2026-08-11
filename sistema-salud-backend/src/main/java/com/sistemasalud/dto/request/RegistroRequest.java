package com.sistemasalud.dto.request;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
@Data
public class RegistroRequest {
    @NotBlank private String nombreCompleto;
    @NotBlank @Email private String email;
    @NotBlank private String password;
    private String telefono; private String direccion; private Double latitud; private Double longitud;
    @NotNull private String tipoUsuario;
    private String tipoProfesional; private String especialidad; private String numeroLicencia;
    private String tipoDocumento; private String numDocumento; private String fechaNacimiento;
    private Long idObraSocial; private String numeroAfiliado; private String planCobertura;
    private Boolean consentimientoAceptado;
}
