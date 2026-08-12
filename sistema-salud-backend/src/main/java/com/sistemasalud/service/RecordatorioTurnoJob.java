package com.sistemasalud.service;

import com.sistemasalud.entity.Cita;
import com.sistemasalud.entity.Usuario;
import com.sistemasalud.repository.CitaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j @Component @RequiredArgsConstructor
public class RecordatorioTurnoJob {

    private final CitaRepository citaRepository;
    private final NotificacionService notificacionService;

    @Scheduled(fixedDelay = 600000, initialDelay = 120000)
    public void enviarRecordatorios() {
        LocalDateTime ahora = LocalDateTime.now();
        try {
            enviarParaVentana(ahora, ahora.plusHours(24), true);
            enviarParaVentana(ahora, ahora.plusHours(2), false);
        } catch (Exception ex) {
            log.error("Error al procesar recordatorios de turno", ex);
        }
    }

    private void enviarParaVentana(LocalDateTime desde, LocalDateTime hasta, boolean ventana24h) {
        List<Cita> citas = citaRepository.findByEstadoAndFechaHoraBetween("PROGRAMADA", desde, hasta);
        for (Cita cita : citas) {
            if (cita.getSolicitud() == null || cita.getSolicitud().getPaciente() == null) continue;
            if (cita.getSolicitud().getPaciente().getUsuario() == null) continue;
            if (Boolean.TRUE.equals(ventana24h ? cita.getRecordatorio24hEnviado() : cita.getRecordatorio2hEnviado())) continue;

            Usuario paciente = cita.getSolicitud().getPaciente().getUsuario();
            String fechaTexto = cita.getFechaHora().toLocalDate() + " a las "
                    + cita.getFechaHora().toLocalTime().toString().substring(0, 5);
            String profesionalNombre = cita.getProfesional() != null
                    ? cita.getProfesional().getUsuario().getNombreCompleto() : "tu profesional";

            notificacionService.crearNotificacion(paciente,
                    "Recordatorio de turno",
                    "Te recordamos tu turno para el " + fechaTexto + " con " + profesionalNombre + ".", cita.getSolicitud());

            if (cita.getProfesional() != null && cita.getProfesional().getUsuario() != null) {
                notificacionService.crearNotificacion(cita.getProfesional().getUsuario(),
                        "Recordatorio de turno",
                        "Tenés un turno con " + paciente.getNombreCompleto() + " el " + fechaTexto + ".", cita.getSolicitud());
            }

            if (ventana24h) cita.setRecordatorio24hEnviado(true);
            else cita.setRecordatorio2hEnviado(true);
            citaRepository.save(cita);
        }
    }
}
