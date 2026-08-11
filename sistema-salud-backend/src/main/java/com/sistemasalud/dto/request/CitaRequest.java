package com.sistemasalud.dto.request;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class CitaRequest {
    @NotNull private Long idSolicitud;
    @NotNull private Long idProfesional;
    private Long idCentroSalud;
    @NotNull
    @Future(message = "La fecha y hora del turno debe ser en el futuro")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaHora;
    @NotNull private Integer duracion;
    private String modalidad; private String notas; private String tipoPractica;
}
