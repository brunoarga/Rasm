package com.sistemasalud.service;

import com.sistemasalud.dto.request.CrearPacienteRequest;
import com.sistemasalud.entity.*;
import com.sistemasalud.enums.TipoUsuario;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.exception.SolicitudInvalidaException;
import com.sistemasalud.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service @RequiredArgsConstructor @Slf4j
public class PacienteService {
    private final UsuarioRepository usuarioRepository;
    private final PacienteRepository pacienteRepository;
    private final ObraSocialRepository obraSocialRepository;
    private final ProfesionalRepository profesionalRepository;
    private final CentroSaludRepository centroSaludRepository;
    private final ConsentimientoRepository consentimientoRepository;
    private final PasswordEncoder passwordEncoder;

    private String resolveEmail(CrearPacienteRequest r) {
        if (r.getEmail() != null && !r.getEmail().isBlank()) return r.getEmail().trim();
        String placeholder = "paciente." + System.currentTimeMillis() + "@sistemasalud.com";
        log.info("Email no proporcionado, se genera placeholder: {}", placeholder);
        return placeholder;
    }

    private String resolvePassword(CrearPacienteRequest r) {
        if (r.getPassword() != null && !r.getPassword().isBlank()) return r.getPassword();
        log.info("Password no proporcionada, se usa default");
        return "bienvenido123";
    }

    private String resolveNombreCompleto(CrearPacienteRequest r) {
        if (r.getNombreCompleto() != null && !r.getNombreCompleto().isBlank())
            return r.getNombreCompleto().trim();
        String nombre = r.getNombre() != null ? r.getNombre().trim() : "";
        String apellido = r.getApellido() != null ? r.getApellido().trim() : "";
        String completo = (nombre + " " + apellido).trim();
        return completo.isBlank() ? "Paciente" : completo;
    }

    private String resolveDocumento(CrearPacienteRequest r) {
        return r.getNumDocumento() != null ? r.getNumDocumento() : r.getNumeroDocumento();
    }

    private Long resolveObraSocialId(CrearPacienteRequest r) {
        return r.getIdObraSocial() != null ? r.getIdObraSocial() : r.getObraSocialId();
    }

    @Transactional
    public Paciente crearPaciente(CrearPacienteRequest r) {
        String email = resolveEmail(r);
        if (usuarioRepository.existsByEmail(email))
            throw new SolicitudInvalidaException("El email ya esta registrado");

        String password = resolvePassword(r);
        String doc = resolveDocumento(r);
        if (doc != null && pacienteRepository.existsByNumDocumento(doc))
            throw new SolicitudInvalidaException("El numero de documento ya esta registrado");

        String nombreCompleto = resolveNombreCompleto(r);

        Usuario usuario = Usuario.builder()
                .nombreCompleto(nombreCompleto).email(email)
                .password(passwordEncoder.encode(password))
                .telefono(r.getTelefono()).direccion(r.getDireccion())
                .tipoUsuario(TipoUsuario.PACIENTE).activo(true)
                .fechaRegistro(LocalDateTime.now()).emailConfirmado(true).build();
        usuario = usuarioRepository.save(usuario);

        Long idOS = resolveObraSocialId(r);
        ObraSocial os = idOS != null
                ? obraSocialRepository.findById(idOS).orElse(null) : null;

        Paciente paciente = Paciente.builder().usuario(usuario)
                .fechaNacimiento(r.getFechaNacimiento() != null ? LocalDate.parse(r.getFechaNacimiento()) : null)
                .tipoDocumento(r.getTipoDocumento()).numDocumento(doc)
                .obraSocial(os).numeroAfiliado(r.getNumeroAfiliado()).planCobertura(r.getPlanCobertura())
                .consentimientoOk(true).fechaConsentimiento(LocalDate.now()).build();
        return pacienteRepository.save(paciente);
    }

    @Transactional
    public Paciente aceptarConsentimiento(Long idUsuario) {
        Paciente paciente = pacienteRepository.findByUsuarioId(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));
        paciente.setConsentimientoOk(true);
        paciente.setFechaConsentimiento(LocalDate.now());
        Paciente guardado = pacienteRepository.save(paciente);
        consentimientoRepository.save(Consentimiento.builder()
                .paciente(guardado).version("1.0").aceptado(true)
                .fechaAceptacion(LocalDateTime.now()).build());
        return guardado;
    }

    @Transactional
    public Paciente crearPacientePorProfesional(CrearPacienteRequest r, Long idUsuarioProfesional) {
        Paciente paciente = crearPaciente(r);
        Profesional prof = profesionalRepository.findByUsuarioId(idUsuarioProfesional)
                .orElseThrow(() -> new RecursoNoEncontradoException("Profesional no encontrado"));
        paciente.setProfesionalRegistra(prof);

        if (r.getCentroSaludId() != null) {
            log.info("centroSaludId recibido: {} (asociación pendiente de implementar en entidad Paciente)", r.getCentroSaludId());
        }

        return pacienteRepository.save(paciente);
    }
}
