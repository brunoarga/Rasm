package com.sistemasalud.service;

import com.sistemasalud.dto.response.CentroAuditoriaResponse;
import com.sistemasalud.entity.AlertaDemora;
import com.sistemasalud.entity.CentroSalud;
import com.sistemasalud.entity.Solicitud;
import com.sistemasalud.enums.EstadoSolicitud;
import com.sistemasalud.repository.AlertaDemoraRepository;
import com.sistemasalud.repository.CentroSaludRepository;
import com.sistemasalud.repository.SolicitudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class AuditoriaRedService {

    private final CentroSaludRepository centroSaludRepository;
    private final SolicitudRepository solicitudRepository;
    private final AlertaDemoraRepository alertaDemoraRepository;

    @Transactional(readOnly = true)
    public List<CentroAuditoriaResponse> auditarRed() {
        List<CentroSalud> centros = centroSaludRepository.findByActivoTrue();
        Map<Long, Long> alertasPorCentro = alertaDemoraRepository.findByEstado("ABIERTA").stream()
                .filter(a -> a.getCentroSalud() != null)
                .collect(Collectors.groupingBy(a -> a.getCentroSalud().getId(), Collectors.counting()));

        return centros.stream()
                .map(c -> auditarCentro(c, alertasPorCentro))
                .sorted(Comparator.comparing(CentroAuditoriaResponse::getNombreCentroSalud))
                .toList();
    }

    private CentroAuditoriaResponse auditarCentro(CentroSalud c, Map<Long, Long> alertasPorCentro) {
        List<Solicitud> derivadas = solicitudRepository.findByCentroSaludIdOrderByFechaCreacionDesc(c.getId());
        long total = derivadas.size();
        long confirmadas = derivadas.stream().filter(s -> s.getFechaTurno() != null).count();
        long noRespuesta = derivadas.stream()
                .filter(s -> Boolean.TRUE.equals(s.getActiva())
                        && s.getEstado() == EstadoSolicitud.RECIBIDA && s.getFechaTurno() == null)
                .count();
        double pct = total == 0 ? 0.0 : (confirmadas * 100.0) / total;

        double sumaHoras = derivadas.stream()
                .filter(s -> s.getFechaTurno() != null && s.getFechaActualizacion() != null)
                .mapToDouble(s -> Duration.between(s.getFechaActualizacion(), s.getFechaTurno()).toMinutes() / 60.0)
                .sum();
        long conAhora = derivadas.stream()
                .filter(s -> s.getFechaTurno() != null && s.getFechaActualizacion() != null)
                .count();
        Double promedioHoras = conAhora > 0 ? sumaHoras / conAhora : null;

        LocalDateTime ultima = derivadas.stream()
                .map(s -> {
                    LocalDateTime u = s.getFechaActualizacion();
                    if (s.getFechaTurno() != null && (u == null || s.getFechaTurno().isAfter(u))) u = s.getFechaTurno();
                    return u;
                })
                .filter(u -> u != null)
                .max(Comparator.naturalOrder())
                .orElse(null);
        Long diasSinActividad = ultima != null ? ChronoUnit.DAYS.between(ultima, LocalDateTime.now()) : null;

        return CentroAuditoriaResponse.builder()
                .idCentroSalud(c.getId())
                .nombreCentroSalud(c.getNombre())
                .direccion(c.getDireccion())
                .emailInstitucional(c.getEmailInstitucional())
                .telefono(c.getTelefono())
                .activo(c.getActivo())
                .tieneEmergencias(c.getTieneEmergencias())
                .totalDerivadas(total)
                .confirmadas(confirmadas)
                .pctConfirmados((int) Math.round(pct))
                .promedioHorasTurno(promedioHoras)
                .noRespuesta(noRespuesta)
                .alertasAbiertas(alertasPorCentro.getOrDefault(c.getId(), 0L))
                .diasSinActividad(diasSinActividad)
                .build();
    }
}