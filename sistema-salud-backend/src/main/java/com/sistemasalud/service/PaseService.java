package com.sistemasalud.service;

import com.sistemasalud.dto.response.PaseGuardiaResponse;
import com.sistemasalud.entity.Cita;
import com.sistemasalud.entity.CentroSalud;
import com.sistemasalud.entity.Paciente;
import com.sistemasalud.entity.Profesional;
import com.sistemasalud.entity.Solicitud;
import com.sistemasalud.entity.Usuario;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.repository.CitaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Service @RequiredArgsConstructor
public class PaseService {

    private static final String ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final CitaRepository citaRepository;

    @Value("${pase.base-url:http://localhost:3000}")
    private String baseUrl;

    public String generarCodigoPase() {
        String codigo;
        do {
            StringBuilder sb = new StringBuilder(10);
            for (int i = 0; i < 10; i++) sb.append(ALFABETO.charAt(RANDOM.nextInt(ALFABETO.length())));
            codigo = sb.toString();
        } while (citaRepository.findByCodigoPase(codigo).isPresent());
        return codigo;
    }

    public String linkPase(String codigoPase) {
        if (codigoPase == null || codigoPase.isBlank()) return null;
        String base = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        return base + "/pase/" + codigoPase;
    }

    @Transactional(readOnly = true)
    public PaseGuardiaResponse obtenerPase(String codigoPase) {
        Cita cita = buscarPorCodigo(codigoPase);
        return toResponse(cita);
    }

    @Transactional
    public PaseGuardiaResponse marcarPresentado(String codigoPase) {
        Cita cita = buscarPorCodigo(codigoPase);
        if (cita.getFechaPresentacion() == null) {
            cita.setFechaPresentacion(LocalDateTime.now());
            if (cita.getEstado() == null || cita.getEstado().equals("PROGRAMADA")) {
                cita.setEstado("PRESENTE");
            }
            citaRepository.save(cita);
        }
        return toResponse(cita);
    }

    private Cita buscarPorCodigo(String codigoPase) {
        if (codigoPase == null || codigoPase.isBlank())
            throw new RecursoNoEncontradoException("Código de pase inválido");
        return citaRepository.findByCodigoPase(codigoPase.toUpperCase())
                .orElseThrow(() -> new RecursoNoEncontradoException("Pase no encontrado para el código indicado"));
    }

    private PaseGuardiaResponse toResponse(Cita cita) {
        Solicitud s = cita.getSolicitud();
        Paciente p = s != null ? s.getPaciente() : null;
        Usuario u = p != null ? p.getUsuario() : null;
        Profesional prof = cita.getProfesional();
        CentroSalud centro = cita.getCentroSalud() != null ? cita.getCentroSalud()
                : (s != null ? s.getCentroSalud() : null);

        String codigo = cita.getCodigoPase() != null ? cita.getCodigoPase().toUpperCase() : null;
        return PaseGuardiaResponse.builder()
                .codigoPase(codigo)
                .linkPase(linkPase(codigo))
                .folio(s != null ? s.getFolio() : null)
                .solicitudId(s != null ? s.getId() : null)
                .titulo(s != null ? s.getTitulo() : null)
                .descripcion(s != null ? s.getDescripcion() : null)
                .anamnesis(s != null ? s.getAnamnesis() : null)
                .resumenBreve(s != null ? s.getResumenBreve() : null)
                .prioridad(s != null && s.getPrioridad() != null ? s.getPrioridad().name() : null)
                .emergencia(s != null && Boolean.TRUE.equals(s.getEmergencia()))
                .nombrePaciente(u != null ? u.getNombreCompleto() : null)
                .tipoDocumento(p != null ? p.getTipoDocumento() : null)
                .numDocumento(p != null ? p.getNumDocumento() : null)
                .edadPaciente(p != null && p.getFechaNacimiento() != null
                        ? Math.max(0, LocalDate.now().getYear() - p.getFechaNacimiento().getYear()) : null)
                .obraSocial(p != null && p.getObraSocial() != null ? p.getObraSocial().getNombre() : null)
                .fechaTurno(cita.getFechaHora())
                .duracionTurno(cita.getDuracion())
                .modalidad(cita.getModalidad() != null ? cita.getModalidad().name() : null)
                .nombreProfesional(prof != null && prof.getUsuario() != null ? prof.getUsuario().getNombreCompleto() : null)
                .idCentro(centro != null ? centro.getId() : null)
                .nombreCentro(centro != null ? centro.getNombre() : null)
                .direccionCentro(centro != null ? centro.getDireccion() : null)
                .telefonoCentro(centro != null ? centro.getTelefono() : null)
                .emailCentro(centro != null ? centro.getEmailInstitucional() : null)
                .estadoCita(cita.getEstado())
                .fechaPresentacion(cita.getFechaPresentacion())
                .indicaciones("Concurre con tu documento de identidad y este pase (código o QR) al menos 15 minutos antes del turno. Presentá el comprobante en la recepción de " + (centro != null ? centro.getNombre() : "la institución") + ".")
                .build();
    }
}