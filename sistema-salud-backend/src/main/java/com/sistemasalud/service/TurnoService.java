package com.sistemasalud.service;

import com.sistemasalud.dto.request.CrearTurnoRequestDTO;
import com.sistemasalud.dto.response.TurnoResponseDTO;
import com.sistemasalud.entity.CentroSalud;
import com.sistemasalud.entity.Cita;
import com.sistemasalud.entity.Paciente;
import com.sistemasalud.entity.Profesional;
import com.sistemasalud.entity.Solicitud;
import com.sistemasalud.enums.ModalidadCita;
import com.sistemasalud.enums.TipoPractica;
import com.sistemasalud.exception.EstadoInvalidoException;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.repository.CentroSaludRepository;
import com.sistemasalud.repository.CitaRepository;
import com.sistemasalud.repository.ProfesionalRepository;
import com.sistemasalud.repository.SolicitudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service @RequiredArgsConstructor
public class TurnoService {
    private final CitaRepository citaRepository;
    private final ProfesionalRepository profesionalRepository;
    private final CentroSaludRepository centroSaludRepository;
    private final SolicitudRepository solicitudRepository;
    private final NotificacionService notificacionService;
    private final PaseService paseService;

    @Transactional
    public TurnoResponseDTO agendarProximoTurno(Long turnoAnteriorId, CrearTurnoRequestDTO dto) {
        Cita anterior = citaRepository.findById(turnoAnteriorId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Turno no encontrado con ID: " + turnoAnteriorId));
        if (anterior.getEstado() == null || !anterior.getEstado().equals("ATENDIDA")) {
            throw new EstadoInvalidoException("La consulta actual debe estar en estado ATENDIDA para agendar el próximo turno");
        }

        Solicitud sol = anterior.getSolicitud();
        Paciente paciente = sol.getPaciente();
        Profesional prof = profesionalRepository.findById(dto.getIdProfesional())
                .orElseThrow(() -> new RecursoNoEncontradoException("Profesional no encontrado con ID: " + dto.getIdProfesional()));
        if (!prof.getId().equals(anterior.getProfesional().getId())) {
            throw new EstadoInvalidoException("El profesional indicado no coincide con el de la consulta actual");
        }

        CentroSalud centro = dto.getIdCentroSalud() != null
                ? centroSaludRepository.findById(dto.getIdCentroSalud())
                        .orElseThrow(() -> new RecursoNoEncontradoException("Centro no encontrado con ID: " + dto.getIdCentroSalud()))
                : anterior.getCentroSalud();

        Cita nueva = Cita.builder()
                .solicitud(sol).profesional(prof).centroSalud(centro)
                .fechaHora(dto.getFechaHora())
                .duracion(dto.getDuracion())
                .modalidad(dto.getModalidad() != null ? ModalidadCita.valueOf(dto.getModalidad()) : ModalidadCita.PRESENCIAL)
                .estado("PROGRAMADA")
                .notas(dto.getNotas())
                .codigoPase(paseService.generarCodigoPase())
                .build();
        if (dto.getTipoPractica() != null) nueva.setTipoPractica(TipoPractica.valueOf(dto.getTipoPractica()));
        nueva = citaRepository.save(nueva);

        sol.setProfesional(prof);
        sol.setCentroSalud(centro);
        sol.setFechaTurno(nueva.getFechaHora());
        sol.setDuracionTurno(nueva.getDuracion());
        sol.setModalidad(nueva.getModalidad().name());
        sol.setFechaActualizacion(LocalDateTime.now());
        solicitudRepository.save(sol);

        notificacionService.notificarNuevoTurno(paciente, nueva);

        return toResponse(nueva, paciente, prof, sol);
    }

    private TurnoResponseDTO toResponse(Cita c, Paciente p, Profesional prof, Solicitud sol) {
        return TurnoResponseDTO.builder()
                .id(c.getId()).fechaHora(c.getFechaHora()).duracion(c.getDuracion())
                .modalidad(c.getModalidad() != null ? c.getModalidad().name() : null)
                .estado(c.getEstado()).notas(c.getNotas())
                .idSolicitud(sol.getId()).titulo(sol.getTitulo())
                .idPaciente(p.getId()).nombrePaciente(p.getUsuario().getNombreCompleto())
                .idProfesional(prof.getId()).nombreProfesional(prof.getUsuario().getNombreCompleto())
                .idCentroSalud(c.getCentroSalud() != null ? c.getCentroSalud().getId() : null)
                .nombreCentroSalud(c.getCentroSalud() != null ? c.getCentroSalud().getNombre() : null)
                .build();
    }
}
