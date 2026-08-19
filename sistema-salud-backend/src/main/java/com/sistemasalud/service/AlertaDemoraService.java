package com.sistemasalud.service;

import com.sistemasalud.dto.response.AlertaDemoraResponse;
import com.sistemasalud.entity.AlertaDemora;
import com.sistemasalud.entity.Solicitud;
import com.sistemasalud.entity.Usuario;
import com.sistemasalud.enums.EstadoSolicitud;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.repository.AlertaDemoraRepository;
import com.sistemasalud.repository.SecretarioRepository;
import com.sistemasalud.repository.SolicitudRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;

@Slf4j @Service @RequiredArgsConstructor
public class AlertaDemoraService {

    private final AlertaDemoraRepository alertaDemoraRepository;
    private final SolicitudRepository solicitudRepository;
    private final SecretarioRepository secretarioRepository;
    private final NotificacionService notificacionService;

    @Value("${app.alerta.horas:24}")
    private long horasAlerta;

    @Transactional
    public int generarAlertas() {
        LocalDateTime limite = LocalDateTime.now().minusHours(horasAlerta);
        List<Solicitud> recibidas = solicitudRepository.findByEstadoAndActivaTrueOrderByFechaCreacionDesc(EstadoSolicitud.RECIBIDA);
        List<Solicitud> vencidas = recibidas.stream()
                .filter(s -> s.getFechaTurno() == null
                        && s.getFechaActualizacion() != null
                        && s.getFechaActualizacion().isBefore(limite))
                .toList();

        int creadas = 0;
        for (Solicitud s : vencidas) {
            if (alertaDemoraRepository.existsBySolicitudIdAndEstado(s.getId(), "ABIERTA")) continue;
            String nombreCentro = s.getCentroSalud() != null ? s.getCentroSalud().getNombre() : "sin centro";
            alertaDemoraRepository.save(AlertaDemora.builder()
                    .solicitud(s)
                    .centroSalud(s.getCentroSalud())
                    .estado("ABIERTA")
                    .tipo("DEMORA")
                    .detalle("La solicitud fue derivada a " + nombreCentro
                            + " y no tiene turno asignado después de " + horasAlerta + " horas.")
                    .fechaGenerada(LocalDateTime.now())
                    .build());
            creadas++;
            notificarCentrales(s);
        }
        if (creadas > 0) log.info("Generadas {} alertas por demora (más de {} hs)", creadas, horasAlerta);
        return creadas;
    }

    @Transactional(readOnly = true)
    public List<AlertaDemoraResponse> listarAbiertas() {
        return alertaDemoraRepository.findByEstado("ABIERTA").stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AlertaDemora obtener(Long idAlerta) {
        return alertaDemoraRepository.findById(idAlerta)
                .orElseThrow(() -> new RecursoNoEncontradoException("Alerta no encontrada con ID: " + idAlerta));
    }

    @Transactional
    public void resolver(Long idAlerta) {
        AlertaDemora a = obtener(idAlerta);
        a.setEstado("RESUELTA");
        a.setFechaResuelta(LocalDateTime.now());
        alertaDemoraRepository.save(a);
    }

    @Transactional
    public void marcarReasignada(Long idAlerta) {
        AlertaDemora a = obtener(idAlerta);
        a.setEstado("RESUELTA");
        a.setTipo("REASIGNADA");
        a.setFechaResuelta(LocalDateTime.now());
        alertaDemoraRepository.save(a);
    }

    private void notificarCentrales(Solicitud s) {
        String nombreCentro = s.getCentroSalud() != null ? s.getCentroSalud().getNombre() : "sin centro";
        String msg = "La solicitud '" + s.getTitulo() + "' (folio " + (s.getFolio() != null ? s.getFolio() : s.getId())
                + ") derivada a " + nombreCentro + " superó las " + horasAlerta
                + " horas sin turno asignado. Reasigná o contactá al centro.";
        secretarioRepository.findAll().stream()
                .filter(sec -> sec.getUsuario() != null && sec.getCentroSalud() == null)
                .map(sec -> sec.getUsuario())
                .forEach(u -> notificacionService.notificarMensaje(u, "Alerta por demora: solicitud sin turno", msg, s));
    }

    private AlertaDemoraResponse toResponse(AlertaDemora a) {
        Solicitud s = a.getSolicitud();
        com.sistemasalud.entity.Paciente p = s.getPaciente();
        Usuario u = p != null ? p.getUsuario() : null;
        String doc = p != null
                ? (p.getTipoDocumento() != null ? p.getTipoDocumento() + " " + p.getNumDocumento() : p.getNumDocumento())
                : null;
        LocalDateTime ancla = s.getFechaActualizacion() != null ? s.getFechaActualizacion() : s.getFechaCreacion();
        long horas = ancla != null ? Duration.between(ancla, LocalDateTime.now()).toHours() : 0L;
        return AlertaDemoraResponse.builder()
                .id(a.getId())
                .solicitudId(s.getId())
                .folio(s.getFolio())
                .titulo(s.getTitulo())
                .nombrePaciente(u != null ? u.getNombreCompleto() : null)
                .edadPaciente(p != null ? calcularEdad(p.getFechaNacimiento()) : null)
                .documentoPaciente(doc)
                .emailPaciente(u != null ? u.getEmail() : null)
                .telefonoPaciente(u != null ? u.getTelefono() : null)
                .direccionPaciente(u != null ? u.getDireccion() : null)
                .nombreCentroSalud(a.getCentroSalud() != null ? a.getCentroSalud().getNombre() : null)
                .idCentroSalud(a.getCentroSalud() != null ? a.getCentroSalud().getId() : null)
                .estado(a.getEstado())
                .tipo(a.getTipo())
                .detalle(a.getDetalle())
                .fechaGenerada(a.getFechaGenerada())
                .fechaResuelta(a.getFechaResuelta())
                .horasDemora(horas)
                .build();
    }

    private Integer calcularEdad(LocalDate fechaNacimiento) {
        if (fechaNacimiento == null) return null;
        return Period.between(fechaNacimiento, LocalDate.now()).getYears();
    }
}
