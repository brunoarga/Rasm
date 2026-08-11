package com.sistemasalud.service;

import com.sistemasalud.dto.response.PerfilProfesionalResponse;
import com.sistemasalud.entity.*;
import com.sistemasalud.enums.DiaSemana;
import com.sistemasalud.enums.ModalidadCita;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Slf4j
public class ProfesionalService {
    private final ProfesionalRepository profesionalRepository;
    private final DisponibilidadProfesionalRepository disponibilidadRepository;
    private final CitaRepository citaRepository;
    private final CentroSaludRepository centroSaludRepository;

    @Transactional(readOnly = true)
    public List<Profesional> listarPorCentro(Long idCentro) {
        log.debug("listarPorCentro: idCentro = {}", idCentro);
        List<Profesional> profesionales = profesionalRepository.findByCentroSaludId(idCentro);
        log.debug("Profesionales encontrados: {}", profesionales.size());
        profesionales.forEach(p -> {
            if (p.getUsuario() != null) {
                p.getUsuario().getNombreCompleto();
                log.debug("  -> profesional id={}, nombre={}, centroId={}",
                    p.getId(), p.getUsuario().getNombreCompleto(),
                    p.getCentroSalud() != null ? p.getCentroSalud().getId() : "NULL");
            }
        });
        return profesionales;
    }

    @Transactional(readOnly = true)
    public PerfilProfesionalResponse obtenerPerfil(Long idUsuario) {
        Profesional p = profesionalRepository.findByUsuarioId(idUsuario)
                .orElseThrow(() -> new RuntimeException("Profesional no encontrado"));
        List<CentroSalud> centros = centroSaludRepository.findAll();
        return PerfilProfesionalResponse.builder()
                .id(p.getId())
                .nombreCompleto(p.getUsuario().getNombreCompleto())
                .email(p.getUsuario().getEmail())
                .telefono(p.getUsuario().getTelefono())
                .direccion(p.getUsuario().getDireccion())
                .tipoProfesional(p.getUsuario().getTipoProfesional() != null ? p.getUsuario().getTipoProfesional().name() : null)
                .especialidad(p.getUsuario().getEspecialidad())
                .numeroLicencia(p.getUsuario().getNumeroLicencia())
                .horarioAtencion(p.getHorarioAtencion())
                .fotoPerfil(p.getUsuario().getFotoPerfil())
                .centroActual(p.getCentroSalud())
                .centrosDisponibles(centros)
                .build();
    }

    @Transactional
    public void asignarCentro(Long idUsuario, Long idCentro) {
        Profesional p = profesionalRepository.findByUsuarioId(idUsuario)
                .orElseThrow(() -> new RuntimeException("Profesional no encontrado"));
        CentroSalud c = centroSaludRepository.findById(idCentro)
                .orElseThrow(() -> new RuntimeException("Centro de salud no encontrado"));
        p.setCentroSalud(c);
    }

    @Transactional
    public void actualizarFoto(Long idUsuario, String fileName) {
        Profesional p = profesionalRepository.findByUsuarioId(idUsuario)
                .orElseThrow(() -> new RuntimeException("Profesional no encontrado"));
        p.getUsuario().setFotoPerfil(fileName);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerDisponibilidad(Long idProfesional, Long idCentro, LocalDate fecha) {
        DiaSemana dia = toDiaSemana(fecha.getDayOfWeek());

        List<DisponibilidadProfesional> slots = disponibilidadRepository
                .findByProfesionalIdAndActivaTrue(idProfesional)
                .stream()
                .filter(d -> d.getCentroSalud().getId().equals(idCentro) && d.getDiaSemana() == dia)
                .toList();

        if (slots.isEmpty()) {
            return List.of();
        }

        List<Map<String, Object>> horarios = new ArrayList<>();
        for (DisponibilidadProfesional slot : slots) {
            List<Cita> citasOcupadas = citaRepository.findByProfesionalIdAndFechaHoraBetween(
                    idProfesional, fecha.atTime(slot.getHoraInicio()), fecha.atTime(slot.getHoraFin()));

            LocalTime inicio = slot.getHoraInicio();
            int duracion = slot.getDuracionTurnoMinutos() != null ? slot.getDuracionTurnoMinutos() : 15;

            while (inicio.plusMinutes(duracion).isBefore(slot.getHoraFin()) || inicio.plusMinutes(duracion).equals(slot.getHoraFin())) {
                LocalTime fin = inicio.plusMinutes(duracion);
                LocalTime finalInicio = inicio;

                Optional<Cita> citaOcupada = citasOcupadas.stream()
                        .filter(c -> {
                            LocalTime cInicio = c.getFechaHora().toLocalTime();
                            LocalTime cFin = c.getFechaHora().plusMinutes(c.getDuracion()).toLocalTime();
                            return finalInicio.isBefore(cFin) && cInicio.isBefore(fin);
                        })
                        .findFirst();

                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("hora", inicio.toString().substring(0, 5));
                entry.put("estado", citaOcupada.isPresent() ? "OCUPADO" : "DISPONIBLE");
                entry.put("idTurno", citaOcupada.map(Cita::getId).orElse(null));

                if (citaOcupada.isPresent()) {
                    Cita c = citaOcupada.get();
                    try {
                        String nombrePaciente = c.getSolicitud().getPaciente().getUsuario().getNombreCompleto();
                        entry.put("paciente", nombrePaciente);
                    } catch (Exception e) {
                        entry.put("paciente", "Paciente");
                    }
                } else {
                    entry.put("paciente", null);
                }

                horarios.add(entry);
                inicio = fin;
            }
        }

        return horarios;
    }

    private DiaSemana toDiaSemana(DayOfWeek dow) {
        switch (dow) {
            case MONDAY:    return DiaSemana.LUNES;
            case TUESDAY:   return DiaSemana.MARTES;
            case WEDNESDAY: return DiaSemana.MIERCOLES;
            case THURSDAY:  return DiaSemana.JUEVES;
            case FRIDAY:    return DiaSemana.VIERNES;
            case SATURDAY:  return DiaSemana.SABADO;
            case SUNDAY:    return DiaSemana.DOMINGO;
            default: throw new IllegalArgumentException("Día inválido: " + dow);
        }
    }
}
