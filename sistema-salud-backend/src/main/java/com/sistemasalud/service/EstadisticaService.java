package com.sistemasalud.service;

import com.sistemasalud.enums.EstadoSolicitud;
import com.sistemasalud.enums.Prioridad;
import com.sistemasalud.repository.PacienteRepository;
import com.sistemasalud.repository.SolicitudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service @RequiredArgsConstructor
public class EstadisticaService {
    private final SolicitudRepository solicitudRepository;
    private final PacienteRepository pacienteRepository;
    public Map<String, Object> obtenerEstadisticasGenerales() {
        Map<String, Object> s = new HashMap<>();
        s.put("totalSolicitudes", solicitudRepository.count());
        s.put("creadas", solicitudRepository.countByEstado(EstadoSolicitud.CREADA));
        s.put("revisadas", solicitudRepository.countByEstado(EstadoSolicitud.REVISADA));
        s.put("asignadas", solicitudRepository.countByEstado(EstadoSolicitud.ASIGNADA));
        s.put("enProceso", solicitudRepository.countByEstado(EstadoSolicitud.EN_PROCESO));
        s.put("derivadas", solicitudRepository.countByEstado(EstadoSolicitud.DERIVADA));
        s.put("completadas", solicitudRepository.countByEstado(EstadoSolicitud.COMPLETADA));
        s.put("urgentes", solicitudRepository.countByPrioridad(Prioridad.URGENTE));
        s.put("alta", solicitudRepository.countByPrioridad(Prioridad.ALTA));
        s.put("media", solicitudRepository.countByPrioridad(Prioridad.MEDIA));
        s.put("baja", solicitudRepository.countByPrioridad(Prioridad.BAJA));
        s.put("totalPacientes", pacienteRepository.count());
        s.put("pacientesConCobertura", pacienteRepository.countByObraSocialNotNull());
        s.put("pacientesSinCobertura", pacienteRepository.countByObraSocialIsNull());
        s.put("pacientesActivos", pacienteRepository.countByUsuarioActivoTrue());
        return s;
    }
}
