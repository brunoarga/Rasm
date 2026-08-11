package com.sistemasalud.dto.request;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
@Data
public class HistoriaClinicaRequest {
    @NotNull private Long idSolicitud;
    @NotNull private Long idPaciente;
    private String diagnostico; private String tratamiento; private String observaciones; private String tipoPlantilla;
}
