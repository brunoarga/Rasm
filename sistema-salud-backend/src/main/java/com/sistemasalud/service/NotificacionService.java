package com.sistemasalud.service;

import com.sistemasalud.dto.response.NotificacionResponse;
import com.sistemasalud.entity.Cita;
import com.sistemasalud.entity.Notificacion;
import com.sistemasalud.entity.Paciente;
import com.sistemasalud.entity.Solicitud;
import com.sistemasalud.entity.Usuario;
import com.sistemasalud.enums.TipoUsuario;
import com.sistemasalud.repository.NotificacionRepository;
import com.sistemasalud.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service @RequiredArgsConstructor
public class NotificacionService {
    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;

    @Transactional
    public Notificacion crearNotificacion(Usuario u, String titulo, String msg, Solicitud s) {
        Notificacion n = notificacionRepository.save(Notificacion.builder().usuario(u).titulo(titulo).mensaje(msg).solicitud(s).leida(false).fechaEnvio(LocalDateTime.now()).build());
        emailService.enviarEmailNotificacion(u.getEmail(), titulo, msg);
        return n;
    }

    @Transactional
    public void notificarNuevoTurno(Paciente paciente, Cita cita) {
        String msg = String.format("Tu profesional ha agendado tu próximo turno para el %s a las %s.",
                cita.getFechaHora().toLocalDate(),
                cita.getFechaHora().toLocalTime());
        crearNotificacion(paciente.getUsuario(), "Próximo turno agendado", msg, cita.getSolicitud());
    }

    @Transactional
    public void crearNotificacionParaProfesionales(String titulo, String msg, Solicitud s) {        usuarioRepository.findAll().stream().filter(u -> u.getTipoUsuario() == TipoUsuario.PROFESIONAL && u.getActivo()).forEach(prof -> notificacionRepository.save(Notificacion.builder().usuario(prof).titulo(titulo).mensaje(msg).solicitud(s).leida(false).fechaEnvio(LocalDateTime.now()).build()));
    }

    @Transactional(readOnly = true)
    public List<NotificacionResponse> obtenerNotificaciones(Long idUsuario) {
        return notificacionRepository.findByUsuarioIdOrderByFechaEnvioDesc(idUsuario)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<NotificacionResponse> obtenerNoLeidas(Long idUsuario) {
        return notificacionRepository.findByUsuarioIdAndLeidaFalseOrderByFechaEnvioDesc(idUsuario)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public long contarNoLeidas(Long idUsuario) {
        return notificacionRepository.countByUsuarioIdAndLeidaFalse(idUsuario);
    }

    @Transactional
    public void marcarComoLeida(Long id) {
        Notificacion n = notificacionRepository.findById(id).orElseThrow(() -> new com.sistemasalud.exception.RecursoNoEncontradoException("Notificacion no encontrada"));
        n.setLeida(true); notificacionRepository.save(n);
    }

    private NotificacionResponse toResponse(Notificacion n) {
        Solicitud s = n.getSolicitud();
        String pacienteNombre = s != null && s.getPaciente() != null
                ? s.getPaciente().getUsuario().getNombreCompleto() : null;
        return NotificacionResponse.builder()
                .id(n.getId()).titulo(n.getTitulo()).mensaje(n.getMensaje())
                .leida(n.getLeida()).fechaEnvio(n.getFechaEnvio())
                .solicitudId(s != null ? s.getId() : null)
                .solicitudTitulo(s != null ? s.getTitulo() : null)
                .pacienteNombre(pacienteNombre)
                .build();
    }
}
