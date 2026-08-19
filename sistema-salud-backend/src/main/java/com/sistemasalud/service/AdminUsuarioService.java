package com.sistemasalud.service;

import com.sistemasalud.dto.response.UsuarioAdminResponse;
import com.sistemasalud.entity.CentroSalud;
import com.sistemasalud.entity.Paciente;
import com.sistemasalud.entity.Profesional;
import com.sistemasalud.entity.Secretario;
import com.sistemasalud.entity.Usuario;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.repository.CentroSaludRepository;
import com.sistemasalud.repository.PacienteRepository;
import com.sistemasalud.repository.ProfesionalRepository;
import com.sistemasalud.repository.SecretarioRepository;
import com.sistemasalud.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class AdminUsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PacienteRepository pacienteRepository;
    private final ProfesionalRepository profesionalRepository;
    private final SecretarioRepository secretarioRepository;
    private final CentroSaludRepository centroSaludRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificacionService notificacionService;

    @Transactional(readOnly = true)
    public List<UsuarioAdminResponse> listarUsuarios() {
        Map<Long, Paciente> pacientes = pacienteRepository.findAllWithUsuario()
                .stream().filter(p -> p.getUsuario() != null)
                .collect(Collectors.toMap(p -> p.getUsuario().getId(), Function.identity(), (a, b) -> a));
        Map<Long, Profesional> profesionales = profesionalRepository.findAllWithUsuario()
                .stream().filter(p -> p.getUsuario() != null)
                .collect(Collectors.toMap(p -> p.getUsuario().getId(), Function.identity(), (a, b) -> a));
        Map<Long, Secretario> secretarios = secretarioRepository.findAll()
                .stream().filter(s -> s.getUsuario() != null)
                .collect(Collectors.toMap(s -> s.getUsuario().getId(), Function.identity(), (a, b) -> a));

        return usuarioRepository.findAll().stream()
                .map(u -> toResponse(u, pacientes.get(u.getId()), profesionales.get(u.getId()), secretarios.get(u.getId())))
                .toList();
    }

    @Transactional
    public void restablecerPassword(Long idUsuario, String nuevaPassword) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con ID: " + idUsuario));
        usuario.setPassword(passwordEncoder.encode(nuevaPassword.trim()));
        usuarioRepository.save(usuario);
        notificacionService.crearNotificacion(usuario,
                "Contraseña restablecida",
                "Tu contraseña fue restablecida por el administrador. Usá la nueva contraseña que te fue proporcionada para acceder al sistema.",
                null);
    }

    @Transactional
    public void cambiarEstado(Long idUsuario, boolean activo) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con ID: " + idUsuario));
        usuario.setActivo(activo);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void asignarCentroSecretario(Long idUsuario, Long idCentroSalud) {
        Secretario secretario = secretarioRepository.findByUsuarioId(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("El usuario no es secretario de un centro"));
        if (idCentroSalud == null) {
            secretario.setCentroSalud(null);
        } else {
            CentroSalud centro = centroSaludRepository.findById(idCentroSalud)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Centro de salud no encontrado con ID: " + idCentroSalud));
            secretario.setCentroSalud(centro);
        }
        secretarioRepository.save(secretario);
    }

    private UsuarioAdminResponse toResponse(Usuario u, Paciente paciente, Profesional profesional, Secretario secretario) {
        UsuarioAdminResponse.UsuarioAdminResponseBuilder b = UsuarioAdminResponse.builder()
                .id(u.getId())
                .nombreCompleto(u.getNombreCompleto())
                .email(u.getEmail())
                .tipoUsuario(u.getTipoUsuario().name())
                .tipoProfesional(u.getTipoProfesional() != null ? u.getTipoProfesional().name() : null)
                .especialidad(u.getEspecialidad())
                .activo(Boolean.TRUE.equals(u.getActivo()))
                .fechaRegistro(u.getFechaRegistro());
        if (paciente != null) {
            b.idPaciente(paciente.getId())
                    .tipoDocumento(paciente.getTipoDocumento())
                    .numDocumento(paciente.getNumDocumento())
                    .fechaNacimiento(paciente.getFechaNacimiento())
                    .obraSocial(paciente.getObraSocial() != null ? paciente.getObraSocial().getNombre() : null)
                    .consentimientoOk(paciente.getConsentimientoOk());
        }
        if (profesional != null) b.idProfesional(profesional.getId());
        if (secretario != null) {
            b.idSecretario(secretario.getId());
            if (secretario.getCentroSalud() != null) {
                b.idCentroSalud(secretario.getCentroSalud().getId());
                b.nombreCentroSalud(secretario.getCentroSalud().getNombre());
            }
        }
        return b.build();
    }
}