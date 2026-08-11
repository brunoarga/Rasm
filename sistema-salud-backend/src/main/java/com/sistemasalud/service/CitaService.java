package com.sistemasalud.service;

import com.sistemasalud.dto.request.AtenderCitaRequest;
import com.sistemasalud.dto.request.CitaRequest;
import com.sistemasalud.dto.response.CitaResponse;
import com.sistemasalud.entity.*;
import com.sistemasalud.enums.ModalidadCita;
import com.sistemasalud.enums.TipoPractica;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service @RequiredArgsConstructor
public class CitaService {
    private final CitaRepository citaRepository;
    private final SolicitudRepository solicitudRepository;
    private final ProfesionalRepository profesionalRepository;
    private final CentroSaludRepository centroSaludRepository;
    private final PacienteRepository pacienteRepository;
    private final NotificacionService notificacionService;

    @Transactional
    public CitaResponse agendarCita(CitaRequest request) {
        Solicitud sol = solicitudRepository.findById(request.getIdSolicitud()).orElseThrow(() -> new RecursoNoEncontradoException("Solicitud no encontrada"));
        Profesional prof = profesionalRepository.findById(request.getIdProfesional()).orElseThrow(() -> new RecursoNoEncontradoException("Profesional no encontrado"));
        CentroSalud centro = request.getIdCentroSalud() != null ? centroSaludRepository.findById(request.getIdCentroSalud()).orElseThrow(() -> new RecursoNoEncontradoException("Centro no encontrado")) : null;

        List<Cita> solapadas = citaRepository.findByProfesionalIdAndFechaHoraBetween(
                request.getIdProfesional(), request.getFechaHora(), request.getFechaHora().plusMinutes(request.getDuracion()));
        if (!solapadas.isEmpty())
            throw new com.sistemasalud.exception.SolicitudInvalidaException("El profesional ya tiene un turno en ese horario");

        Cita cita = Cita.builder().solicitud(sol).profesional(prof).centroSalud(centro).fechaHora(request.getFechaHora()).duracion(request.getDuracion()).modalidad(request.getModalidad() != null ? ModalidadCita.valueOf(request.getModalidad()) : ModalidadCita.PRESENCIAL).estado("PROGRAMADA").notas(request.getNotas()).build();
        if (request.getTipoPractica() != null) cita.setTipoPractica(TipoPractica.valueOf(request.getTipoPractica()));
        cita = citaRepository.save(cita);

        sol.setEstado(com.sistemasalud.enums.EstadoSolicitud.ASIGNADA);
        sol.setProfesional(prof);
        sol.setCentroSalud(centro);
        sol.setFechaTurno(cita.getFechaHora());
        sol.setDuracionTurno(cita.getDuracion());
        sol.setModalidad(cita.getModalidad().name());
        solicitudRepository.save(sol);

        String msgPaciente = String.format("Su profesional %s ha agendado un turno para el %s a las %s.",
                prof.getUsuario().getNombreCompleto(),
                cita.getFechaHora().toLocalDate().toString(),
                cita.getFechaHora().toLocalTime().toString());
        notificacionService.crearNotificacion(sol.getPaciente().getUsuario(), "Turno agendado", msgPaciente, sol);

        return toResponse(cita);
    }

    @Transactional(readOnly = true)
    public List<CitaResponse> obtenerCitasPorProfesionalDto(Long id, LocalDateTime inicio, LocalDateTime fin) {
        return citaRepository.findByProfesionalIdAndFechaHoraBetweenOrderByFechaHoraAsc(id, inicio, fin)
                .stream().map(this::toResponse).toList();
    }

    public List<Cita> obtenerCitasPorProfesional(Long id, LocalDateTime inicio, LocalDateTime fin) {
        return citaRepository.findByProfesionalIdAndFechaHoraBetweenOrderByFechaHoraAsc(id, inicio, fin);
    }

    @Transactional(readOnly = true)
    public List<CitaResponse> obtenerCitasPorCentro(Long idCentro, LocalDateTime inicio, LocalDateTime fin) {
        return citaRepository.findByCentroSaludIdAndFechaHoraBetweenOrderByFechaHoraAsc(idCentro, inicio, fin)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CitaResponse> obtenerCitasPorCentroYProfesional(Long idCentro, Long idProfesional, LocalDateTime inicio, LocalDateTime fin) {
        List<Cita> citasCentro = citaRepository.findByCentroSaludIdAndFechaHoraBetweenOrderByFechaHoraAsc(idCentro, inicio, fin);
        return citasCentro.stream()
                .filter(c -> c.getProfesional() != null && c.getProfesional().getId().equals(idProfesional))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CitaResponse> obtenerCitasPorPaciente(Long idUsuario) {
        Paciente p = pacienteRepository.findByUsuarioId(idUsuario).orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));
        return citaRepository.findBySolicitudPacienteIdOrderByFechaHoraDesc(p.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public void cancelarCita(Long id) {
        Cita c = citaRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Cita no encontrada"));
        c.setEstado("CANCELADA");
        citaRepository.save(c);
    }

    @Transactional
    public CitaResponse guardarNotasCita(Long id, String notas) {
        Cita c = citaRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Cita no encontrada"));
        c.setNotas(notas);
        c = citaRepository.save(c);
        return toResponse(c);
    }

    @Transactional
    public CitaResponse atenderCita(Long id, AtenderCitaRequest request) {
        Cita c = citaRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Cita no encontrada"));
        c.setEstado("ATENDIDA");
        c.setNotas(request.getNotas());
        c = citaRepository.save(c);

        Solicitud sol = c.getSolicitud();
        if (sol.getEstado() != com.sistemasalud.enums.EstadoSolicitud.COMPLETADA) {
            sol.setEstado(com.sistemasalud.enums.EstadoSolicitud.COMPLETADA);
            sol.setFechaActualizacion(LocalDateTime.now());
            solicitudRepository.save(sol);
        }

        return toResponse(c);
    }

    private CitaResponse toResponse(Cita c) {
        Solicitud sol = c.getSolicitud();
        Paciente p = sol.getPaciente();
        Integer edad = p.getFechaNacimiento() != null
                ? java.time.LocalDate.now().getYear() - p.getFechaNacimiento().getYear()
                : null;
        return CitaResponse.builder()
                .id(c.getId()).fechaHora(c.getFechaHora()).duracion(c.getDuracion())
                .modalidad(c.getModalidad() != null ? c.getModalidad().name() : null)
                .estado(c.getEstado()).notas(c.getNotas())
                .idSolicitud(sol.getId()).titulo(sol.getTitulo())
                .descripcion(sol.getDescripcion())
                .idPaciente(p.getId())
                .nombrePaciente(p.getUsuario().getNombreCompleto())
                .tipoDocumento(p.getTipoDocumento()).numDocumento(p.getNumDocumento())
                .edad(edad)
                .telefonoContacto(p.getUsuario().getTelefono())
                .nombreCategoria(sol.getCategoria().getNombre())
                .idObraSocial(p.getObraSocial() != null ? p.getObraSocial().getId() : null)
                .nombreObraSocial(p.getObraSocial() != null ? p.getObraSocial().getNombre() : "Sin cobertura")
                .planCobertura(p.getPlanCobertura())
                .prioridad(sol.getPrioridad().name())
                .resumenBreve(sol.getResumenBreve())
                .anamnesis(sol.getAnamnesis())
                .idProfesional(c.getProfesional().getId())
                .nombreProfesional(c.getProfesional().getUsuario().getNombreCompleto())
                .idCentroSalud(c.getCentroSalud() != null ? c.getCentroSalud().getId() : null)
                .nombreCentroSalud(c.getCentroSalud() != null ? c.getCentroSalud().getNombre() : null)
                .build();
    }
}
