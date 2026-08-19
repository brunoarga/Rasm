package com.sistemasalud.service;

import com.sistemasalud.entity.Solicitud;
import com.sistemasalud.entity.Usuario;
import com.sistemasalud.enums.EstadoSolicitud;
import com.sistemasalud.repository.SecretarioRepository;
import com.sistemasalud.repository.SolicitudRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j @Component @RequiredArgsConstructor
public class EscalamientoTurnoJob {

    private final SolicitudRepository solicitudRepository;
    private final SecretarioRepository secretarioRepository;
    private final NotificacionService notificacionService;

    @Value("${app.escalamiento.horas:48}")
    private long horasEscalamiento;

    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void escalarSolicitudesSinTurno() {
        LocalDateTime limite = LocalDateTime.now().minusHours(horasEscalamiento);
        List<Solicitud> vencidas = solicitudRepository.findByEstadoAndActivaTrueOrderByFechaCreacionDesc(EstadoSolicitud.RECIBIDA)
                .stream().filter(s -> s.getFechaTurno() == null && s.getFechaCreacion() != null && s.getFechaCreacion().isBefore(limite))
                .toList();
        if (vencidas.isEmpty()) return;

        log.info("Escalando {} solicitudes sin turno (más de {} hs)", vencidas.size(), horasEscalamiento);
        List<Usuario> central = secretarioRepository.findAll().stream()
                .filter(sec -> sec.getUsuario() != null && (sec.getCentroSalud() == null))
                .map(sec -> sec.getUsuario())
                .toList();

        for (Solicitud s : vencidas) {
            String nombreCentro = s.getCentroSalud() != null ? s.getCentroSalud().getNombre() : "sin centro";
            String msg = "La solicitud '" + s.getTitulo() + "' (folio " + (s.getFolio() != null ? s.getFolio() : s.getId())
                    + ") fue derivada a " + nombreCentro + " y no tiene turno asignado después de "
                    + horasEscalamiento + " horas. Requiere intervención.";
            for (Usuario u : central) {
                notificacionService.notificarMensaje(u, "Escalamiento: solicitud sin turno", msg, s);
            }
        }
    }
}